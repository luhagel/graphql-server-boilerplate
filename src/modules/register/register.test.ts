import { request } from 'graphql-request'
import { User } from "../../entity/User";
import { emailTooShort, invalidEmail, passwordTooShort } from './errorMessages';
import { createTypeormConnection } from '../../utils/createTypeormConnection';

const email = "test@example.com"
const password = "test123"

const mutation = (e: string, p: string) => `
  mutation {
    register(email: "${e}", password: "${p}") {
      path
      message
    }
  }
`

beforeAll(async () => {
  await createTypeormConnection()
})

describe("User Creation", async () => {
  it("doesn't allow duplicate emails", async () => {
    // Check creaton functionality
    const response = await request(process.env.TEST_HOST as string, mutation(email, password))
    expect(response).toEqual({ register: null })
    const users = await User.find({ where: { email } })
    expect(users).toHaveLength(1)
    const user = users[0]
    expect(user.email).toEqual(email)
    expect(user.password).not.toEqual(password)

    const duplicateResponse: any = await request(process.env.TEST_HOST as string, mutation(email, password))
    expect(duplicateResponse.register).toHaveLength(1)
    expect(duplicateResponse.register[0].path).toEqual('email')
  })

  it("catches bad emails", async () => {
    const badEmailResponse: any = await request(process.env.TEST_HOST as string, mutation('b', password))
    expect(badEmailResponse).toEqual({
      register: [
        { "message": emailTooShort, "path": "email" },
        { "message": invalidEmail, "path": "email" }
      ]
    })
  })

  it("catches bad passwords", async () => {
    const badPasswordResponse: any = await request(process.env.TEST_HOST as string, mutation(email, "12"))
    expect(badPasswordResponse).toEqual({
      register: [
        { "message": passwordTooShort, "path": "password" }
      ]
    })
  })

  it("catches bad passwords & emails", async () => {
    const badResponse: any = await request(process.env.TEST_HOST as string, mutation('b', '12'))
    expect(badResponse).toEqual({
      register: [
        { "message": emailTooShort, "path": "email" },
        { "message": invalidEmail, "path": "email" },
        { "message": passwordTooShort, "path": "password" }
      ]
    })
  })
})
