import { request } from "graphql-request"
import { invalidLogin, unconfirmedEmail } from "./errorMessages";
import { User } from "../../entity/User";
import { createTypeormConnection } from "../../utils/createTypeormConnection";

const email = "test@example.com"
const password = "test123"

const registerMutation = (e: string, p: string) => `
  mutation {
    register(email: "${e}", password: "${p}") {
      path
      message
    }
  }
`

const loginMutation = (e: string, p: string) => `
  mutation {
    login(email: "${e}", password: "${p}") {
      path
      message
    }
  }
`

const loginExpectError = async (e: string, p: string, errMsg: string) => {
  const response = await request(
    process.env.TEST_HOST as string,
    loginMutation(e, p)
  )
  expect(response).toEqual({
    login: [
      { path: "email", message: errMsg }
    ]
  })
}

beforeAll(async () => {
  await createTypeormConnection()
})

describe("User Login", async () => {
  it("denies invalid logins", async () => {
    loginExpectError("non@existant.com", "IDontExist", invalidLogin)
  })

  it("prompts users to confirm their email", async () => {
    await request(process.env.TEST_HOST as string, registerMutation(email, password))
    await loginExpectError(email, password, unconfirmedEmail)

    await User.update({ email }, { confirmed: true })

    const updatedResponse = await request(
      process.env.TEST_HOST as string,
      loginMutation(email, password)
    )
    expect(updatedResponse).toEqual({
      login: null
    })
  })

  it("let's users log in", async () => {
    // s
  })
})