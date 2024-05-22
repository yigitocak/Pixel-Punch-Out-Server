
export async function up(knex) {
  return knex.schema.table("users", (table) => {
    table.boolean("oAuth2").defaultTo(false);
  });
}

export async function down(knex) {
  return knex.schema.table("users", (table) => {
    table.dropColumn("oAuth2");
  });
}
