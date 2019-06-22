const populateProjectRelatedRecords = async (project, knex) => {
  const promises = [];

  //populate status object
  const statusQuery = knex("project_statuses")
    .select("*")
    .where("id", project.status_id)
    .first();
  // console.log(statusQuery.toString())
  const statusP = statusQuery.then(res => {
    project.status = res;
  });
  promises.push(statusP);

  //populate client object
  const clientQuery = knex("users")
    .select("*")
    .where("id", project.client_id)
    .first();
  // console.log(clientQuery.toString())
  const clientP = clientQuery.then(user => {
    project.client = user;
  });
  promises.push(clientP);

  //populate manager object
  const managerQuery = knex("users")
    .select("*")
    .where("id", project.manager_id)
    .first();
  // console.log(managerQuery.toString())
  const managerP = managerQuery.then(user => {
    project.manager = user;
  });
  promises.push(managerP);

  //populate contractors object
  const contractorsQuery = knex("users")
    .select("*")
    // .where('project_id', id)
    .innerJoin("contractors_projects", function() {
      this.on("users.id", "=", "contractors_projects.contractor_id").andOn(
        "contractors_projects.project_id",
        "=",
        project.id
      );
    });

  // console.log(contractorsQuery.toString())

  const contractorsP = contractorsQuery.then(users => {
    project.contractors = users;
  });

  promises.push(contractorsP);
  //return the array promises
  return Promise.all(promises);
};

const ProjectsService = {
  upsertProject: async (knex, project, contractorIDs) => {
    // nullify empty values
    Object.keys(project).forEach(k => {
      if (project[k] === "") {
        project[k] = null;
      }
    });

    let { id } = project;
    const isNew = id === -1;
    delete project.id;

    if (isNew) {
      console.log(
        await knex("projects")
          .insert(project, ["id"])
          .toString()
      );

      await knex("projects")
        .insert(project, ["id"])
        .then(returnedInfo => {
          console.log("INSERT got:", returnedInfo);
          id = returnedInfo[0].id; //the INSERT ID
          return returnedInfo;
        });
    } else {
      await knex("projects")
        .where("id", "=", id)
        .update(project)
        .then(returnedInfo => {
          console.log("UPDATE got:", returnedInfo);
          return returnedInfo;
        });
      await knex("contractors_projects")
        .where("project_id", "=", id)
        .del()
        .then(() => {
          console.log(`deleted previous contractors for ${id}`);
        });
    }

    const contractorRecords = contractorIDs.map(cID => {
      return { project_id: id, contractor_id: cID };
    });
    await knex("contractors_projects")
      .insert(contractorRecords)
      .then(() => {
        console.log(
          `added contractors for ID ${id}: ${contractorIDs.join(", ")}`
        );
      });

    return id;
  },

  getProjects: async (knex, mergedOpts) => {
    const projects = knex("projects");
    const counter = knex("projects");
    const ITEMS_PER_PAGE = 10;
    //filtering
    if (mergedOpts.statusFilter) {
      projects.where("status_id", mergedOpts.statusFilter);
      counter.where("status_id", mergedOpts.statusFilter);
    }
    if (mergedOpts.beforeDate) {
      projects.where(mergedOpts.dateTypeFilter, '<', mergedOpts.beforeDate)
      counter.where(mergedOpts.dateTypeFilter, '<', mergedOpts.beforeDate)
  }
  if (mergedOpts.afterDate) {
    projects.where(mergedOpts.dateTypeFilter, '>', mergedOpts.afterDate)
    counter.where(mergedOpts.dateTypeFilter, '>', mergedOpts.afterDate)
  }
    //count before paginating

    let totalItemCount = +(await counter.count("id"))[0].count;
    const numPages = Math.ceil(totalItemCount / ITEMS_PER_PAGE);

    //sorting
    if (mergedOpts.budgetSort) {
      projects.orderBy("budget", mergedOpts.budgetSort);
    }
    if (mergedOpts.dateSort) {
      projects.orderBy(mergedOpts.dateTypeFilter, mergedOpts.dateSort);
    }
  
    const begin = (mergedOpts.pageNumber - 1) * ITEMS_PER_PAGE;
    projects.offset(begin);
    projects.limit(ITEMS_PER_PAGE);

    console.log(`what is this`, projects.toString());

    let result = [];
    await projects.select("*").then(data => {
      result = data;
    });

    //populate related records
    let promises = [];

    result.forEach(project =>
      promises.push(populateProjectRelatedRecords(project, knex))
    );

    await Promise.all(promises);
    return {
      data: result,
      numPages,
      totalItemCount,
      params: mergedOpts
    };
  }
};
module.exports = ProjectsService;
