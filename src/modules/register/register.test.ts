import { request } from "graphql-request"
import { User } from "../../entity/User";
import { emailTooShort, invalidEmail, passwordTooShort } from "./errorMessages";
import { createTypeormConnection } from "../../utils/createTypeormConnection";
import { Connection } from "typeorm";
import TestClient from "../../utils/testClient";

const email = "test@example.com"
const password = "test123"

let conn: Connection
beforeAll(async () => {
  conn = await createTypeormConnection()
})

describe("User Creation", async () => {
  const client = new TestClient(process.env.TEST_HOST as string)

  it("doesn't allow duplicate emails", async () => {
    // Check creation functionality
    const response = await client.register(email, password)
    expect(response.data).toEqual({ register: null })
    const users = await User.find({ where: { email } })
    expect(users).toHaveLength(1)
    const user = users[0]
    expect(user.email).toEqual(email)
    expect(user.password).not.toEqual(password)

    const duplicateResponse: any = await client.register(email, password)
    expect(duplicateResponse.data.register).toHaveLength(1)
    expect(duplicateResponse.data.register[0].path).toEqual("email")
  })

  it("catches bad emails", async () => {
    const badEmailResponse: any = await client.register("b", password)
    expect(badEmailResponse.data).toEqual({
      register: [
        { "message": emailTooShort, "path": "email" },
        { "message": invalidEmail, "path": "email" }
      ]
    })
  })

  it("catches bad passwords", async () => {
    const badPasswordResponse: any = await client.register(email, "12")
    expect(badPasswordResponse.data).toEqual({
      register: [
        { "message": passwordTooShort, "path": "password" }
      ]
    })
  })

  it("catches bad passwords & emails", async () => {
    const badResponse: any = await client.register("b", "12")
    expect(badResponse.data).toEqual({
      register: [
        { "message": emailTooShort, "path": "email" },
        { "message": invalidEmail, "path": "email" },
        { "message": passwordTooShort, "path": "password" }
      ]
    })
  })
})

afterAll(async () => {
  await conn.close()
})
