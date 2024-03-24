import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const client = postgres(`${process.env.PG_URI}`);
const db = drizzle(client);
await client`create extension if not exists vector with schema extensions;`;
void migrate(db, { migrationsFolder: "./drizzle" }).then(() => {
  console.log("Migrations completed");
  process.exit();
});
