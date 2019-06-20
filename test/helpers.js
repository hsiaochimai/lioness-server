const fs = require('fs')
const dataString = fs.readFileSync('./test/test_data/fixturesData.json', 'utf8');
const fixturesData = JSON.parse(dataString)
const { clearData,seedData } = require('../seeds/seedData')
const db = require('../src/db.js')
const config = require('../src/config.js')
async function populateDB(db) {
    await clearData(db)
    return seedData(fixturesData, db)
}
const makeTestKnex = () => db(config.TEST_DB_URL)
module.exports = {
    makeTestKnex,
    populateDB,
    fixturesData,
}
