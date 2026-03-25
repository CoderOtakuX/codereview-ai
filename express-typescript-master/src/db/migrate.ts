import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { env } from "@/common/utils/envConfig";

const runMigrate = async () => {
	if (env.NODE_ENV === "test") {
		console.log("Skipping migrations in test environment");
		return;
	}
	console.log("Running migrations...");
	const pool = new Pool({
		connectionString: env.DATABASE_URL,
	});
	const db = drizzle(pool);

	await migrate(db, { migrationsFolder: "./drizzle" });
	console.log("Migrations complete!");
};

runMigrate().catch((err) => {
	console.error("Migration failed:", err);
	process.exit(1);
});
