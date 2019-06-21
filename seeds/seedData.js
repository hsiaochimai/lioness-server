const fjs = require('flatted/cjs');
const { parse, stringify } = fjs
const fs = require('fs')
const db = require('../src/db')

function handleError(e) {
    console.error('ERROR', e.message)
}

const clearData = async (knex) => {
    return knex
        .raw('TRUNCATE contractors_projects, projects, users, project_statuses, roles RESTART IDENTITY CASCADE')
        .then(() => {
            console.log('data cleared')
        });
}

const seedData = async (data, knex) => {
    const now = new Date().getTime()

    await clearData(knex)

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

    if (!data.contractors_projects) { //if this is a flatted structure with related records


        let contractorRecords = data.projects.reduce(
            (acc, project) => {
                project.contractors.forEach(c => {
                    acc.push({ project_id: project.id, contractor_id: c.id })
                    console.log(acc[acc.length - 1])
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

        await knex.raw(
            knex('contractors_projects').insert(contractorRecords).
                toString()
            // + ' ON CONFLICT DO NOTHING'
        )
            .then(res => {
                console.log('contractors_projects inserted', res.rowCount)
            })
            .catch(handleError)
    }

    else {
        await
            knex('contractors_projects').insert(data.contractors_projects)
                .then(res => {
                    console.log('contractors_projects inserted', res.rowCount)
                })
                .catch(handleError)
    }

    // update sequences, otherwise INSERT would cause duplicate pkey errors 
    // because the generated ids are already taken
    await knex.raw(`
    SELECT setval('projects_id_seq', max(id))
    FROM  projects
    `)
        .then(res => {
            console.log('projects sequence updated', res.rowCount)
        })
        .catch(handleError)
    await knex.raw(`
        SELECT setval('users_id_seq', max(id))
        FROM users
        `)
        .then(res => {
            console.log('users sequence updated', res.rowCount)
        })
        .catch(handleError)



    const spentMillis = new Date().getTime() - now
    console.log(`seedData took ${(spentMillis / 1000).toFixed(3)} seconds`);


}

module.exports = { clearData, seedData }

if (require.main === module) { //if called as node seedData.js
    const knex = db()
    const dataString = fs.readFileSync('./seeds/flattenedData.json', 'utf8');
    let data = parse(dataString);

    seedData(data, knex).finally(() => {
        console.log('Done')
        knex.destroy()
    })
}    
