
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
}

export interface TrainingStep {
  id: string;
  step_number: number;
  title: string;
  description: string;
  is_completed: boolean;
  points_reward: number;
  completed_at: string | null;
  total_sessions_completed?: number;
  mastery_status?: string;
  target_sessions_daily?: number;
}

export interface NewPlanData {
  title: string;
  description: string;
  pet_id: string | null;
  status: TrainingPlan['status'];
}
