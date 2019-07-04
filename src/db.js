
const knex = require('knex')
const { PORT, DB_URL } = require('./config')

const dayjs = require('dayjs')
const advancedFormat = require('dayjs/plugin/advancedFormat')
const utc = require('dayjs/plugin/utc')

dayjs.extend(utc)
dayjs.extend(advancedFormat)
process.env.TZ = 'UTC'

const types = require('pg').types;
const TIMESTAMPTZ_OID = 1184;
const TIMESTAMP_OID = 1114;
types.setTypeParser(TIMESTAMPTZ_OID, val => {
    if (!val) {
        return null
    }
    return new Date(Date.parse("" + val + "+0000")).toISOString()
    // return dayjs.utc(val+ "+0000")
    // return val
});
types.setTypeParser(TIMESTAMP_OID, val => val);


const db = (url = DB_URL) => knex({
    client: 'pg',
    connection: url
})
module.exports = db;
