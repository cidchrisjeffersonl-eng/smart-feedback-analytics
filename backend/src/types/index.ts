export type UserRole = "student" | "faculty" | "admin" | "academic_lead";

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Faculty {
  id: string;
  user_id: string;
  department_id: string;
  position?: string;
}

export interface Course {
  id: string;
  faculty_id: string;
  course_code: string;
  course_name: string;
  semester?: string;
  academic_year?: string;
}

export type SentimentLabel = "positive" | "neutral" | "negative";

export interface Feedback {
  id: string;
  student_id?: string;
  faculty_id: string;
  course_id: string;
  evaluation_period_id?: string;
  rating: number;
  comment?: string;
  sentiment_label?: SentimentLabel;
  sentiment_score?: number;
  themes?: string[];
  created_at: string;
}

export interface AuthPayload {
  id: string;
  email: string;
  role: UserRole;
}
