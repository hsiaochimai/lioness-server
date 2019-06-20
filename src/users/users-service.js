const populateUserProjects=async(user,knex)=>{
    const promises = []
    const roleQuery = knex('role').select('*')
    .where('id', user.role_id)
    .first()
    const roleObj= roleQuery.then(res => {
        user.role = res
})
promises.push(roleObj)
const projectsQuery = knex('users').select('*')
    // .where('project_id', id)
    .innerJoin('projects', function () {
      this.on('projects.manager_id', '=', 'user.id')
        .orOn('projects.client_id', '=', 'user.id')
    })
    console.log(projectsQuery.toString)
    
    const projectArr=projectsQuery.then(projects=>
        user.projects=projects)
        promises.push(projectArr)
    }


const UsersService={
    getUsers(knex, mergerOpts){
        const projects = knex('users')
    const counter = knex('users')
    const ITEMS_PER_PAGE = 10
       return knex.select('*').from ('users')
    }
    }
    module.exports = UsersService;