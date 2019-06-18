// https://www.npmjs.com/package/faker
// this generates data flattenedData.json
const faker = require("faker");
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
  { id: 1, title: "Admin" },
  { id: 2, title: "Client" },
  { id: 3, title: "Contractor" },
  { id: 4, title: "Project Manager" }
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
    projects: []
  };
  users.push(admin);
}

for (let i = 2; i < 6; i++) {
  const remainingRoles = [...roles];
  remainingRoles.shift();
  const randomRole =
    remainingRoles[Math.floor(Math.random() * remainingRoles.length)];
  const user = {
    //fields
    // id: faker.random.uuid(),
    id: i + 1,
    email: unique(faker.internet.email, users, "email"),
    full_name: faker.name.findName(),
    phone: faker.phone.phoneNumberFormat(),
    password: faker.internet.password(),
    role_id: randomRole.id,
    // isAdmin: false,
    //associated objects
    role: randomRole, //the role Object corresponding to the role_id
    // projects: []
    projects: []
  };
  users.push(user);
}
const clients = users.filter(user => {
  return user.role.id === 2;
});
const contractors = users.filter(user => {
  return user.role.id === 3;
});
const projectManagers = users.filter(user => {
  return user.role.id === 4;
});
const projects = [];
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
    status: projectStatus,
    client: client, //relation based on client_id
    contractors: contractorsArr,
    manager: manager
  };
  // contractorsArr.filter((i, index, arr) => {
  //   const existing = arr.findIndex(e => e.id === i.id)
  //   if (existing !== index) {
  //     console.log(`duplicate contractor ${i.id} for project ${project.id}`)
  //     return false
  //   }
  // })

  contractorsArr.forEach(c => c.projects.push(project))

  client.projects.push(project);
  manager.projects.push(project);
  users.projects = [project];
  projects.push(project);

}

const collections = stringify({
  users,
  projects,
  roles,
  statuses
});

// console.log(collections);
fs.writeFile('./flattenedData.json', collections, (err) => {
  // throws an error, you could also catch it here
  if (err) throw err;

  // success case, the file was saved
  // console.log('Fake data saved!');
});
