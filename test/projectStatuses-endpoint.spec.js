const app = require("../src/app");
  const { makeTestKnex, populateDB, fixturesData } = require("./helpers");
  const { clearData } = require("../seeds/seedData");
  const { API_TOKEN } = process.env;
  const ProjectStatusesService = require("../src/projectStatuses/projectStatuses-service");
  const { expect } = require("chai");
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

    describe(`GET /api/project-statuses`, async () => {
      context(`Given no project-statuses`, () => {
        it(`responds with 200 and an empty list`, async () => {
          await clearData(db);
          // await populateDB(db)
          return supertest(app)
            .get("/api/project-statuses")
            .expect(200, []);
        });
      });
      context("Given there are roles in the database", async () => {
          it("GET /api/project-statuses responds with 200 and roles", async () => {
              await populateDB(db);
    
              await ProjectStatusesService.getProjectStatuses(db);
      
              return (
                supertest(app)
                  .get('/api/project-statuses/')
                  .expect(200, fixturesData.statuses)
                
              );
            });
           
      })
    });
  });
  