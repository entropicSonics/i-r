import type { Config } from "drizzle-kit";

export default {
  schema: "./src/schema/*.ts",
  out: "./drizzle",
  driver: "pg",
  verbose: true,
  dbCredentials: {
    connectionString: `${process.env.PG_URI}`,
  },
  schemaFilter: ["ir"],
} satisfies Config;
