const {
  FETCH_INFO: { SORT_ASC, SORT_DESC, ITEMS_PER_PAGE },
  ROLES: { ADMIN_ROLE, CLIENT_ROLE, MANAGER_ROLE, CONTRACTOR_ROLE },
  projectsDefaultOptions
} = require("../src/config");
const queryString = require("query-string");
// const knex = require("knex");
const app = require("../src/app");
const { makeTestKnex, populateDB, fixturesData } = require("./helpers");
const { clearData } = require("../seeds/seedData");

const { TEST_DB_URL } = require("../src/config");
const { API_TOKEN } = process.env;
const ProjectService = require("../src/projects/projects-service");
const { expect, assert } = require("chai");
let db;
describe("Projects Endpoints", function() {
  before(() => {
    db = makeTestKnex();
    app.set("db", db);
  });

  // before(async () => {

  // })

  after(async () => {
    await db.destroy();
    console.log("server closed");
  });

  // afterEach("cleanup", () => db.raw('TRUNCATE projects, project_statuses, users RESTART IDENTITY CASCADE'));

  describe(`GET /api/projects`, async () => {
    context(`Given no projects`, () => {
      it(`responds with 200 and an empty list`, async () => {
        await clearData(db);
        // await populateDB(db)
        return supertest(app)
          .get("/api/projects")
          .set("Authorization", `Bearer ${API_TOKEN}`)
          .expect(200, {
            data: [],
            numPages: 0,
            totalItemCount: 0,
            params: projectsDefaultOptions
          });
      });
    });
    context("Given there are projects in the database", async () => {
      // const testUsers = fixturesData.users;
      // const testStatuses = fixturesData.statuses;
      // const testRoles = fixturesData.roles;
      // const testProjects = fixturesData.projects
      // const testContractorProjects = fixturesData.contractor_projects
    
      it("GET /api/projects responds with 200 and sorts by budget ASC", async () => {
        await populateDB(db);

        let opts = { ...projectsDefaultOptions, budgetSort: SORT_ASC };
        const qs = queryString.stringify(opts);
        await ProjectService.getProjects(db, opts);

        return (
          supertest(app)
            .get(`/api/projects/?${qs}`)
            // .expect(200,ProjectService.getProjects(db, budgetSort=ASC));
            .expect(200)
            .then(response => {
              const { data } = response.body;
              //sort function
              data.forEach((i, index) => {
                if (index < data.length - 2) {
                  expect(data[index].budget < data[index + 1].budget).to.be.true;
                }
              });
              //filter .forEach
            })
        );
      });
      it("GET /api/projects responds with 200 and filters by status filter", async () => {
        await populateDB(db);

        let opts = { ...projectsDefaultOptions, statusFilter:1 };
        const qs = queryString.stringify(opts);
        await ProjectService.getProjects(db, opts);

        return (
          supertest(app)
            .get(`/api/projects/?${qs}`)
            // .expect(200,ProjectService.getProjects(db, budgetSort=ASC));
            .expect(200)
            .then(response => {
              const { data } = response.body;
              //sort function
              data.forEach((i, index) => {
                if (index < data.length - 2) {
                  expect(data[index].status_id === 1).to.be.true;
                }
              });
              //filter .forEach
            })
        );
      });
      //have to change dates from strings back to dates
      it("GET /api/projects responds with 200 and filters by date type and sorts", async () => {
        await populateDB(db);

        let opts = { ...projectsDefaultOptions, dateTypeFilter:'start_date', dateSort: SORT_ASC, budgetSort: null };
        const qs = queryString.stringify(opts);
        await ProjectService.getProjects(db, opts);

        return (
          supertest(app)
            .get(`/api/projects/?${qs}`)
            // .expect(200,ProjectService.getProjects(db, budgetSort=ASC));
            .expect(200)
            .then(response => {
              const { data } = response.body;
              console.log(`this is the length`,data.length)
              data.forEach((i, index) => {
                if (index < data.length -2) {
                  //took out .to.be. true and the test passes
                      expect(new Date(data[index].start_date) < new Date(data[index + 1].start_date)).to.be.true;
                    }
                
              })
              
    
              // sort function
            
              //filter .forEach
            })
        );
      });
    });
  });
});
