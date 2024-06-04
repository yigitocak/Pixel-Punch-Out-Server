export async function seed(knex) {
  // Deletes ALL existing entries
  await knex('pending_users').del();
  // Inserts seed entries
  await knex('pending_users').insert([
  {
    "id": 58,
    "username": "sun25",
    "email": "christofirelee@gmail.com",
    "password": "$2b$10$qTLsWZJHP2JaUrdCdfdwqOu/ddTOkYw9BYuhCVGCic6.gsL1Ow.Xe",
    "verification_code": "817369",
    "created_at": "2024-05-22T09:51:26.000Z"
  }
]);
};