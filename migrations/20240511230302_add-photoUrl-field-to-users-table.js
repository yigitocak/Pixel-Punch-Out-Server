import "dotenv/config";
const BACKEND_URL = process.env.BACKEND_URL;

export async function up(knex) {
  return knex.schema.table("users", (table) => {
    table
      .string("photoUrl")
      .defaultTo(`${BACKEND_URL}profilePhotos/default.jpeg`);
  });
}

export async function down(knex) {
  return knex.schema.table("users", (table) => {
    table.dropColumn("photoUrl");
  });
}
