const fs = require('fs')
const dataString = fs.readFileSync('./test/test_data/fixturesData.json', 'utf8');
const fixturesData = JSON.parse(dataString)
const seedData = require('../seeds/seedData')
const db = require('../src/db.js')
const config = require('../src/config.js')
const knex = db(config.TEST_DB_URL)
async function populateDB() {
    return seedData(fixturesData, knex)
}
module.exports = {
    knex,
    populateDB,
    fixturesData,
}
