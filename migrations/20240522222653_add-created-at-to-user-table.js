export async function up(knex) {
  return knex.schema.table("users", (table) => {
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
}

export async function down(knex) {
  return knex.schema.table("users", (table) => {
    table.dropColumn("created_at");
  });
}
