import { importSchema } from 'graphql-import'
import { GraphQLServer } from 'graphql-yoga'
import Redis from 'ioredis'

import { createTypeormConnection } from "./utils/createTypeormConnection"
import fs from 'fs';
import path from 'path'
import { mergeSchemas, makeExecutableSchema } from "graphql-tools"
import { GraphQLSchema } from 'graphql'
import { User } from './entity/User'

export default async () => {
  const schemas: GraphQLSchema[] = [];
  const folders = fs.readdirSync(path.join(__dirname, "./modules"))
  folders.forEach((folder) => {
    const { resolvers } = require(`./modules/${folder}/resolvers`)
    const typeDefs = importSchema(path.join(__dirname, `./modules/${folder}/schema.graphql`))

    schemas.push(makeExecutableSchema({ resolvers, typeDefs }))
  })

  const redis = new Redis()

  const server = new GraphQLServer({ schema: mergeSchemas({ schemas }), context: ({ request }) => ({ redis, url: `${request.protocol}://${request.host}` }) })

  server.express.get("/confirm/:id", async (req, res) => {
    const { id } = req.params
    const userId = await redis.get(id)
    await User.update({ id: userId }, { confirmed: true })
    res.send("ok")
  })

  await createTypeormConnection()

  const port = process.env.NODE_ENV === 'test' ? 0 : 4000
  const app = await server.start({ port })
  console.log(`Server is running on localhost:${port}`)

  return app
}