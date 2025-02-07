import { ProjectCreateService } from '../src/services/project-create.service';

export function testCreateProject() {
  const folder = 'C:/Users/Ubaby/NodeJS Projects';
  const createService = new ProjectCreateService();
  createService.createProjectThere('gpt-assistants-angular2', 'angular', folder);
  // createService.createProjectThere('gpt-assistants-angular', 'node', folder);
}
testCreateProject();
