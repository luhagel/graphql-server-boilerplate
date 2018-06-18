import axios from "axios"
import { Connection } from "typeorm";
import { User } from "../../entity/User";
import { createTypeormConnection } from "../../utils/createTypeormConnection";

const email = "test@example.com"
const password = "test123"

const loginMutation = (e: string, p: string) => `
  mutation {
    login(email: "${e}", password: "${p}") {
      path
      message
    }
  }
`

const meQuery = `
  {
    me {
      id
      email
    }
  }
`

let conn: Connection
beforeAll(async () => {
  conn = await createTypeormConnection()
  await User.create({
    email,
    password,
    confirmed: true
  }).save()
})

describe("Me Query", () => {
  it("returns if not logged in", async () => {
    // later
  })
  it("gets the current user", async () => {
    await axios.post(
      process.env.TEST_HOST as string,
      {
        query: loginMutation(email, password)
      },
      {
        withCredentials: true
      }
    )

    const response = await axios.post(process.env.TEST_HOST as string, { query: meQuery }, { withCredentials: true })
    expect(response.data.data.me.email).toEqual(email)
  })
})

afterAll(async () => {
  await conn.close()
})