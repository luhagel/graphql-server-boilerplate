require("ts-node/register")

const { setup } = require('./setup.ts')

module.exports = async () => {
  if (!process.env.TEST_HOST) {
    await setup()
  }

  return null
}