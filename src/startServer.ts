import { GraphQLServer } from "graphql-yoga"
import { createTypeormConnection } from "./utils/createTypeormConnection"

import redis from "./redis";
import { confirmEmail } from "./routes/confirmEmail";
import { genSchema } from "./utils/genSchema";

export default async () => {

  const server = new GraphQLServer({
    schema: genSchema(),
    context: ({ request }) => ({
      redis,
      url: `${request.protocol}://${request.hostname}`
    })
  })

  server.express.get("/confirm/:id", confirmEmail)

  await createTypeormConnection()

  const port = process.env.NODE_ENV === "test" ? 0 : 4000
  const app = await server.start({ port })

  console.log(`Server is running on localhost:${port}`)
  return app
}