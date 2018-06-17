import { ResolverMap } from "../../types/graphql-utils";
import bcrypt from 'bcrypt'
import { User } from "../../entity/User";
import * as yup from 'yup'
import { formatYupError } from "../../utils/formatYupError";
import { duplicateEmail, emailTooShort, invalidEmail } from "./errorMessages";

const schema = yup.object().shape({
  email: yup.string().min(3, emailTooShort).max(255).email(invalidEmail),
  password: yup.string().min(3).max(255)
})

export const resolvers: ResolverMap = {
  Query: {
    bye: () => 'bye'
  },
  Mutation: {
    register: async (_, args: GQL.IRegisterOnMutationArguments) => {
      try {
        await schema.validate(args, { abortEarly: false })
      } catch (error) {
        return formatYupError(error)
      }
      const { email, password } = args
      const userExists = await User.findOne({
        where: { email },
        select: ['id']
      })
      if (userExists) {
        return [
          {
            path: 'email',
            message: duplicateEmail
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