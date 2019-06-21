// https://www.npmjs.com/package/faker
// this generates data flattenedData.json
const faker = require("faker");
const { ROLES: { ADMIN_ROLE, CLIENT_ROLE, MANAGER_ROLE, CONTRACTOR_ROLE } } = require('../../src/config')
const fs = require('fs')
faker.seed(123);
const { parse, stringify } = require("flatted/cjs");

function unique(fn, arr, objKey) {
  const value = fn();
  const exists = arr.find(item => item[objKey] === value);
  if (exists !== undefined) {
    return unique(fn, arr, objKey);
  }
  return value;
}
function uniqueRecord(fn, arr, objKey) {
  const generatedRecord = fn();
  const exists = arr.find(item => item[objKey] === generatedRecord[objKey]);
  if (exists !== undefined) {
    return uniqueRecord(fn, arr, objKey);
  }
  return generatedRecord;
}

const roles = [
  { id: ADMIN_ROLE, title: "Admin" },
  { id: CLIENT_ROLE, title: "Client" },
  { id: CONTRACTOR_ROLE, title: "Contractor" },
  { id: MANAGER_ROLE, title: "Project Manager" }
];
const statuses = [
  { id: 1, title: "estimate" },
  { id: 2, title: "in progress" },
  { id: 3, title: "billed" },
  { id: 4, title: "other" }
];

const users = [];
for (let i = 0; i < 2; i++) {
  const adminRole = roles[0];
  const admin = {
    // id: faker.random.uuid(),
    id: i + 1,
    email: unique(faker.internet.email, users, "email"),
    full_name: faker.name.findName(),
    phone: faker.phone.phoneNumberFormat(),
    password: faker.internet.password(),
    role_id: adminRole.id,
    //associated objects
    role: adminRole, //the role Object corresponding to the role_id
    // isAdmin: true,
    // projects: []
  };
  users.push(admin);
}


const usersByRole = {
  [CLIENT_ROLE]: [],
  [CONTRACTOR_ROLE]: [],
  [MANAGER_ROLE]: [],
}

const remainingRoles = [...roles];
remainingRoles.shift();
for (let i = 2; true; i++) {
  // const roleID =
  //   remainingRoles[Math.floor(Math.random() * remainingRoles.length)];
  let roleID
  let done = true;
  if (usersByRole[CLIENT_ROLE].length < 3) {
    roleID = CLIENT_ROLE
    done = false
  }
  if (usersByRole[MANAGER_ROLE].length < 3) {
    roleID = MANAGER_ROLE
    done = false
  }
  if (usersByRole[CONTRACTOR_ROLE].length < 6) {
    roleID = CONTRACTOR_ROLE
    done = false
  }
  if (done) {
    console.log('Generated users')
    break;
  }

  const user = {
    //fields
    // id: faker.random.uuid(),
    id: i + 1,
    email: unique(faker.internet.email, users, "email"),
    full_name: faker.name.findName(),
    phone: faker.phone.phoneNumberFormat(),
    password: faker.internet.password(),
    role_id: roleID,
    // isAdmin: false,
    //associated objects
    // role: roles.find(i => i.id === roleID), //the role Object corresponding to the role_id
    // projects: []
    // projects: []
  };
  users.push(user);
  usersByRole[roleID].push(user)
}
const clients = users.filter(user => {
  return user.role_id === CLIENT_ROLE;
});
const contractors = users.filter(user => {
  return user.role_id === CONTRACTOR_ROLE;
});
const projectManagers = users.filter(user => {
  return user.role_id === MANAGER_ROLE;
});
const projects = [];
const contractors_projects = [];
for (let i = 0; i < 30; i++) {
  let contractorsArr = [
    contractors[Math.floor(Math.random() * contractors.length)]
  ]

  const contractor2 = uniqueRecord(() => contractors[Math.floor(Math.random() * contractors.length)], contractorsArr, 'id')
  contractorsArr.push(contractor2)
  const contractor3 = uniqueRecord(() => contractors[Math.floor(Math.random() * contractors.length)], contractorsArr, 'id')
  contractorsArr.push(contractor3)



  const client = clients[Math.floor(Math.random() * clients.length)];
  const manager =
    projectManagers[Math.floor(Math.random() * projectManagers.length)];

  const projectStatus = statuses[Math.floor(Math.random() * statuses.length)];
  const beginDate = faker.date.recent(60);
  const estimatedDate = faker.date.between(beginDate, faker.date.recent());
  const billedDate = faker.date.between(estimatedDate, faker.date.recent());
  const project = {
    //fields
    id: i + 1,
    title: unique(faker.company.companyName, projects, "title"),
    description: unique(faker.lorem.sentence, projects, "description"),
    budget: unique(faker.finance.amount, projects, "budget"),
    start_date: beginDate,
    estimated_due_date:
      projectStatus.id === 2 || projectStatus.id === 3 ? estimatedDate : null,
    completion_date: projectStatus.id === 3 ? billedDate : null,
    client_id: client.id,
    status_id: projectStatus.id,
    manager_id: manager.id,
    //associated objects
    // status: projectStatus,
    // client: client, //relation based on client_id
    // contractors: contractorsArr,
    // manager: manager
  };
  // contractorsArr.filter((i, index, arr) => {
  //   const existing = arr.findIndex(e => e.id === i.id)
  //   if (existing !== index) {
  //     console.log(`duplicate contractor ${i.id} for project ${project.id}`)
  //     return false
  //   }
  // })

  // contractorsArr.forEach(c => c.projects.push(project))
  // client.projects.push(project);  
  // manager.projects.push(project);
  contractorsArr.forEach(c => contractors_projects.push({ contractor_id: c.id, project_id: project.id }))

  // users.projects = [project];
  projects.push(project);

}

const collections = JSON.stringify({
  users,
  projects,
  contractors_projects,
  roles,
  // project_statuses: statuses,
  statuses,
}, 2, 2);

// console.log(collections);
fs.writeFile('./fixturesData.json', collections, (err) => {
  // throws an error, you could also catch it here
  if (err) throw err;

  // success case, the file was saved
  // console.log('Fake data saved!');
});
