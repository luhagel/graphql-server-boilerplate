import { Connection } from "typeorm";
import { User } from "../../entity/User";
import { createTypeormConnection } from "../../utils/createTypeormConnection";
import TestClient from "../../utils/testClient";

const email = "test@example.com"
const password = "test123"

let conn: Connection
beforeAll(async () => {
  conn = await createTypeormConnection()
  await User.create({
    email,
    password,
    confirmed: true
  }).save()
})

describe("Logout Mutation", () => {
  it("logs out the current user", async () => {
    const client = new TestClient(process.env.TEST_HOST as string)
    await client.login(email, password)
    await client.me()
    await client.logout()

    const response = await client.me()

    expect(response.data.me).toBeNull()
  })
})

afterAll(async () => {
  await conn.close()
})