// src/lib/types.ts

// Submission entity returned by /categories/{slug}
export type Submission = {
  project_id: string;
  project_name: string;
  date_completed: string; // ISO-8601
  score: number | null;
  // keep the rest if you need them later
  id?: string;
  karma_id?: string;
  eas_uid: string;
  evaluation_count?: number;
  last_evaluation_date?: string; // ISO-8601
  category?: {
    name: string;
    description: string;
    slug: string;
  };
  answers?: { question_id: string; answer: string }[];
  karma_data?: any;
  past_submissions?: any;
  owner?: string;
  evaluations?: Evaluation[];
};

// Full payload from GET /categories/{slug}
export type CategoryPayload = {
  name: string;
  description: string;
  slug: string;
  evaluators: [];
  submissions: Submission[];
};

export type Question = {
  project_statement: string;
  project_description: string;
  evaluator_statement: string;
  evaluator_description: string;
  section: string;
  order: number;
};

export type Evaluation = {
  submission_id: string;
  project_id: string;
  project_name: string;
  answers: { question_id: string; answer: string }[];
  category: string;
  evaluator: string;
  eas_uid: string;
};

