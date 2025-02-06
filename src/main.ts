import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { ProjectCreateService } from './services/project-create.service';
import { ProjectType } from './models/coding-project.model';

const argv = yargs(hideBin(process.argv))
  .command('create <type> <name>', 'Create a new project', (yargs) => {
    yargs
      .positional('name', {
        describe: 'Project name',
        type: 'string',
      })
      .positional('type', {
        describe: 'Project type (Node.js, Angular, etc.)',
        type: 'string',
      })
      .option('path', {
        alias: 'p',
        describe: 'Base path for project creation',
        type: 'string',
      });
  })
  .help()
  .parseSync(); // Ensure synchronous parsing

console.log('CLI Arguments:', argv);

if (argv._[0] === 'create') {
  const projectCreateService = new ProjectCreateService();
  const name = argv.name as string;
  const type = argv.type as ProjectType;
  const basePath = argv.path as string | undefined;

  if (basePath) {
    projectCreateService.createProjectThere(name, type, basePath);
  } else {
    projectCreateService.createProjectHere(name, type);
  }
}
