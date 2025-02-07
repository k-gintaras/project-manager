import { CustomFile } from './custom-file.model';

export interface CodingProject {
  name: string; // Project name
  location: string; // Absolute path to the project
  type: ProjectType; // Strict project types
  dependencies: string[]; // List of runtime dependencies
  devDependencies: string[]; // List of development dependencies
  initSteps: string[]; // Steps for initializing the project
  postInitSteps: string[]; // Steps for initializing the project
  installSteps: {
    dependencies: string[]; // Dependencies to install
    devDependencies: string[]; // Dev dependencies to install
  }; // Structured install steps
  folders: string[]; // Folder structure to create
  files: CustomFile[]; // New property for files to create
  scripts: Record<string, string>; // NPM scripts
  vscodeSettings?: boolean; // Whether to open in VS Code after creation
}

export type ProjectType = 'node' | 'angular' | 'electron'; // Union of project types
