import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { CodingProject, ProjectType } from '../models/coding-project.model';

export class ProjectSetupService {
  private project: CodingProject;
  private namePlaceHolder = /_PROJECT_NAME_PLACEHOLDER_/g;

  constructor() {
    this.project = this.getEmptyProjectObject();
  }

  /** Reset project state */
  private resetProject(): void {
    this.project = this.getEmptyProjectObject();
  }

  private getEmptyProjectObject(): CodingProject {
    return {
      name: '',
      location: '',
      type: 'node',
      dependencies: [],
      devDependencies: [],
      initSteps: [],
      installSteps: { dependencies: [], devDependencies: [] },
      folders: [],
      files: [],
      scripts: {},
      vscodeSettings: false,
    };
  }

  /** Load configuration from JSON */
  private loadConfig(type: ProjectType): CodingProject {
    const configPath = path.resolve(__dirname, `../../configs/${type.toLowerCase()}.project.json`);
    if (!fs.existsSync(configPath)) {
      throw new Error(`Configuration for project type "${type}" not found.`);
    }
    return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  }

  /** Replace placeholders like _PROJECT_NAME_PLACEHOLDER_ in text */
  private replacePlaceholders(text: string | undefined, projectName: string): string {
    if (!text) return '';
    return text.replace(this.namePlaceHolder, projectName);
  }

  /** Set up project configuration */
  setupProject(name: string, type: ProjectType, basePath: string = process.cwd()): void {
    const config = this.loadConfig(type);

    this.project = {
      ...config,
      name,
      type,
      location: path.resolve(basePath, name),
      installSteps: {
        dependencies: config.installSteps?.dependencies || [],
        devDependencies: config.installSteps?.devDependencies || [],
      },
      initSteps: config.initSteps.map((step) => this.replacePlaceholders(step, name)), // Apply name replacement in steps
      files: config.files.map((file) => ({
        ...file,
        content: this.replacePlaceholders(file.content, name), // Apply name replacement in files
      })),
    };

    console.log(`Project configuration set: ${JSON.stringify(this.project, null, 2)}`);
  }

  /** Execute initialization steps */
  private executeInitSteps(): void {
    this.project.initSteps.forEach((step) => {
      console.log(`Running: ${step}`);
      execSync(step, { stdio: 'inherit', cwd: this.project.location });
    });
  }

  /** Install dependencies */
  private installDependencies(): void {
    const { dependencies, devDependencies } = this.project.installSteps;

    if (dependencies.length) {
      console.log(`Installing dependencies: ${dependencies.join(', ')}`);
      execSync(`npm install ${dependencies.join(' ')}`, { stdio: 'inherit', cwd: this.project.location });
    }

    if (devDependencies.length) {
      console.log(`Installing devDependencies: ${devDependencies.join(', ')}`);
      execSync(`npm install --save-dev ${devDependencies.join(' ')}`, { stdio: 'inherit', cwd: this.project.location });
    }
  }

  /** Create folders */
  private createFolders(): void {
    this.project.folders.forEach((folder) => {
      const folderPath = path.join(this.project.location, folder);
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
        console.log(`Created folder: ${folderPath}`);
      }
    });
  }

  /** Create files */
  private createFiles(): void {
    this.project.files.forEach(({ nameAndPath, content }) => {
      const filePath = path.join(this.project.location, this.replacePlaceholders(nameAndPath, this.project.name));
      if (!fs.existsSync(filePath)) {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, content || '');
        console.log(`Created file: ${filePath}`);
      }
    });
  }

  /** Add scripts to package.json */
  private updatePackageJsonScripts(): void {
    const packageJsonPath = path.join(this.project.location, 'package.json');
    if (!fs.existsSync(packageJsonPath)) return;

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    packageJson.scripts = { ...packageJson.scripts, ...this.project.scripts };

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('Updated package.json scripts.');
  }

  /** Run the full setup process */
  createProject(): void {
    const { location, vscodeSettings } = this.project;

    fs.mkdirSync(location, { recursive: true });
    console.log(`Created project folder: ${location}`);

    this.executeInitSteps();
    this.installDependencies();
    this.createFolders();
    this.createFiles();
    this.updatePackageJsonScripts();

    if (vscodeSettings) {
      console.log(`Opening project in VS Code: ${location}`);
      execSync(`code "${location}"`, { stdio: 'inherit' });
    }

    console.log('Project setup complete!');
    this.resetProject();
  }
}
