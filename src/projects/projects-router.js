// const path = require("path");
require('json.date-extensions');
const express = require("express");
const bodyParser = require('body-parser');
const passport = require('passport');
const jsonParser = bodyParser.json();
// const xss = require("xss");
const ProjectsService = require("./projects-service");
const projectsRouter = express.Router();
const { expressTryCatchWrapper } = require('../helpers')
// const jsonParser = express.json();
const jwtAuth = passport.authenticate('jwt', { session: false });

const SORT_ASC = 'ASC'
const SORT_DESC = 'DESC'
const ITEMS_PER_PAGE = 10

const STATUS_ESTIMATE = 1
const STATUS_IN_PROGRESS = 2
const STATUS_BILLED = 3
const STATUS_OTHER = 4

const projectsDefaultOptions = {
  statusFilter: null,
  budgetSort: SORT_DESC,
  dateTypeFilter: null,
  dateSort: null,
  afterDate: null,
  beforeDate: null,
  roleFilter: null,
  pageNumber: 1,
}

projectsRouter
  .route('/create')
  .post(jwtAuth, jsonParser, expressTryCatchWrapper(async (req, res) => {
    const knex = req.app.get("db");
    const { project, contractorIDs } = req.body
    const savedProject = await ProjectsService.upsertProject(knex, project, contractorIDs)
    res.json(savedProject);
  }))

projectsRouter
  .route('/id/:id')
  .get(jwtAuth, expressTryCatchWrapper(async (req, res) => {
    const knex = req.app.get("db");
    const result = await ProjectsService.getProjectByID(knex, req.params.id)
    res.json(result)
  }))
  .delete(jwtAuth, expressTryCatchWrapper(async (req, res, next) => {
    const knex = req.app.get("db");
    await ProjectsService.deleteProject(knex, req.params.id)
      .then(() => {
        res.status(204)
          .end()

      })
      .catch(next);
  }))
projectsRouter
  .route('/')
  .get(jwtAuth, expressTryCatchWrapper(async (req, res) => {
    const knex = req.app.get("db");
    const mergedOpts = { ...projectsDefaultOptions, ...req.query }
    const result = await ProjectsService.getProjects(knex, mergedOpts)
    res.json(result)
  }));

module.exports = projectsRouter;