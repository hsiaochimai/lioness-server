require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')

const app = express()
const winston = require('winston');
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'info.log' })
  ]
});

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption))
app.use(cors())
app.use(helmet())


// app.use(function validateBearerToken(req, res, next) {
//   const apiToken = process.env.API_TOKEN
//   const authToken = req.get('Authorization')
// console.log(apiToken)
//   if (!authToken || authToken.split(' ')[1] !== apiToken) 
// {
// logger.error(`Unauthorized request to path: ${req.path}`);
//     return res.status(401).json({ error: 'Unauthorized request' })
//   }
//   // move to the next middleware
//   next()
// })

app.use(function errorHandler(error, req, res, next) {
  let response
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } }
  } else {
    console.error(error)
    response = { message: error.message, error }
  }
  res.status(500).json(response)
})

const SORT_ASC = 'ASC'
const SORT_DESC = 'DESC'
const ITEMS_PER_PAGE = 10

const projectsDefaultOptions = {
  statusFilter: null,
  searchQuery: null,
  budgetSort: SORT_ASC,
  dateTypeFilter: null,
  dateSort: null,
  afterDate: null,
  beforeDate: null,
  roleFilter: null,
  activeProjSortAsc: null,
  pageNumber: 1,
}

app.get('/api/projects', async (req, res) => {

  let requestOpts = {}
  const mergedOpts = { ...projectsDefaultOptions, ...requestOpts }
  const knex = app.get('db')

  const projects = knex('projects').select('*')

  if (mergedOpts.budgetSort) {
    projects.orderBy('budget', mergedOpts.budgetSort)
  }

  const begin = (mergedOpts.pageNumber - 1) * ITEMS_PER_PAGE
  projects.offset(begin)
  projects.limit(ITEMS_PER_PAGE)

  console.log(projects.toString())

  let result = []
  await projects.then(data => {
    result = data
  })

  let promises = []
  result.forEach(project => {
    const clientQuery = knex('users').select('*')
      .where('id', project.client_id)
      .first()
    console.log(clientQuery.toString())
    const p = clientQuery.then(user => {
      project.client = user
    })
    promises.push(p)
  })

  result.forEach(project => {
    const contractorsQuery = knex('users').select('*')
      // .where('project_id', id)
      .innerJoin('contractors_projects', function () {
        this.on('users.id', '=', 'contractors_projects.contractor_id')
          .andOn('contractors_projects.project_id', '=', project.id)
      })

    console.log(contractorsQuery.toString())
    const p = contractorsQuery.then(user => {
      project.contractors = project.contractors || []
      project.contractors.push(user)
    })
    promises.push(p)
  })

  await Promise.all(promises)

  // const numPages = Math.ceil(res.length / ITEMS_PER_PAGE)
  // const totalItemCount = res.length


  res.json({
    data: result,
    // numPages,
    // totalItemCount,
  });

});
app.get('/', (req, res) => {
  app.get('db').select('*').from('users').catch(e => {
    console.error('ERROR', e.message)
  })
  res.send('Hello, world!')
})
module.exports = app