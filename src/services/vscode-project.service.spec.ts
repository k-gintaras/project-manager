import { ProjectService } from './vscode-project.service';
import { VsCodeProject } from '../models/vscode-project.model';
import * as fs from 'fs';

describe('ProjectService', () => {
  const testFilePath = './test-projects.json';
  const sampleProjects: VsCodeProject[] = [
    { name: 'Test Project 1', rootPath: '/test/1', tags: ['test'], favorite: false },
    { name: 'Test Project 2', rootPath: '/test/2', tags: ['example'], favorite: true },
  ];

  beforeEach(() => {
    fs.writeFileSync(testFilePath, JSON.stringify(sampleProjects, null, 2));
  });

  it('should load projects from file', () => {
    const service = new ProjectService(testFilePath);
    service.loadProjects();
    expect(service.getProjects()).toEqual(sampleProjects);
  });

  it('should add a new project', () => {
    const service = new ProjectService(testFilePath);
    service.loadProjects();
    const newProject: VsCodeProject = { name: 'New Test', rootPath: '/test/new', tags: [], favorite: false };
    service.addProject(newProject);
    expect(service.getProjects().length).toBe(3);
  });
});
