require('dotenv').config()
const express = require('express')
const passport = require('passport');
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')
const projectsRouter = require('./projects/projects-router')
const rolesRouter = require('./roles/roles-router')
const projectsStatusesRouter = require('./projectStatuses/projectStatuses-router')
const usersRouter = require('./users/user-router')
const { router: loginRouter, localStrategy, jwtStrategy, } = require('./auth')
const app = express()
const winston = require('winston');

app.use(passport.initialize());
passport.use(localStrategy);
passport.use(jwtStrategy);

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

app.use('/api/projects', projectsRouter)
app.use('/api/roles', rolesRouter)
app.use('/api/project-statuses', projectsStatusesRouter)
app.use('/api/users', usersRouter)
app.use('/api/auth', loginRouter)

app.get('/', (req, res) => {
  res.send('Hello, world!')
})
module.exports = app