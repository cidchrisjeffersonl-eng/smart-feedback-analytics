-- Smart Feedback Analytics for Faculty Evaluation
-- PostgreSQL Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========== USERS / ROLES ==========
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'faculty', 'admin', 'academic_lead')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ========== DEPARTMENTS ==========
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ========== FACULTY PROFILE ==========
CREATE TABLE IF NOT EXISTS faculty (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id),
    position VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ========== COURSES / SUBJECTS ==========
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    faculty_id UUID REFERENCES faculty(id) ON DELETE CASCADE,
    course_code VARCHAR(20) NOT NULL,
    course_name VARCHAR(150) NOT NULL,
    semester VARCHAR(20),
    academic_year VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ========== EVALUATION PERIODS ==========
CREATE TABLE IF NOT EXISTS evaluation_periods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(150) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ========== FEEDBACK ==========
CREATE TABLE IF NOT EXISTS feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES users(id) ON DELETE SET NULL,
    faculty_id UUID REFERENCES faculty(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    evaluation_period_id UUID REFERENCES evaluation_periods(id),
    rating SMALLINT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    sentiment_label VARCHAR(20),      -- positive / neutral / negative
    sentiment_score NUMERIC(5,2),     -- -1.00 to 1.00
    themes TEXT[],                    -- thematic categorization tags
    created_at TIMESTAMP DEFAULT NOW()
);

-- ========== ANALYTICS SNAPSHOTS (for dashboard caching) ==========
CREATE TABLE IF NOT EXISTS analytics_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    faculty_id UUID REFERENCES faculty(id) ON DELETE CASCADE,
    evaluation_period_id UUID REFERENCES evaluation_periods(id),
    avg_rating NUMERIC(3,2),
    positive_count INT DEFAULT 0,
    neutral_count INT DEFAULT 0,
    negative_count INT DEFAULT 0,
    top_themes JSONB,
    generated_at TIMESTAMP DEFAULT NOW()
    UNIQUE (faculty_id, evaluation_period_id)
);

-- ========== REPORTS ==========
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    faculty_id UUID REFERENCES faculty(id) ON DELETE CASCADE,
    generated_by UUID REFERENCES users(id),
    evaluation_period_id UUID REFERENCES evaluation_periods(id),
    file_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS interventions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    faculty_id UUID REFERENCES faculty(id) ON DELETE CASCADE,
    evaluation_period_id UUID REFERENCES evaluation_periods(id),
    trigger_reason TEXT NOT NULL,
    suggested_action TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'dismissed')),
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP
);

-- ========== INDEXES ==========
CREATE INDEX IF NOT EXISTS idx_feedback_faculty ON feedback(faculty_id);
CREATE INDEX IF NOT EXISTS idx_feedback_course ON feedback(course_id);
CREATE INDEX IF NOT EXISTS idx_feedback_period ON feedback(evaluation_period_id);
CREATE INDEX IF NOT EXISTS idx_faculty_department ON faculty(department_id);
CREATE INDEX IF NOT EXISTS idx_interventions_faculty ON interventions(faculty_id);