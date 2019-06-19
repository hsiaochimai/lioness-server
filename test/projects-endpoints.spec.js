
// const knex = require("knex");
const app = require("../src/app");
const {
  knex,
  populateDB,
  fixturesData,
} = require('./helpers')

const { TEST_DB_URL } = require('../src/config')
const { API_TOKEN } = process.env;

const { expect } = require("chai");
describe("Projects Endpoints", function() {
    let db;
  
    before(() => {
      db = knex
      app.set("db", db);
    });

    before(async () => {
      await db.raw('TRUNCATE contractors_projects, projects, users, project_statuses, roles RESTART IDENTITY CASCADE');
      await populateDB()
      console.log('DB was populated')
      
    })
    after(() => db.destroy());
    // afterEach("cleanup", () => db.raw('TRUNCATE projects, project_statuses, users RESTART IDENTITY CASCADE'));

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
          const testUsers =fixturesData.users;
          const testStatuses = fixturesData.statuses;
          const testRoles= fixturesData.roles;
          const testProjects= fixturesData.projects
          const testContractorProjects=fixturesData.contractor_projects
          // const testProjectResult=makeProjectResultArray();
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
            .expect(200, []);
          })
        });
      })




})
