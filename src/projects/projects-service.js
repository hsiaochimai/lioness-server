

const ProjectsService = {
    getProjects:  async (knex, mergedOpts) => {
      
      const projects = knex('projects')
      const counter = knex('projects')
      const ITEMS_PER_PAGE = 10
      //filtering
      if (mergedOpts.statusFilter) {
        projects.where('status_id', mergedOpts.statusFilter)
        counter.where('status_id', mergedOpts.statusFilter)
      }
  
      //count before paginating
  
      let totalItemCount = +(await counter.count('id'))[0].count
      const numPages = Math.ceil(totalItemCount / ITEMS_PER_PAGE)
  
      //sorting
      if (mergedOpts.budgetSort ) {
        projects.orderBy('budget', mergedOpts.budgetSort)
      }
      if (mergedOpts.dateSort) {
        projects.orderBy(mergedOpts.dateTypeFilter, mergedOpts.dateSort)
      }
  
      const begin = (mergedOpts.pageNumber - 1) * ITEMS_PER_PAGE
      projects.offset(begin)
      projects.limit(ITEMS_PER_PAGE)
  
      console.log(projects.toString())
  
      let result = []
      await projects.select('*').then(data => {
        result = data
      })
  
      //populate related records
      let promises = []
  
      result.forEach(project => {
        const statusQuery = knex('project_statuses').select('*')
          .where('id', project.status_id)
          .first()
        // console.log(statusQuery.toString())
        const p = statusQuery.then(res => {
          project.status = res
        })
        promises.push(p)
      })
  
      result.forEach(project => {
        const clientQuery = knex('users').select('*')
          .where('id', project.client_id)
          .first()
        // console.log(clientQuery.toString())
        const p = clientQuery.then(user => {
          project.client = user
        })
        promises.push(p)
      })
  
      result.forEach(project => {
        const managerQuery = knex('users').select('*')
          .where('id', project.manager_id)
          .first()
        // console.log(managerQuery.toString())
        const p = managerQuery.then(user => {
          project.manager = user
        })
        promises.push(p)
      })
  
      result.forEach(project => {
        const contractorsQuery = knex('users').select('*')
          // .where('project_id', id)
          .innerJoin('contractors_projects', function () {
            this.on('users.id', '=', 'contractors_projects.contractor_id')
              .andOn('contractors_projects.project_id', '=', project.id)
          })
  
        // console.log(contractorsQuery.toString())
  
        const p = contractorsQuery.then(users => {
          project.contractors = users
        })
        promises.push(p)
      })
  
      await Promise.all(promises)
      return {
        data: result,
        numPages,
        totalItemCount,
      }
  
    }
  };
  module.exports = ProjectsService;