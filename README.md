# Lioness-Server

Lioness is a project management tool, built to organize your organization's projects, clients, project managers and contractors.
This is the server that stores all data.

## Server Hosted here:

https://calm-brushlands-90795.herokuapp.com/

## API Documentation

Roles

- GET to '/api/roles' to view all roles of users

Project Statuses

- GET to '/api/project-statuses' to view all statuses of projects

Users

- GET '/api/users'

  - Query Parameters
    - searchQuery: searches users full name and email based on keyword
    - userNameSort: sorts users by name in either ascending or descending order
    - activeProjSort: sorts users by how many active projects they have
    - roleFilter: filters users by their role id,
    - pageNumber: filters users by which page number their results are on, 10 results per page

- POST '/api/users' creates a new user
- POST '/api/users/:id'edits an existing user
- DELETE '/api/users/:id' marks a user as inactive

Projects

- GET '/api/projects'
  - Query Parameters
    - statusFilter: filters projects by theit status id,
    - budgetSort: sorts project by budget in either ascending or descending order,
    - dateTypeFilter: filters projects by a by a type of date either start date, estimated due date, or completion date
    - dateSort: sorts projects by dates based on their date type filter either ascending or descending ,
    - afterDate: filters projects after a given date based on the date type filter chosen
    - beforeDate: filters projects before a given date based on the date type filter chosen,
    - pageNumber: filters projects by which page number their results are on, 10 results per page
- POST '/api/projects' creates a new project
- POST '/api/projects/:id' updates a new project
- DELETE '/api/projects/:id' deletes a single project based on id

POST '/api/auth/login' matches given credentials and provides a JWT Token.

## Technology Used

- Node.js
- Express
- Mocha
- Chai
- Postgres
- Passport
- Knex.js

## Security

Application uses JWT authentication
