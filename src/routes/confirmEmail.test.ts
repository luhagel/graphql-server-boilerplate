import fetch from "node-fetch"

describe("Email Confirmation Route", async () => {
  it("returns invalid for an invalid key", async () => {
    const url = `${process.env.TEST_HOST}/confirm/123`
    const response = await fetch(url)
    const text = await response.text()
    expect(text).toEqual("invalid")
  })
})