
const knex = require("knex");
const app = require("../src/app");
const { TEST_DB_URL } = require('../src/config')
const { API_TOKEN } = process.env;
const {makeContractorsProjectsArray} =require('./fixtures/contractors_projects.fixtures')
const {makeProjectStatusesArray}=require('./fixtures/project_statuses.fixtures')
const {makeProjectsArray}=require('./projects.fixtures')
const {makeRolesArray}=require('./roles.fixtures')
const {makeUsersArray}=require('./users.fixtures')
const {makeProjectResultArray}=require('./fixtures/project_result.fixtures')
const { expect } = require("chai");
describe("Projects Endpoints", function() {
    let db;
  
    before("make knex instance", () => {
      db = knex({
        client: "pg",
        connection: TEST_DB_URL
      });
      app.set("db", db);
    });

    after("disconnect from db", () => db.destroy());
    before("clean the table", () => db.raw('TRUNCATE projects, project_statuses, users RESTART IDENTITY CASCADE'));
    afterEach("cleanup", () => db.raw('TRUNCATE projects, project_statuses, users RESTART IDENTITY CASCADE'));

    describe(`GET /api/projects`, () => {
        context(`Given no projects`, () => {
          it(`responds with 200 and an empty list`, () => {
            return supertest(app)
              .get("/api/projects")
              .set("Authorization", `Bearer ${API_TOKEN}`)
              .expect(200, {data: [], numPages: 0, totalItemCount: 0 });
          });
        });
        context("Given there are projects in the database", () => {
          const testUsers = makeUsersArray();
          const testStatuses = makeProjectStatusesArray();
          const testRoles=makeRolesArray();
          const testProjects=makeProjectsArray();
          const testContractorProjects=makeContractorsProjectsArray()
          const testProjectResult=makeProjectResultArray();
          beforeEach("insert projects", () => {
            return db
            .into('roles')
            .insert(testRoles)
            .then(() => {
              return db
                .into('project_statuses')
                .insert(testStatuses)
            })
            .then(() => {
              return db
                .into('users')
                .insert(testUsers)
            })
            .then(() => {
              return db
                .into('projects')
                .insert(testProjects)
            })
            .then(() => {
              return db
                .into('contractor_projects')
                .insert(testContractorProjects)
            })
          });
          it("GET /api/projects responds with 200 and all of the project", () => {
            return supertest(app)
            .get("/api/projects")
            .expect(200, testProjectResult);
          })
        });
      })




})
