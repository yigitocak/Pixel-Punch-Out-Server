export async function up(knex) {
  return knex.schema.table("users", (table) => {
    table.string("oauthMethod");
  });
}

export async function down(knex) {
  return knex.schema.table("users", (table) => {
    table.dropColumn("discordID");
  });
}
