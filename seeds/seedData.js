const fjs = require('flatted/cjs');
const { parse, stringify } = fjs
const fs = require('fs')
const db = require('../src/db')
const knex = db()
const dataString = fs.readFileSync('./seeds/flattenedData.json', 'utf8');
let data = parse(dataString);
//statuses

function handleError(e) {
    console.error('ERROR', e.message)
}

const seedData = async () => {

    await knex('project_statuses').insert(data.statuses)
        .then(res => {
            console.log('statuses inserted', res.rowCount)
        })
    await knex('roles').insert(data.roles)
        .then(res => {
            console.log('roles inserted', res.rowCount)
        })

    const users = data.users.map(i => {
        const { role, projects, ...rest } = i
        return rest
    })
    await knex('users').insert(users)
        .then(res => {
            console.log('users inserted', res.rowCount)
        })
        .catch(handleError)

    const projects = data.projects.map(i => {
        const { status, contractors, client, manager, ...rest } = i
        return rest
    })
    await knex('projects').insert(projects)
        .then(res => {
            console.log('projects inserted', res.rowCount)
        })
        .catch(handleError)


    let contractorRecords = data.projects.reduce(
        (acc, project) => {
            project.contractors.forEach(c => {
                acc.push({ project_id: project.id, contractor_id: c.id })
            })
            return acc
        }, [])

    contractorRecords = contractorRecords.filter((i, index, arr) => {
        const existing = arr.findIndex(e => e.contractor_id === i.contractor_id
            && e.project_id === i.project_id)
        if (existing !== index) {
            console.log('duplicate', i)
            return false
        }
        return true
    })
    
    // update sequences
    await knex.raw(`
    SELECT setval('projects_id_seq', max(id))
    FROM  projects
    `)
        .then(res => {
            console.log('sequences updated', res.rowCount)
        })
        .catch(handleError)
    await knex.raw(`
        SELECT setval('users_id_seq', max(id))
        FROM users
        `)
        .then(res => {
            console.log('sequences updated', res.rowCount)
        })
        .catch(handleError)



    await knex.raw(
        knex('contractors_projects').insert(contractorRecords).
            toString()
        // + ' ON CONFLICT DO NOTHING'
    )
        .then(res => {
            console.log('contractors_projects inserted', res.rowCount)
        })
        .catch(handleError)

    // console.log(contractorRecords)

}

seedData().finally(() => {
    console.log('Done')
    knex.destroy()
})

