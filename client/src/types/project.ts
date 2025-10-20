export interface Project {
  id: number;
  title: string;
  description: string;
  owner: string;
  progress: number;
  tags: string[];
  health: string;
  last_updated: string;
  status: string;
  version: number;
  is_deleted: boolean;
}
