const express = require("express");
const RolesService = require('./roles-service')
const { expressTryCatchWrapper } = require('../helpers')
const rolesRouter = express.Router();


rolesRouter
    .route('/')
    .get(expressTryCatchWrapper((req, res, next) => {
        const knex = req.app.get("db");
        RolesService.getRoles(knex)
            .then(roles => {
                res.json(roles);
            })
            .catch(next)
    }))

module.exports = rolesRouter;