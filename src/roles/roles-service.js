const RolesService={
getRoles(knex){
   return knex.select('*').from ('roles')
}
}
module.exports = RolesService;