import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { ProjectSetupService } from './project-setup.service';
import { ProjectType } from '../models/coding-project.model';

jest.mock('fs');
jest.mock('child_process');
jest.spyOn(process, 'chdir').mockImplementation(() => {});

describe('ProjectSetupService', () => {
  let service: ProjectSetupService;
  const mockConfig = {
    type: 'node' as ProjectType,
    initSteps: ['git init', 'npm init -y'],
    installSteps: {
      dependencies: ['express'],
      devDependencies: ['typescript', '@types/node'],
    },
    folders: ['src', 'tests'],
    scripts: { start: 'node index.js' },
    files: [{ nameAndPath: 'src/index.js', content: '// Sample content' }],
    vscodeSettings: false,
  };

  beforeEach(() => {
    service = new ProjectSetupService();
    jest.clearAllMocks();

    // Mock FS methods
    (fs.mkdirSync as jest.Mock).mockImplementation(() => {});
    (fs.existsSync as jest.Mock).mockImplementation((filePath: string) => {
      if (filePath.endsWith('package.json')) return true;
      if (filePath.includes('node.project.json')) return true;
      return false;
    });
    (fs.readFileSync as jest.Mock).mockImplementation((filePath: string) => {
      if (filePath.endsWith('package.json')) {
        return JSON.stringify({ scripts: { existing: 'command' } });
      }
      if (filePath.includes('.project.json')) {
        return JSON.stringify(mockConfig);
      }
      return '';
    });
    (fs.writeFileSync as jest.Mock).mockImplementation(() => {});
    (fs.copyFileSync as jest.Mock).mockImplementation(() => {});
    (execSync as jest.Mock).mockImplementation(() => {});
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('setupProject', () => {
    test('should set project configuration correctly', () => {
      service.setupProject('test-project', 'node');

      // Use JSON.parse to deeply compare objects
      const expectedConfig = {
        ...mockConfig,
        name: 'test-project',
        type: 'node',
        location: path.resolve(process.cwd(), 'test-project'),
      };

      expect(JSON.parse(JSON.stringify(service['project']))).toMatchObject(expectedConfig);
    });

    test('should throw error for unknown project type', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      expect(() => service.setupProject('test-project', 'unknown' as ProjectType)).toThrow('Configuration for project type "unknown" not found.');
    });
  });

  describe('createProject', () => {
    beforeEach(() => {
      service.setupProject('test-project', 'node');
    });

    test('should create project directory and change to it', () => {
      service.createProject();

      expect(fs.mkdirSync).toHaveBeenCalledWith(path.resolve(process.cwd(), 'test-project'), { recursive: true });
      expect(process.chdir).toHaveBeenCalledWith(path.resolve(process.cwd(), 'test-project'));
    });

    test('should execute initialization steps', () => {
      service.createProject();

      mockConfig.initSteps.forEach((step) => {
        expect(execSync).toHaveBeenCalledWith(step, { stdio: 'inherit' });
      });
    });

    test('should install dependencies and devDependencies', () => {
      service.createProject();

      expect(execSync).toHaveBeenCalledWith('npm install express', { stdio: 'inherit' });
      expect(execSync).toHaveBeenCalledWith('npm install --save-dev typescript @types/node', { stdio: 'inherit' });
    });

    test('should create project folders', () => {
      service.createProject();

      mockConfig.folders.forEach((folder) => {
        expect(fs.mkdirSync).toHaveBeenCalledWith(path.join(path.resolve(process.cwd(), 'test-project'), folder), { recursive: true });
      });
    });

    test('should create project files', () => {
      service.createProject();

      mockConfig.files.forEach((file) => {
        expect(fs.writeFileSync).toHaveBeenCalledWith(path.join(path.resolve(process.cwd(), 'test-project'), file.nameAndPath), file.content);
      });
    });

    test('should update package.json scripts', () => {
      service.createProject();

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        path.join(path.resolve(process.cwd(), 'test-project'), 'package.json'),
        JSON.stringify(
          {
            scripts: {
              existing: 'command',
              start: 'node index.js',
            },
          },
          null,
          2
        )
      );
    });

    test('should create configuration files when templates exist', () => {
      (fs.existsSync as jest.Mock).mockImplementation((path: string) => {
        return path.includes('node-tsconfig.json') || path.includes('node-gitignore') || path.includes('node.project.json') || path.endsWith('package.json');
      });

      service.createProject();

      expect(fs.copyFileSync).toHaveBeenCalledWith(expect.stringContaining('node-tsconfig.json'), expect.stringContaining('tsconfig.json'));
      expect(fs.copyFileSync).toHaveBeenCalledWith(expect.stringContaining('node-gitignore'), expect.stringContaining('.gitignore'));
    });

    test('should open VS Code when vscodeSettings is true', () => {
      service.setupProject('test-project', 'node');
      service['project'].vscodeSettings = true;

      service.createProject();

      expect(execSync).toHaveBeenCalledWith(`code "${path.resolve(process.cwd(), 'test-project')}"`, { stdio: 'inherit' });
    });

    test('should skip VS Code when vscodeSettings is false', () => {
      service.createProject();

      expect(execSync).not.toHaveBeenCalledWith(expect.stringContaining('code'), expect.any(Object));
    });
  });
});
