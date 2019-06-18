const express = require("express");
const ProjectStatusesService=require('./projectStatuses-service')
const projectsStatusesRouter= express.Router();


projectsStatusesRouter
.route('/')
.get((req, res, next) => {
    const knex = req.app.get("db");
    ProjectStatusesService.getProjectStatuses(knex)
    .then(statuses=>{
        res.json(statuses);
    })
    .catch(next)
  })

  module.exports = projectsStatusesRouter;