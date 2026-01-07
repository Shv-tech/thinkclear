import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    // Use process.env directly to avoid the strict "env()" helper error during initial loading
    url: process.env.DATABASE_URL || "", 
  },
});
