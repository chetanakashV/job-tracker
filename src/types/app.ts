export type AppStatus =
  | 'applied'
  | 'screening'
  | 'interview'
  | 'offer'
  | 'rejected'
  | 'ghosted'
  | 'withdrawn';

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  status: AppStatus;
  dateApplied: string;
  source: string;
  location: string;
  salaryRange: string;
  jobUrl: string;
  resumeId: string;
  resumeName: string;
  notes: string;
  createdAt: number;
}

export interface Resume {
  id: string;
  name: string;
  createdAt: number;
}

export type JobFormData = Omit<JobApplication, 'id' | 'createdAt'>;
