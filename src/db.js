
const knex = require('knex')
const { PORT, DB_URL } = require('./config')

const types = require('pg').types;
const TIMESTAMPTZ_OID = 1184;
const TIMESTAMP_OID = 1114;
types.setTypeParser(TIMESTAMPTZ_OID, val => val);
types.setTypeParser(TIMESTAMP_OID, val => val);

const db = (url = DB_URL) => knex({    
    client: 'pg',
    connection: url
})
module.exports = db;
