const {
  FETCH_INFO: { SORT_ASC, SORT_DESC, ITEMS_PER_PAGE },
  ROLES: { ADMIN_ROLE, CLIENT_ROLE, MANAGER_ROLE, CONTRACTOR_ROLE }, 
  projectsDefaultOptions
 } = require('../src/config')
 import queryString from 'query-string'
// const knex = require("knex");
const app = require("../src/app");
const {
  makeTestKnex,
  populateDB,
  fixturesData,
} = require('./helpers')
const { clearData } = require('../seeds/seedData')

const { TEST_DB_URL } = require('../src/config')
const { API_TOKEN } = process.env;
const ProjectService =require('../src/projects/projects-service')
const { expect } = require("chai");
describe("Projects Endpoints", function () {
  let db;

  before(() => {
    db = makeTestKnex()
    app.set("db", db)
  });

  // before(async () => {

  // })

  after(async () => {
    await db.destroy()
    console.log('server closed')
  });

  // afterEach("cleanup", () => db.raw('TRUNCATE projects, project_statuses, users RESTART IDENTITY CASCADE'));

  describe(`GET /api/projects`, async () => {
    context(`Given no projects`, () => {
      it(`responds with 200 and an empty list`, async () => {
        await clearData(db)
        // await populateDB(db)
        return supertest(app)
          .get("/api/projects")
          .set("Authorization", `Bearer ${API_TOKEN}`)
          .expect(200, { data: [], numPages: 0, totalItemCount: 0,   params:
            projectsDefaultOptions  });
      });
    });
    context("Given there are projects in the database", async () => {
      // const testUsers = fixturesData.users;
      // const testStatuses = fixturesData.statuses;
      // const testRoles = fixturesData.roles;
      // const testProjects = fixturesData.projects
      // const testContractorProjects = fixturesData.contractor_projects
      let opts={...projectsDefaultOptions, budgetSort= SORT_ASC}
      const qs = queryString.stringify(opts)
      it("GET /api/projects responds with 200 and sorts by budget", async () => {
        await populateDB(db)
        return supertest(app)
          .get(`/api/projects/?${qs}`)
          .expect(200,ProjectService.getProjects(db, budgetSort=ASC));
      })
    });
  })




})
