const express = require("express");
const RolesService=require('./roles-service')
const rolesRouter= express.Router();


rolesRouter
.route('/')
.get((req, res, next) => {
    const knex = req.app.get("db");
    RolesService.getRoles(knex)
    .then(roles=>{
        res.json(roles);
    })
    .catch(next)
  })

  module.exports = rolesRouter;