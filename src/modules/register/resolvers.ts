import { ResolverMap } from "../../types/graphql-utils"
import { User } from "../../entity/User";
import * as yup from "yup"
import { formatYupError } from "../../utils/formatYupError";
import { duplicateEmail, emailTooShort, invalidEmail } from "./errorMessages"
import { createConfirmEmailLink } from "../../utils/createConfirmEmailLink"

const schema = yup.object().shape({
  email: yup.string().min(3, emailTooShort).max(255).email(invalidEmail),
  password: yup.string().min(3).max(255)
})

export const resolvers: ResolverMap = {
  Query: {
    bye: () => "bye"
  },
  Mutation: {
    register: async (_, args: GQL.IRegisterOnMutationArguments, { redis, url }) => {
      try {
        await schema.validate(args, { abortEarly: false })
      } catch (error) {
        return formatYupError(error)
      }
      const { email, password } = args
      const userExists = await User.findOne({
        where: { email },
        select: ["id"]
      })
      if (userExists) {
        return [
          {
            path: "email",
            message: duplicateEmail
          }
        ]
      }
      const user = User.create({
        email,
        password
      })
      await user.save()
      createConfirmEmailLink(url, user.id, redis)
      return null
    }
  }
}