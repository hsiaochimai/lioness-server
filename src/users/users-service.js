const {
  FETCH_INFO: { SORT_ASC, SORT_DESC, ITEMS_PER_PAGE },
  ROLES: { ADMIN_ROLE, CLIENT_ROLE, MANAGER_ROLE, CONTRACTOR_ROLE } } = require('../config')
  
const populateUserProjects = async (user, knex) => {
  const promises = [];
  const roleQuery = knex("roles")
    .select("*")
    .where("id", user.role_id)
    .first();
  const roleObj = roleQuery.then(res => {
    user.role = res;
  });
  promises.push(roleObj);

  //this will either be client projects or user projects
  user.projects = []

  //populate client projects
  if (user.role_id === CLIENT_ROLE) {
    const clientProjectsQuery = knex("projects")
      .select("*")
      .where('client_id', user.id)
    const clientProjectPromise = clientProjectsQuery.then(project => {
      console.log(`Got ${project.length} client projects for user ${user.id}`)
      user.projects = project;
    });
    promises.push(clientProjectPromise);
  }

  if (user.role_id === MANAGER_ROLE) {
    const managerProjectsQuery = knex("projects")
      .select("*")
      .where('manager_id', user.id)

    const managerProjectPromise = managerProjectsQuery.then(projects => {
      user.projects = projects;
      console.log(`Got ${projects.length} manager projects for user ${user.id}`)
    }
    );
    promises.push(managerProjectPromise);
  }
  if (user.role_id === CONTRACTOR_ROLE) {
    const contractorsProjectsQuery = knex("projects")
      .select("*")
      // .where('project_id', id)
      .innerJoin("contractors_projects", function () {
        this.on("projects.id", "=", "contractors_projects.project_id").andOn(
          "contractors_projects.contractor_id",
          "=",
          user.id
        );
      });
    console.log(`hello contractors!`, contractorsProjectsQuery.toString())

    // console.log(contractorsQuery.toString())

    const contractorsProjectsPromise = contractorsProjectsQuery.then(projects => {
      console.log(`Got ${projects.length} contractor projects for user ${user.id}`)
      user.projects = projects;
    });

    promises.push(contractorsProjectsPromise);
  }
  return Promise.all(promises)
};

const UsersService = {
  getUsers: async (knex, mergedOpts) => {
    const users = knex("users");
    const counter = knex("users");

    if (mergedOpts.roleFilter) {
      users.where("role_id", mergedOpts.roleFilter);
      counter.where("role_id", mergedOpts.roleFilter);
    }
    let totalItemCount = +(await counter.count("id"))[0].count;
    const numPages = Math.ceil(totalItemCount / ITEMS_PER_PAGE);

    if (mergedOpts.userNameSort) {
      users.orderBy("full_name", mergedOpts.userNameSort);
    }
    const begin = (mergedOpts.pageNumber - 1) * ITEMS_PER_PAGE;
    users.offset(begin);
    users.limit(ITEMS_PER_PAGE);

    console.log(users.toString());

    let result = []
    await users.select("*").then(data => {
      result = data;
    })
    let promises = []
    result.forEach(
      user => promises.push(populateUserProjects(user, knex))
    )
    await Promise.all(promises)
    return {
      data: result,
      numPages,
      totalItemCount,
      params: mergedOpts,
    }
  }
};
module.exports = UsersService;