const config = require('./src/config')
const parse = require('pg-connection-string').parse;
const info = parse(config.TEST_DB_URL)
const { host,
  port,
  database,
  username,
  password } = info
  console.log(info)
module.exports = {
  "migrationDirectory": "migrations",
  "driver": "pg",
  host,
  port,
  database,
  username,
  password,
  "ssl": false
}
