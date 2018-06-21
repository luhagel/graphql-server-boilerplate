import "reflect-metadata"
import "dotenv/config"
import { GraphQLServer } from "graphql-yoga"
import { createTypeormConnection } from "./utils/createTypeormConnection"
import session from "express-session"
import connectRedis from "connect-redis"

import redis from "./redis";
import { confirmEmail } from "./routes/confirmEmail";
import { genSchema } from "./utils/genSchema";
import { redisSessionPrefix } from "./constants";

const RedisStore = connectRedis(session)

export default async () => {

  const server = new GraphQLServer({
    schema: genSchema(),
    context: ({ request }) => ({
      redis,
      url: `${request.protocol}://${request.hostname}`,
      session: request.session,
      req: request
    })
  })

  server.express.use(
    session({
      store: new RedisStore({
        client: redis as any,
        prefix: redisSessionPrefix
      }),
      name: "qid",
      secret: process.env.SESSION_SECRET || "test123",
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
      }
    })
  )

  const cors = {
    credentials: true,
    origin: process.env.NODE_ENV === "test" ? "*" : process.env.FRONTEND_HOST
  }

  server.express.get("/confirm/:id", confirmEmail)

  await createTypeormConnection()

  const port = process.env.NODE_ENV === "test" ? 0 : 4000
  const app = await server.start({ cors, port })

  console.log(`Server is running on localhost:${port}`)
  return app
}