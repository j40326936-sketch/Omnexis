export interface User {
  id: number;
  name: string;
  email: string;
  created_at?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
}

export type ResearchStatus = 'pending' | 'running' | 'completed' | 'failed';

export type ResearchStage =
  | 'planning'
  | 'querying'
  | 'analyzing'
  | 'verifying'
  | 'writing'
  | 'reviewing'
  | 'done'
  | 'error';

export interface AgentLog {
  agent_name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  started_at?: string;
  completed_at?: string;
}

export interface ResearchSession {
  id: string;
  query: string;
  status: ResearchStatus;
  progress: number;
  current_stage: ResearchStage;
  created_at: string;
  completed_at?: string;
  confidence_score?: number;
  agents?: AgentLog[];
}

export interface Reference {
  title: string;
  source: string;
  type: string;
}

export interface ResearchReport {
  session_id: string;
  query: string;
  created_at: string;
  completed_at?: string;
  executive_summary: string;
  key_findings: string[];
  detailed_analysis: Record<string, string>;
  limitations: string[];
  references: Reference[];
  confidence_score: number;
}

export interface HistoryItem {
  id: string;
  query: string;
  status: ResearchStatus;
  progress: number;
  created_at: string;
  completed_at?: string;
  confidence_score?: number;
}
