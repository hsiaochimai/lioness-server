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

const STATUS_ESTIMATE = 1
const STATUS_IN_PROGRESS = 2
const STATUS_BILLED = 3
const STATUS_OTHER = 4

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

const services = {
  getProjects: async mergedOpts => {
    const knex = app.get('db')

    const projects = knex('projects')
    const counter = knex('projects')

    //filtering
    if (mergedOpts.statusFilter) {
      projects.where('status_id', mergedOpts.statusFilter)
      counter.where('status_id', mergedOpts.statusFilter)
    }

    //count before paginating

    let totalItemCount = +(await counter.count('id'))[0].count
    const numPages = Math.ceil(totalItemCount / ITEMS_PER_PAGE)

    //sorting
    if (mergedOpts.budgetSort) {
      projects.orderBy('budget', mergedOpts.budgetSort)
    }
    if (mergedOpts.dateSort) {
      projects.orderBy(mergedOpts.dateTypeFilter, mergedOpts.dateSort)
    }

    const begin = (mergedOpts.pageNumber - 1) * ITEMS_PER_PAGE
    projects.offset(begin)
    projects.limit(ITEMS_PER_PAGE)

    console.log(projects.toString())

    let result = []
    await projects.select('*').then(data => {
      result = data
    })

    //populate related records
    let promises = []

    result.forEach(project => {
      const statusQuery = knex('project_statuses').select('*')
        .where('id', project.status_id)
        .first()
      // console.log(statusQuery.toString())
      const p = statusQuery.then(res => {
        project.status = res
      })
      promises.push(p)
    })

    result.forEach(project => {
      const clientQuery = knex('users').select('*')
        .where('id', project.client_id)
        .first()
      // console.log(clientQuery.toString())
      const p = clientQuery.then(user => {
        project.client = user
      })
      promises.push(p)
    })

    result.forEach(project => {
      const managerQuery = knex('users').select('*')
        .where('id', project.manager_id)
        .first()
      // console.log(managerQuery.toString())
      const p = managerQuery.then(user => {
        project.manager = user
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

      // console.log(contractorsQuery.toString())

      const p = contractorsQuery.then(users => {
        project.contractors = users
      })
      promises.push(p)
    })

    await Promise.all(promises)
    return {
      data: result,
      numPages,
      totalItemCount,
    }

  }
}

app.get('/api/projects/*', async (req, res) => {
  const mergedOpts = { ...projectsDefaultOptions, ...req.query }
  const result = await services.getProjects(mergedOpts)
  res.json(result);
});
app.get('/', (req, res) => {
  app.get('db').select('*').from('users').catch(e => {
    console.error('ERROR', e.message)
  })
  res.send('Hello, world!')
})
module.exports = app