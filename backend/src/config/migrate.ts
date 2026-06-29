import fs from "fs";
import path from "path";
import pool from "./db";

async function migrate() {
  try {
    const schemaPath = path.join(__dirname, "../../../database/schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf-8");
    console.log("Running schema migration...");
    await pool.query(schema);
    console.log("✅ Migration complete.");
  } catch (err) {
    console.error("❌ Migration failed:", err);
  } finally {
    await pool.end();
  }
}

migrate();
