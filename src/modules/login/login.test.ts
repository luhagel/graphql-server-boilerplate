import { invalidLogin, unconfirmedEmail } from "./errorMessages";
import { User } from "../../entity/User";
import { createTypeormConnection } from "../../utils/createTypeormConnection";
import { Connection } from "typeorm";
import TestClient from "../../utils/testClient";

const email = "test@example.com"
const password = "test123"

let conn: Connection
beforeAll(async () => {
  conn = await createTypeormConnection()
})

describe("User Login", async () => {
  const client = new TestClient(process.env.TEST_HOST as string)
  it("denies invalid logins", async () => {
    const response = await client.login("non@existant.com", "IDontExist")
    expect(response.data).toEqual({
      login: [
        { path: "email", message: invalidLogin }
      ]
    })
  })

  it("prompts users to confirm their email", async () => {
    await client.register(email, password)
    const response = await client.login(email, password)
    expect(response.data).toEqual({
      login: [
        { path: "email", message: unconfirmedEmail }
      ]
    })

    await User.update({ email }, { confirmed: true })

    const updatedResponse = await client.login(email, password)
    expect(updatedResponse.data).toEqual({
      login: null
    })
  })
})

afterAll(async () => {
  await conn.close()
})