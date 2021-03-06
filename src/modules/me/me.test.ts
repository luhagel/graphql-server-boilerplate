import { Connection } from "typeorm";
import { User } from "../../entity/User";
import { createTypeormConnection } from "../../utils/createTypeormConnection";
import TestClient from "../../utils/testClient";

const email = "test@example.com"
const password = "test123"

let conn: Connection
let user: any
beforeAll(async () => {
  conn = await createTypeormConnection()
  user = await User.create({
    email,
    password,
    confirmed: true
  }).save()
})

describe("Me Query", () => {
  const client = new TestClient(process.env.TEST_HOST as string)

  it("returns if not logged in", async () => {
    const response = await client.me()
    expect(response.data.me).toBeNull()
  })
  it("gets the current user", async () => {
    await client.login(email, password)
    const response = await client.me()
    expect(response.data.me).toEqual({
      email,
      id: user.id
    })
  })
})

afterAll(async () => {
  await conn.close()
})