const {
  PROJECT_STATUESES: {
    STATUS_ESTIMATE,
    STATUS_IN_PROGRESS,
    STATUS_BILLED,
    STATUS_OTHER
  },
  FETCH_INFO: { SORT_ASC, SORT_DESC, ITEMS_PER_PAGE },
  ROLES: { ADMIN_ROLE, CLIENT_ROLE, MANAGER_ROLE, CONTRACTOR_ROLE },
  projectsDefaultOptions
} = require("../src/config");
const queryString = require("query-string");
// const knex = require("knex");
const app = require("../src/app");
const { makeTestKnex, populateDB, fixturesData } = require("./helpers");
const { convertDatesToTimestamps } = require("../src/helpers");
const { clearData } = require("../seeds/seedData");

const { TEST_DB_URL } = require("../src/config");
const { API_TOKEN } = process.env;
const ProjectService = require("../src/projects/projects-service");
const { expect, assert } = require("chai");
let db;

function checkSort(arr, testFn) {
  arr.forEach((i, index) => {
    if (index < arr.length - 2) {
      expect(
        testFn(arr[index], arr[index + 1])
      ).to.be.true;
    }
  })
}


describe("Projects Endpoints", function () {
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

      it("Updates a project", async () => {
        await populateDB(db);
        let { status, client, manager, contractors, ...project } = await ProjectService.getProjectByID(db, 1)
        project.title = 'The Zoo'
        project.budget = 0.5
        project.description = 'TL;DR'

        const contractorIDs = contractors.map(c => c.id)
        const body = {
          project,
          contractorIDs,
        }

        return supertest(app)
          .post(`/api/projects/create`)
          .send(body)
          .set('Accept', /application\/json/)
          // .expect(200)
          .then(r => JSON.parse(r.text))
          .then(async res => {
            // const res = await ProjectService.getProjectByID(db, 1)
            'title description budget start_date estimated_due_date completion_date client_id status_id manager_id'
              .split(' ')
              .forEach(fieldName => {
                let v = res[fieldName]
                let v2 = project[fieldName]
                if (/_date$/.test(fieldName)) {
                  v = new Date(v).setMilliseconds(0)
                  v2 = new Date(v2).setMilliseconds(0)
                }
                expect(v.toString()).to.equal(v2.toString())
              })
          })

      })

      it("GET /api/projects responds with 200 and sorts by budget ASC", async () => {
        await populateDB(db);

        let opts = { ...projectsDefaultOptions, budgetSort: SORT_ASC };
        const qs = queryString.stringify(opts);
        await ProjectService.getProjects(db, opts);

        return (
          supertest(app)
            .get(`/api/projects/?${qs}`)
            .expect(200)
            .then(response => {

              const { data } = response.body;
              //sort function
              data.forEach((i, index) => {
                if (index < data.length - 2) {
                  expect(data[index].budget < data[index + 1].budget).to.be
                    .true;
                }
              });
              //filter .forEach
            })
        );
      });
      it("GET /api/projects responds with 200 and filters by status filter", async () => {
        await populateDB(db);

        let opts = { ...projectsDefaultOptions, statusFilter: 1 };
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
      //Could we make the date type filter more dynamic in the test?
      it("GET /api/projects responds with 200 and filters by date type and sorts", async () => {
        await populateDB(db);
        const config = {
          [STATUS_ESTIMATE]: ['start_date'],
          [STATUS_IN_PROGRESS]: ['start_date', 'estimated_due_date'],
          [STATUS_BILLED]: ['start_date', 'estimated_due_date', 'completion_date'],
        }
        const promises = []
        Object.keys(config).forEach(status => {
          const dateFields = config[status]
          dateFields.forEach(async dateField => {
            const opts = {
              ...projectsDefaultOptions,
              statusFilter: status,
              dateTypeFilter: dateField,
              budgetSort: null,
              dateSort: SORT_ASC,
            }
            let qs = queryString.stringify(opts);
            console.log(qs);

            const p1 = supertest(app)
              .get(`/api/projects/?${qs}`)
              .expect(200)
              .then(response => {
                const { data } = response.body;
                checkSort(data, (a, b) => new Date(a[dateField]) <=
                  new Date(b[dateField]))
              })
            promises.push(p1)


            opts.dateSort = SORT_DESC
            qs = queryString.stringify(opts);
            const p2 = supertest(app)
              .get(`/api/projects/?${qs}`)
              .expect(200)
              .then(response => {
                const { data } = response.body;
                checkSort(data, (a, b) => new Date(a[dateField]) >=
                  new Date(b[dateField]))
              })
            promises.push(p2)

          })
        })

        return Promise.all(promises)

      });

      it("GET /api/projects responds with 200 and filters by date type, and by dates that are after a certain date", async () => {
        await populateDB(db);

        let opts = {
          ...projectsDefaultOptions,
          dateTypeFilter: "start_date",
          afterDate: "2019-06-02"
        };
        const qs = queryString.stringify(opts);
        await ProjectService.getProjects(db, opts);

        return (
          supertest(app)
            .get(`/api/projects/?${qs}`)
            // .expect(200,ProjectService.getProjects(db, budgetSort=ASC));
            .expect(200)
            .then(response => {
              const { data } = response.body;
              console.log(`this is the length`, data.length);
              data.forEach((i, index) => {
                if (index < data.length - 2) {
                  expect(
                    new Date(data[index].start_date) > new Date(opts.afterDate)
                  ).to.be.true;
                }
              });

              // sort function

              //filter .forEach
            })
        );
      });
      it("GET /api/projects responds with 200 and filters by date type, and by dates that are before a certain date", async () => {
        await populateDB(db);

        let opts = {
          ...projectsDefaultOptions,
          dateTypeFilter: "start_date",
          beforeDate: "2019-06-02"
        };
        const qs = queryString.stringify(opts);
        await ProjectService.getProjects(db, opts);

        return (
          supertest(app)
            .get(`/api/projects/?${qs}`)
            // .expect(200,ProjectService.getProjects(db, budgetSort=ASC));
            .expect(200)
            .then(response => {
              const { data } = response.body;
              console.log(`this is the length`, data.length);
              data.forEach((i, index) => {
                if (index < data.length - 2) {
                  expect(
                    new Date(data[index].start_date) < new Date(opts.beforeDate)
                  ).to.be.true;
                }
              });

              // sort function

              //filter .forEach
            })
        );
      });
    });
  });
  describe(`POST/api/project/create`, async () => {


  })
});
