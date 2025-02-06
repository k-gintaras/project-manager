import { ProjectType } from './coding-project.model';

export interface ProjectSetupServiceInterface {
  setProjectNameAndType(name: string, type: ProjectType): void;
  setInitStepsByType(type: ProjectType): void;
  setInstallStepsByType(type: ProjectType): void;
  setTsConfigByType(type: ProjectType): void;
  setGitIgnoreByType(type: ProjectType): void;
  setFolders(type: ProjectType): void;
  createProject(): void;
}
