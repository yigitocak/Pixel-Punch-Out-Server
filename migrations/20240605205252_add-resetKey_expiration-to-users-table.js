export async function up(knex) {
  return knex.schema.table("users", (table) => {
    table.timestamp("resetKey_expiration");
  });
}

export async function down(knex) {
  return knex.schema.table("users", (table) => {
    table.dropColumn("resetKey_expiration");
  });
}
