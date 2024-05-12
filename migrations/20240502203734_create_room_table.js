export async function up(knex) {
  return knex.schema.createTable('room', table => {
    table.increments('roomId').primary();
    table.integer('roomCode', 255).notNullable().unique();
    table.string('arena', 255).notNullable();
    table.integer('lives', 255).notNullable();
  })}


export async function down(knex) {
  return knex.schema.dropTable('room');
}
