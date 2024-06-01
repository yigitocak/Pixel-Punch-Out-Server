import fs from 'fs';
import path from 'path';
import knex from "knex";
import knexfile from "./knexfile.js";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = knex(knexfile.development);

const tables = ['users', 'pending_users'];

const fetchData = async () => {
  const data = {};
  for (const table of tables) {
    data[table] = await db(table).select('*');
  }
  return data;
};

const writeSeedFile = (data) => {
  const seedFileContent = `
    exports.seed = async function(knex) {
      // Deletes ALL existing entries
      ${tables.map(table => `await knex('${table}').del();`).join('\n')}
      // Inserts seed entries
      ${tables.map(table => `await knex('${table}').insert(${JSON.stringify(data[table], null, 2)});`).join('\n')}
    };
  `;

  const seedFilePath = path.join(__dirname, 'seeds', 'initial_seed.js');
  fs.writeFileSync(seedFilePath, seedFileContent);
  console.log(`Seed data written to ${seedFilePath}`);
};

fetchData()
  .then(data => {
    writeSeedFile(data);
    process.exit(0);
  })
  .catch(err => {
    console.error('Error generating seed data:', err);
    process.exit(1);
  });
