import { createConfirmEmailLink } from "./createConfirmEmailLink";
import { createTypeormConnection } from "./createTypeormConnection";
import { User } from "../entity/User";
import Redis from "ioredis"
import fetch from "node-fetch"
import { Connection } from "typeorm";

let userId: string
const redis = new Redis()

let conn: Connection

beforeAll(async () => {
  conn = await createTypeormConnection()
  const user = await User.create({
    email: "test@example.com",
    password: "test123"
  }).save()

  userId = user.id
})

describe("Email Confirmation", async () => {
  it("creates a confirmation link", async () => {
    const url = await createConfirmEmailLink(process.env.TEST_HOST as string, userId, redis)

    const response = await fetch(url)
    const text = await response.text()
    expect(text).toEqual("ok")
    const user = await User.findOne({ where: { id: userId } })
    expect((user as User).confirmed).toBeTruthy()

    const chunks = url.split("/")
    const key = chunks[chunks.length - 1]
    const value = await redis.get(key)
    expect(value).toBeNull()
  })
})

afterAll(async () => {
  await conn.close()
})