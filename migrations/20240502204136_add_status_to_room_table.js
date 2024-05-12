export async function up(knex) {
  return knex.schema.table('room', table => {
    table.boolean('status').defaultTo(true);
  });
}

export async function down(knex) {
  return knex.schema.table('room', table => {
    table.dropColumn('status');
  });
}
