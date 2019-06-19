
const knex = require('knex')
const { PORT, DB_URL } = require('./config')
const db = (url = DB_URL) => knex({    
    client: 'pg',
    connection: url
})
module.exports = db;
