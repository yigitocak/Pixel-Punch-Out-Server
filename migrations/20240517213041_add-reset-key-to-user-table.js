import "dotenv/config";

export async function up(knex) {
  return knex.schema.table("users", (table) => {
    table.string("resetKey", 6).defaultTo(null);
  });
}

export async function down(knex) {
  return knex.schema.table("users", (table) => {
    table.dropColumn("resetKey");
  });
}
