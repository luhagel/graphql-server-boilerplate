import { ResolverMap } from "../../types/graphql-utils";
import bcrypt from 'bcrypt'
import { User } from "../../entity/User";

export const resolvers: ResolverMap = {
  Query: {
    bye: () => 'bye'
  },
  Mutation: {
    register: async (_, { email, password }: GQL.IRegisterOnMutationArguments) => {
      const userExists = await User.findOne({
        where: { email },
        select: ['id']
      })
      if (userExists) {
        return [
          {
            path: 'email',
            message: 'already taken'
          }
        ]
      }
      const hashedPassword = await bcrypt.hash(password, 10)
      const user = User.create({
        email,
        password: hashedPassword
      })
      await user.save()
      return null
    }
  }
}