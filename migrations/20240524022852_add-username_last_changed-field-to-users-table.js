export async function up(knex) {
  return knex.schema.table("users", (table) => {
    table.timestamp("username_last_changed")
  });
}

export async function down(knex) {
  return knex.schema.table("users", (table) => {
    table.dropColumn("username_last_changed");
  });
}
