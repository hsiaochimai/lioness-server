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
const UsersService = require("../src/users/users-service");
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

  describe(`GET /api/users`, async () => {
    context(`Given no users`, () => {
      it(`responds with 200 and an empty list`, async () => {
        await clearData(db);
        // await populateDB(db)
        return supertest(app)
          .get("/api/users")
          .expect(200, {
            data: [],
            numPages: 0,
            totalItemCount: 0,
            params: usersDefaultOptions
          });
      });
    });
    context("Given there are users in the database", async () => {
        it("GET /api/users responds with 200 and sorts by nameSort ASC", async () => {
            await populateDB(db);
    
            let opts = { ...usersDefaultOptions, userNameSort: SORT_ASC};
            const qs = queryString.stringify(opts);
            await UsersService.getUsers(db, opts);
    
            return (
              supertest(app)
                .get(`/api/users/?${qs}`)
                .expect(200)
                .then(response => {
                  const { data } = response.body;
                  //sort function
                  data.forEach((i, index) => {
                    if (index < data.length - 2) {
                      expect(data[index].full_name < data[index + 1].full_name).to.be
                        .true;
                    }
                  });
                 
                })
            );
          });
          it("GET /api/users responds with 200 and filters by role_id", async () => {
            await populateDB(db);
    
            let opts = { ...usersDefaultOptions, roleFilter: 2};
            const qs = queryString.stringify(opts);
            await UsersService.getUsers(db, opts);
    
            return (
              supertest(app)
                .get(`/api/users/?${qs}`)
                .expect(200)
                .then(response => {
                  const { data } = response.body;
                  //sort function
                  data.forEach((i, index) => {
                    if (index < data.length - 2) {
                      expect(data[index].role_id===2).to.be
                        .true;
                    }
                  });
                 
                })
            );
          });
    })
  });
});
// afterEach("cleanup", () => db.raw('TRUNCATE projects, project_statuses, users RESTART IDENTITY CASCADE'));
