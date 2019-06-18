
const knex = require('knex')
const { PORT, DB_URL } = require('./config')
const db = () => knex({
    client: 'pg',
    connection: DB_URL
})
module.exports = db;
