import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const VERSIONS_DIR = path.join(__dirname, 'versions');

interface PackageJson {
  version: string;
  main?: string;
}

export class VersionManager {
  private static ensureVersionsDir() {
    if (!fs.existsSync(VERSIONS_DIR)) {
      fs.mkdirSync(VERSIONS_DIR, { recursive: true });
    }
  }

  private static getVersionDir(version: string): string {
    return path.join(VERSIONS_DIR, version);
  }

  private static async getLatestVersion(): Promise<string> {
    const output = execSync('npm view cron-parser version').toString().trim();
    return output;
  }

  private static async downloadVersion(version: string): Promise<void> {
    const versionDir = VersionManager.getVersionDir(version);

    // Create temporary directory for npm install
    fs.mkdirSync(versionDir, { recursive: true });

    // Create package.json for the specific version
    const packageJson = {
      name: 'cron-parser-benchmark',
      version: '1.0.0',
      private: true,
    };
    fs.writeFileSync(path.join(versionDir, 'package.json'), JSON.stringify(packageJson, null, 2));

    // Install the specific version
    execSync(`npm install cron-parser@${version}`, {
      cwd: versionDir,
      stdio: 'inherit',
    });
  }

  static async getPackageVersion(requestedVersion?: string): Promise<{ version: string; packagePath: string }> {
    VersionManager.ensureVersionsDir();

    // Get version to use (latest or specified)
    const version = requestedVersion || (await VersionManager.getLatestVersion());
    const versionDir = VersionManager.getVersionDir(version);

    // Check if version is already downloaded
    if (!fs.existsSync(versionDir)) {
      console.log(`Downloading cron-parser version ${version}...`);
      await VersionManager.downloadVersion(version);
    }

    // Get the package's main entry point
    const packageJsonPath = path.join(versionDir, 'node_modules', 'cron-parser', 'package.json');
    const packageJson: PackageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const mainFile = packageJson.main || 'index.js';

    const packagePath = path.join(versionDir, 'node_modules', 'cron-parser', mainFile);

    if (!fs.existsSync(packagePath)) {
      throw new Error(`Package entry point not found: ${packagePath}`);
    }

    return {
      version,
      packagePath,
    };
  }
}
