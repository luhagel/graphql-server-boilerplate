import { request } from 'graphql-request'
import { User } from "../../entity/User";
import startServer from '../../startServer';
import { emailTooShort, invalidEmail, passwordTooShort } from './errorMessages';

let getHost = () => ''

beforeAll(async () => {
  const app = await startServer()
  const { port } = app.address()
  getHost = () => `http://127.0.0.1:${port}`
})

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

describe("User Creation", async () => {
  it("doesn't allow duplicate emails", async () => {
    // Check creaton functionality
    const response = await request(getHost(), mutation(email, password))
    expect(response).toEqual({ register: null })
    const users = await User.find({ where: { email } })
    expect(users).toHaveLength(1)
    const user = users[0]
    expect(user.email).toEqual(email)
    expect(user.password).not.toEqual(password)

    const duplicateResponse: any = await request(getHost(), mutation(email, password))
    expect(duplicateResponse.register).toHaveLength(1)
    expect(duplicateResponse.register[0].path).toEqual('email')
  })

  it("catches bad emails", async () => {
    const badEmailResponse: any = await request(getHost(), mutation('b', password))
    expect(badEmailResponse).toEqual({
      register: [
        { "message": emailTooShort, "path": "email" },
        { "message": invalidEmail, "path": "email" }
      ]
    })
  })

  it("catches bad passwords", async () => {
    const badPasswordResponse: any = await request(getHost(), mutation(email, "12"))
    expect(badPasswordResponse).toEqual({
      register: [
        { "message": passwordTooShort, "path": "password" }
      ]
    })
  })

  it("catches bad passwords & emails", async () => {
    const badResponse: any = await request(getHost(), mutation('b', '12'))
    expect(badResponse).toEqual({
      register: [
        { "message": emailTooShort, "path": "email" },
        { "message": invalidEmail, "path": "email" },
        { "message": passwordTooShort, "path": "password" }
      ]
    })
  })
})
