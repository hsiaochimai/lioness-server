const express = require("express");
const UsersService=require('./users-service')
const usersRouter= express.Router();
const SORT_ASC = 'ASC'
const SORT_DESC = 'DESC'
const ITEMS_PER_PAGE = 10

const usersDefaultOptions = {
    idsFilter: null, // pass a non-empty array to fetch users by theirs ids
    searchQuery: null,
    userNameSort: SORT_ASC,
    roleFilter: null,
    pageNumber: 1,
}


usersRouter.route('/')
.get(async (req, res)=>{
    const knex = req.app.get("db");
    const mergedOpts = { ...usersDefaultOptions, ...req.query }
    const result = await UsersService.getUsers(knex, mergedOpts)
    res.json(result);
})

module.exports = usersRouter;