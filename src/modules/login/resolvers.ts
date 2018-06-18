import { ResolverMap } from "../../types/graphql-utils";
import { User } from "../../entity/User";
import bcrypt from "bcrypt";
import { invalidLogin, unconfirmedEmail } from "./errorMessages";

const errorResponse = [{
  path: "email",
  message: invalidLogin
}]

export const resolvers: ResolverMap = {
  Query: {
    hey: () => "heya"
  },
  Mutation: {
    login: async (_, { email, password }: GQL.ILoginOnMutationArguments, { session }) => {
      const user = await User.findOne({ where: { email } })
      if (!user) {
        return errorResponse
      }

      const valid = await bcrypt.compare(password, user.password)
      if (!valid) {
        return errorResponse
      }
      if (!user.confirmed) {
        return [{
          path: "email",
          message: unconfirmedEmail
        }]
      }

      session.userId = user.id
      return null

    }
  }
}