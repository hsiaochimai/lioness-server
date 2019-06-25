const express = require("express");
const ProjectStatusesService = require('./projectStatuses-service')
const projectsStatusesRouter = express.Router();
const { expressTryCatchWrapper } = require('../helpers')

projectsStatusesRouter
    .route('/')
    .get(expressTryCatchWrapper(async (req, res) => {
        const knex = req.app.get("db");
       const result= await ProjectStatusesService.getProjectStatuses(knex)
            res.json(result)
    }))

module.exports = projectsStatusesRouter;