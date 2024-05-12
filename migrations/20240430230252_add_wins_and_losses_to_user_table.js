export async function up(knex) {
  return knex.schema.table('users', table => {
    table.integer('wins').unsigned().defaultTo(0);
    table.integer('losses').unsigned().defaultTo(0);
  });
}

export async function down(knex) {
  return knex.schema.table('users', table => {
    table.dropColumn('wins');
    table.dropColumn('losses');
  });
}
