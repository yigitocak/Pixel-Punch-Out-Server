export async function up(knex) {
  // Drop the existing column with the default value
  await knex.schema.table("users", (table) => {
    table.dropColumn("created_at");
  });

  // Recreate the column without a default value
  await knex.schema.table("users", (table) => {
    table.timestamp("created_at").nullable();
  });

  // Add a trigger to set the default value in America/New_York time zone
  await knex.raw(`
    CREATE TRIGGER set_created_at_timezone
    BEFORE INSERT ON users
    FOR EACH ROW
    SET NEW.created_at = CONVERT_TZ(NOW(), 'UTC', 'America/New_York');
  `);
}

export async function down(knex) {
  // Drop the trigger
  await knex.raw(`DROP TRIGGER IF EXISTS set_created_at_timezone;`);

  // Drop the existing column
  await knex.schema.table("users", (table) => {
    table.dropColumn("created_at");
  });

  // Recreate the column with the original default value
  await knex.schema.table("users", (table) => {
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
}
