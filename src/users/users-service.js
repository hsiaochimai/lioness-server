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
  
  //populate client projects
  const clientProjectsQuery = knex("projects")
    .select("*")
    .where('client_id', user.id)
    
    
    
  
  const clientProjectArr = clientProjectsQuery.then(project => {
    user.projects = project;
  });
  promises.push(clientProjectArr);
console.log(`this is promises with client projects`, promises)
  const managerProjectsQuery = knex("projects")
    .select("*")
    .where('manager_id', user.id)

  

  const managerProjectArr = managerProjectsQuery.then(projects => {
    user.projects = projects;
  });
  promises.push(managerProjectArr);

  const contractorsProjectsQuery = knex("projects")
    .select("*")
    // .where('project_id', id)
    .innerJoin("contractors_projects", function() {
      this.on("projects.id", "=", "contractors_projects.project_id").andOn(
        "contractors_projects.contractor_id",
        "=",
        user.id
      );
    });
    console.log(`hello contractors!`, contractorsProjectsQuery.toString())

  // console.log(contractorsQuery.toString())

  const contractorsProjectsArr = contractorsProjectsQuery.then(projects => {
    user.projects = projects;
  });

  promises.push(contractorsProjectsArr);
return Promise.all(promises)
};

const UsersService = {
  getUsers: async (knex, mergedOpts) => {
    const users = knex("users");
    const counter = knex("users");
    const ITEMS_PER_PAGE = 10;

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
let promises=[]
result.forEach(
    user=>promises.push(populateUserProjects(user, knex))
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
