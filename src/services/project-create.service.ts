import { ProjectType } from '../models/coding-project.model';
import { ProjectSetupService } from './project-setup.service';

export class ProjectCreateService {
  private setupService: ProjectSetupService;

  constructor() {
    this.setupService = new ProjectSetupService();
  }

  /** Create a project in the current directory */
  createProjectHere(name: string, type: ProjectType): void {
    this.setupService.setupProject(name, type);
    this.setupService.createProject();
    console.log(`Project "${name}" of type "${type}" created successfully!`);
  }

  /** Create a project in a specific directory */
  createProjectThere(name: string, type: ProjectType, folderPath: string): void {
    this.setupService.setupProject(name, type, folderPath);
    this.setupService.createProject();
    console.log(`Project "${name}" of type "${type}" created successfully!`);
  }
}
