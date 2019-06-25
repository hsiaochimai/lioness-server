const express = require("express");
const RolesService = require('./roles-service')
const { expressTryCatchWrapper } = require('../helpers')
const rolesRouter = express.Router();


rolesRouter
    .route('/')
    .get(expressTryCatchWrapper(async (req, res) => {
        const knex = req.app.get("db");
        const result= await RolesService.getRoles(knex)
           res.json(result)
    
    }))

module.exports = rolesRouter;