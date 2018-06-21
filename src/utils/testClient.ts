import rp from "request-promise"

export default class TestClient {
  url: string
  jar: any
  options: {
    json: boolean
    jar: any
    withCredentials: boolean
  }

  constructor(url: string) {
    this.url = url
    this.options = {
      json: true,
      jar: rp.jar(),
      withCredentials: true,
    }
  }

  async register(email: string, password: string) {
    return rp.post(this.url, {
      ...this.options,
      body: {
        query: `
          mutation {
            register(email: "${email}", password: "${password}") {
              path
              message
            }
          }
        `
      }
    })
  }

  async login(email: string, password: string) {
    return rp.post(this.url, {
      ...this.options,
      body: {
        query: `
          mutation {
            login(email: "${email}", password: "${password}") {
              path
              message
            }
          }
        `
      }
    })
  }

  async me() {
    return rp.post(this.url, {
      ...this.options,
      body: {
        query: `
          {
            me {
              id
              email
            }
          }
        `
      }
    })
  }

  async logout() {
    return rp.post(this.url, {
      ...this.options,
      body: {
        query: `
          mutation {
            logout
          }
        `
      }
    })
  }
}