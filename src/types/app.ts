export type AppStatus = 'live' | 'staging' | 'down' | 'maintenance';

export interface TrackedApp {
  id: string;
  name: string;
  url: string;
  status: AppStatus;
  techStack: string;
  lastDeployed: string;
  notes: string;
  createdAt: number;
}

export type AppFormData = Omit<TrackedApp, 'id' | 'createdAt'>;
