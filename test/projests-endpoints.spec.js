const { expect } = require("chai");
const knex = require("knex");
const app = require("../src/app");
const { TEST_DB_URL } = require('../src/config')
const { API_TOKEN } = process.env;

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

    describe(`GET /api/notes`, () => {
        context(`Given no notes`, () => {
          it(`responds with 200 and an empty list`, () => {
            return supertest(app)
              .get("/api/projects")
              .set("Authorization", `Bearer ${API_TOKEN}`)
              .expect(200, {data: [], numPages: 0, totalItemCount: 0 });
          });
        });

    })




})