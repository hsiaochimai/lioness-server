const fjs = require('flatted/cjs');
const { parse, stringify } = fjs
const fs = require('fs')
const db = require('../src/db')
const knex = db()
const dataString = fs.readFileSync('./seeds/flattenedData.json', 'utf8');
let data = parse(dataString);
//statuses
const seedData = async () => {

    await knex('project_statuses').insert(data.statuses)
        .then(res => {
            console.log('statuses inserted')
        });
    await knex('roles').insert(data.roles)
        .then(res => {
            console.log('roles inserted')
        });

}

seedData().finally(() => {
    console.log('Done')
    knex.destroy()
})

// data.statuses.forEach(i => {
// });
