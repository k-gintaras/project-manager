import fs from 'fs';
import path from 'path';
import { VsCodeProject } from '../src/models/vscode-project.model';

// Replace with the directories you want to scan
const baseDirs = ['C:/Users/Ubaby/AngularProjects', 'C:/Users/Ubaby/NodeJS Projects', 'C:/Users/Ubaby/git'];

const outputPath = path.join(__dirname, 'projects.json');

const projects: VsCodeProject[] = [];

baseDirs.forEach((baseDir) => {
  const entries = fs.readdirSync(baseDir, { withFileTypes: true });
  entries.forEach((entry) => {
    if (entry.isDirectory()) {
      projects.push({
        name: entry.name,
        rootPath: path.join(baseDir, entry.name),
        tags: [], // Add tags if needed
        enabled: true,
        favorite: false,
      });
    }
  });
});

fs.writeFileSync(outputPath, JSON.stringify(projects, null, 2));
console.log(`Projects.json created at ${outputPath}`);
