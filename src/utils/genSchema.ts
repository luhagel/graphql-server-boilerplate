import { mergeSchemas, makeExecutableSchema } from "graphql-tools"
import { GraphQLSchema } from "graphql"
import { importSchema } from "graphql-import"
import fs from "fs"
import path from "path"

export const genSchema = () => {
  const schemas: GraphQLSchema[] = [];
  const folders = fs.readdirSync(path.join(__dirname, "../modules"))
  folders.forEach((folder) => {
    const { resolvers } = require(path.join(__dirname, `../modules/${folder}/resolvers`))
    const typeDefs = importSchema(path.join(__dirname, `../modules/${folder}/schema.graphql`))

    schemas.push(makeExecutableSchema({ resolvers, typeDefs }))
  })

  return mergeSchemas({ schemas })
}