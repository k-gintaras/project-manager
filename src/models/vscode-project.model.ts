export interface VsCodeProject {
  name: string;
  rootPath: string;
  tags: string[];
  favorite: boolean;
  enabled: boolean;
  libraries?: string[]; // Optional for package.json analysis
}
