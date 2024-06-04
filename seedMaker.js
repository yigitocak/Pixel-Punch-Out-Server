import fs from "fs";
import knex from "knex";
import knexfile from "./knexfile.js";
import { fileURLToPath } from "url";
import path from "path";

// Fixing the __filename and __dirname for ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Knex instance for production environment
const db = knex(knexfile.production);

// Function to generate seed data for a table
const generateSeedData = async (tableName) => {
  const data = await db(tableName).select("*");
  return data;
};

// Function to write seed file
const writeSeedFile = (tableName, data) => {
  const seedFileContent = `export async function seed(knex) {
  // Deletes ALL existing entries
  await knex('${tableName}').del();
  // Inserts seed entries
  await knex('${tableName}').insert(${JSON.stringify(data, null, 2)});
};`;

  const seedFilePath = path.join(__dirname, "seeds", `${tableName}.js`);
  fs.writeFileSync(seedFilePath, seedFileContent);
  console.log(`Seed data written to ${seedFilePath}`);
};

// Main function to generate seed files for specified tables
const main = async () => {
  const tables = ["users", "pending_users"];

  for (const table of tables) {
    const data = await generateSeedData(table);
    writeSeedFile(table, data);
  }

  console.log("Seed files created successfully.");
  process.exit(0);
};

main().catch((error) => {
  console.error("Error generating seed files:", error);
  process.exit(1);
});
