import pool from "./db";
import { hashPassword } from "../services/auth.service";

async function seed() {
  try {
    console.log("Seeding sample data...");

    const dept = await pool.query(
      `INSERT INTO departments (name) VALUES ('College of Computer Studies') RETURNING id`
    );
    const deptId = dept.rows[0].id;

    const password_hash = await hashPassword("password123");

    const facultyUser = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, role)
       VALUES ('Dr. Juan Dela Cruz', 'faculty@example.com', $1, 'faculty')
       RETURNING id`,
      [password_hash]
    );
    const facultyUserId = facultyUser.rows[0].id;

    const faculty = await pool.query(
      `INSERT INTO faculty (user_id, department_id, position)
       VALUES ($1, $2, 'Associate Professor') RETURNING id`,
      [facultyUserId, deptId]
    );
    const facultyId = faculty.rows[0].id;

    await pool.query(
      `INSERT INTO courses (faculty_id, course_code, course_name, semester, academic_year)
       VALUES ($1, 'CS101', 'Introduction to Programming', '1st', '2025-2026')`,
      [facultyId]
    );

    await pool.query(
      `INSERT INTO users (full_name, email, password_hash, role)
       VALUES ('Admin User', 'admin@example.com', $1, 'admin')`,
      [password_hash]
    );

    console.log("✅ Seed complete. Faculty login: faculty@example.com / password123");
  } catch (err) {
    console.error("❌ Seed failed:", err);
  } finally {
    await pool.end();
  }
}

seed();
