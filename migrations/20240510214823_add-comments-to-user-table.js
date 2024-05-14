export async function up(knex) {
    return knex.schema.table('users', table => {
        table.json('comments')
    });
}

export async function down(knex) {
    return knex.schema.table('users', table => {
        table.dropColumn('comments');
    });
}
