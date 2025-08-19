
export interface Pet {
  id: string;
  name: string;
  species: string;
  breed?: string;
  age?: number;
  birth_date?: string;
  behavior_focus?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface TrainingPlan {
  id: string;
  title: string;
  description: string;
  status: 'planned' | 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
  user_id: string;
  pet_id: string | null;
  pet_name?: string;
  is_ai_generated?: boolean;
}

export interface TrainingStep {
  id: string;
  step_number: number;
  title: string;
  title_en?: string | null;
  description: string;
  description_en?: string | null;
  is_completed: boolean;
  points_reward: number;
  completed_at: string | null;
  total_sessions_completed?: number;
  mastery_status?: string;
  target_sessions_daily?: number;
  is_ai_generated?: boolean;
  // Structured training sections
  exercise_goal?: string | null;
  exercise_goal_en?: string | null;
  step_by_step_guide?: string | null;
  step_by_step_guide_en?: string | null;
  repetition_duration?: string | null;
  repetition_duration_en?: string | null;
  required_tools?: string | null;
  required_tools_en?: string | null;
  learning_tips?: string | null;
  learning_tips_en?: string | null;
  common_mistakes?: string | null;
  common_mistakes_en?: string | null;
}

export interface NewPlanData {
  title: string;
  description: string;
  pet_id: string | null;
  status: TrainingPlan['status'];
}
