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
            console.log('statuses inserted')
        })
    await knex('roles').insert(data.roles)
        .then(res => {
            console.log('roles inserted')
        })

    const users = data.users.map(i => {
        const { role, projects, ...rest } = i
        return rest
    })
    await knex('users').insert(users)
        .then(res => {
            console.log('users inserted')
        })
        .catch(handleError)

    const projects = data.projects.map(i => {
        const { status, contractors, client, manager, ...rest } = i
        return rest
    })
    await knex('projects').insert(projects)
        .then(res => {
            console.log('projects inserted')
        })
        .catch(handleError)

    let contractorRecords = data.projects.reduce(
        (acc, project) => {
            project.contractors.forEach(c => {
                acc.push({ project_id: project.id, contractor_id: c.id })
            })
            return acc
        }, [])
    console.log('initial contractors:', contractorRecords.length)
    contractorRecords = [...new Set(contractorRecords)]
    console.log('unique contractors:', contractorRecords.length)

    await knex.raw(`
    SELECT 'SELECT SETVAL(' ||
       quote_literal(quote_ident(PGT.schemaname) || '.' || quote_ident(S.relname)) ||
       ', COALESCE(MAX(' ||quote_ident(C.attname)|| '), 1) ) FROM ' ||
       quote_ident(PGT.schemaname)|| '.'||quote_ident(T.relname)|| ';'
FROM pg_class AS S,
     pg_depend AS D,
     pg_class AS T,
     pg_attribute AS C,
     pg_tables AS PGT
WHERE S.relkind = 'S'
    AND S.oid = D.objid
    AND D.refobjid = T.oid
    AND D.refobjid = C.attrelid
    AND D.refobjsubid = C.attnum
    AND T.relname = PGT.tablename
ORDER BY S.relname;
    `)
        .then(res => {
            console.log('sequences updated')
        })
        .catch(handleError)

    // contractorRecords.forEach(async cr => {
    //     await knex('contractors_projects').insert(cr)
    //         .then(res => {
    //             console.log('contractors_projects inserted')
    //         })
    //         .catch(handleError)
    // })

    await knex('contractors_projects').insert(contractorRecords)
        .then(res => {
            console.log('contractors_projects inserted')
        })
        .catch(handleError)

    // console.log(contractorRecords)

}

seedData().finally(() => {
    console.log('Done')
    knex.destroy()
})

// data.statuses.forEach(i => {
// });
