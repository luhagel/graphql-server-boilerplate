require("ts-node/register")

const { setup } = require('./setup.ts')

module.exports = async () => {
  await setup()

  return null
}