const express = require("express");
const passport = require('passport');
const UsersService = require('./users-service')
const { expressTryCatchWrapper } = require('../helpers')
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const usersRouter = express.Router();
const { FETCH_INFO: { SORT_ASC, SORT_DESC, ITEMS_PER_PAGE } } = require('../config')
const jwtAuth = passport.authenticate('jwt', { session: false });
const usersDefaultOptions = {
  idsFilter: null, // pass a non-empty array to fetch users by theirs ids
  searchQuery: null,
  userNameSort: SORT_ASC,
  activeProjSort: null,
  roleFilter: null,
  pageNumber: 1,
}
usersRouter
  .route('/create')
  .post(jwtAuth, jsonParser, expressTryCatchWrapper(async (req, res) => {
    const { user } = req.body
    const knex = req.app.get("db");
    const savedUser = await UsersService.upsertUser(knex, user)
    res.json(savedUser);
  }))

usersRouter.route('/')
  .get(jwtAuth, expressTryCatchWrapper(async (req, res) => {
    const knex = req.app.get("db");
    const mergedOpts = { ...usersDefaultOptions, ...req.query }
    const result = await UsersService.getUsers(knex, mergedOpts)
    res.json(result);
  }))
usersRouter.route('/id/:id')
  .get(jwtAuth, expressTryCatchWrapper(async (req, res) => {
    const knex = req.app.get("db");
    const result = await UsersService.getUserByID(knex, req.params.id)
    res.json(result)
  }))
  .delete(jwtAuth, expressTryCatchWrapper(async (req, res, next) => {
    const knex = req.app.get("db");
    await UsersService.deleteUser(knex, req.params.id)
      .then(() => {
        res.status(204)
          .end()

      })
      .catch(next);
  }))
module.exports = usersRouter;