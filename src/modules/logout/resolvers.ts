import { ResolverMap } from "../../types/graphql-utils"

export const resolvers: ResolverMap = {
  Query: {
    dummy: () => "logout"
  },
  Mutation: {
    logout: async (_, __, { session }) => {
      return new Promise((res) => session.destroy((err) => {
        if (err) {
          console.log("logout err: ", err)
        }
        res(true)
      }))
    }
  }
}