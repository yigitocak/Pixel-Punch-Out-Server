export async function up(knex) {
  return knex.schema.createTable('users', table => {
    table.increments('id').primary();
    table.string('username', 255).notNullable().unique();
    table.string('email', 255).notNullable().unique();
    table.string('password', 255).notNullable();
  })}


export async function down(knex) {
  return knex.schema.dropTable('users');
}
