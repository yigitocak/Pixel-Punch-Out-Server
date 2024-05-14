export async function up(knex) {
    return knex.schema.createTable('pending_users', table => {
        table.increments('id').primary();
        table.string('username', 255).notNullable();
        table.string('email', 255).notNullable().unique();
        table.string('password', 255).notNullable();
        table.string('verification_code', 6).notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
    });
}

export async function down(knex) {
    return knex.schema.dropTable('pending_users');
}
