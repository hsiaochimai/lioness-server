const {
    FETCH_INFO: { SORT_ASC, SORT_DESC, ITEMS_PER_PAGE },
    ROLES: { ADMIN_ROLE, CLIENT_ROLE, MANAGER_ROLE, CONTRACTOR_ROLE },
    usersDefaultOptions
  } = require("../src/config");
  const queryString = require("query-string");
  // const knex = require("knex");
  const app = require("../src/app");
  const { makeTestKnex, populateDB, fixturesData } = require("./helpers");
  const { clearData } = require("../seeds/seedData");
  
  const { TEST_DB_URL } = require("../src/config");
  const { API_TOKEN } = process.env;
  const RolesService = require("../src/roles/roles-service");
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
  
    describe(`GET /api/roles`, async () => {
      context(`Given no users`, () => {
        it(`responds with 200 and an empty list`, async () => {
          await clearData(db);
          // await populateDB(db)
          return supertest(app)
            .get("/api/roles")
            .expect(200, []);
        });
      });
      context("Given there are roles in the database", async () => {
          it("GET /api/roles responds with 200 and roles", async () => {
              await populateDB(db);
    
              await RolesService.getRoles(db);
      
              return (
                supertest(app)
                  .get('/api/roles/')
                  .expect(200, fixturesData.roles)
                
              );
            });
           
      })
    });
  });
  // afterEach("cleanup", () => db.raw('TRUNCATE projects, project_statuses, users RESTART IDENTITY CASCADE'));
  