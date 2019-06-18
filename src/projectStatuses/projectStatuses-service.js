const ProjectStatusesService={
    getProjectStatuses(knex){
       return knex.select('*').from ('project_statuses')
    }
    }
    module.exports = ProjectStatusesService;