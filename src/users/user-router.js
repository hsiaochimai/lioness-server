const express = require("express");
const UsersService=require('./users-service')
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const usersRouter= express.Router();
const {FETCH_INFO:{SORT_ASC, SORT_DESC, ITEMS_PER_PAGE}} = require('../config')

const usersDefaultOptions = {
    idsFilter: null, // pass a non-empty array to fetch users by theirs ids
    searchQuery: null,
    userNameSort: SORT_ASC,
    activeProjSort:null,
    roleFilter: null,
    pageNumber: 1,
}
usersRouter
.route('/create')
.post(jsonParser, async (req, res) => {
  const { user } = req.body
  const knex = req.app.get("db");
  const savedUser = await UsersService.upsertUser(knex, user)
  res.json(savedUser);
})
usersRouter.route('/')
.get(async (req, res)=>{
    const knex = req.app.get("db");
    const mergedOpts = { ...usersDefaultOptions, ...req.query }
    const result = await UsersService.getUsers(knex, mergedOpts)
    res.json(result);
})

module.exports = usersRouter;