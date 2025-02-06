import fs from 'fs';
import path from 'path';
import { VsCodeProject } from '../models/vscode-project.model';

export class ProjectService {
  private projects: VsCodeProject[] = [];

  constructor(private projectFilePath: string) {}

  loadProjects(): void {
    const data = fs.readFileSync(this.projectFilePath, 'utf-8');
    this.projects = JSON.parse(data);
  }

  getProjects(): VsCodeProject[] {
    return this.projects;
  }

  addProject(project: VsCodeProject): void {
    this.projects.push(project);
  }

  saveProjects(): void {
    fs.writeFileSync(this.projectFilePath, JSON.stringify(this.projects, null, 2));
  }

  static detectLibraries(projectPath: string): string[] {
    const packageJsonPath = path.join(projectPath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      return Object.keys(packageJson.dependencies || {});
    }
    return [];
  }
}
