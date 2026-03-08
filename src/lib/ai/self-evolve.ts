/**
 * AETHON Self-Mutation Engine
 * 
 * Allows AETHON to read, analyze, and modify its own source code.
 * Includes backup/restore for safety, policy enforcement, and security scanning.
 */

import fs from 'fs/promises';
import path from 'path';
import { scanCode, isSafeForEvolution, type SecurityScanResult } from './security-scanner';

const BACKUP_EXT = '.bak';

/**
 * Check if a file path is allowed for mutation
 * Only files in the src/ directory (excluding node_modules, .next, etc.)
 */
function isAllowedForMutation(filePath: string): boolean {
  const normalizedPath = path.normalize(filePath);
  
  // Block dangerous paths
  const blockedPaths = [
    'node_modules',
    '.next',
    '.git',
    'dist',
    'build',
    'package-lock.json',
    'bun.lock',
    '.env',
    '.env.local',
    '.env.example',
  ];
  
  for (const blockedPath of blockedPaths) {
    if (normalizedPath.includes(blockedPath)) {
      return false;
    }
  }
  
  // Only allow files in src/
  return normalizedPath.startsWith('src' + path.sep) || normalizedPath.startsWith('src/');
}

/**
 * Create a backup of a file before mutation
 */
async function createBackup(filePath: string): Promise<string> {
  const backupPath = filePath + BACKUP_EXT;
  await fs.copyFile(filePath, backupPath);
  return backupPath;
}

/**
 * Restore from backup if mutation fails
 */
async function restoreFromBackup(filePath: string): Promise<void> {
  const backupPath = filePath + BACKUP_EXT;
  try {
    await fs.copyFile(backupPath, filePath);
    await fs.unlink(backupPath); // Clean up backup after restore
  } catch {
    // If restore fails, leave the backup for manual recovery
    console.error(`Failed to restore ${filePath} from backup`);
  }
}

/**
 * Clean up old backup files
 */
async function cleanupBackup(filePath: string): Promise<void> {
  const backupPath = filePath + BACKUP_EXT;
  try {
    await fs.unlink(backupPath);
  } catch {
    // Backup doesn't exist, ignore
  }
}

/**
 * Evolve AETHON's source code
 * 
 * @param fileName - Relative path from project root (e.g., 'src/lib/tools/fs.ts')
 * @param improvedCode - The new code to write
 * @param skipSecurityScan - Skip security scan (default: false)
 * @returns Result with success status and message
 */
export async function evolveAethon(
  fileName: string, 
  improvedCode: string,
  skipSecurityScan: boolean = false
): Promise<{ success: boolean; message: string; error?: string; securityResult?: SecurityScanResult }> {
  // Security: Only allow mutation of source files
  if (!isAllowedForMutation(fileName)) {
    return { 
      success: false, 
      message: '',
      error: `Security: Cannot mutate ${fileName} - not in allowed directory` 
    };
  }

  const targetPath = path.join(process.cwd(), fileName);
  
  // Step 0: Security scan before mutation
  if (!skipSecurityScan) {
    const securityCheck = isSafeForEvolution(improvedCode);
    
    if (!securityCheck.safe) {
      const blockerList = securityCheck.blockers
        .map(b => `- [${b.severity}] ${b.title} at line ${b.line}: ${b.recommendation}`)
        .join('\n');
      
      return {
        success: false,
        message: '',
        error: `Security scan FAILED - blocking self-evolution:\n${blockerList}`,
        securityResult: scanCode(improvedCode)
      };
    }
    
    // Log warnings but allow evolution
    if (securityCheck.warnings.length > 0) {
      console.log(`[Self-Evolve] Security warnings for ${fileName}:`);
      securityCheck.warnings.forEach(w => {
        console.log(`  - [${w.severity}] ${w.title}: ${w.recommendation}`);
      });
    }
    
    console.log(`[Self-Evolve] Security scan passed for ${fileName}`);
  }
  
  // Verify file exists before attempting mutation
  try {
    await fs.access(targetPath);
  } catch {
    return { 
      success: false, 
      message: '',
      error: `File not found: ${fileName}` 
    };
  }

  try {
    // Step 1: Create backup before mutation
    await createBackup(targetPath);
    console.log(`[Self-Evolve] Created backup: ${fileName}${BACKUP_EXT}`);
    
    // Step 2: Write the improved code
    await fs.writeFile(targetPath, improvedCode, 'utf8');
    console.log(`[Self-Evolve] Successfully mutated: ${fileName}`);
    
    // Step 3: Clean up backup after successful write
    await cleanupBackup(targetPath);
    
    // Get final security result
    const securityResult = scanCode(improvedCode);
    
    return { 
      success: true, 
      message: `🧬 AETHON self-evolved: ${fileName} (Security: ${securityResult.score}/100)`,
      securityResult
    };
  } catch (error) {
    // Step 4: Rollback on failure
    console.error(`[Self-Evolve] Mutation failed, restoring backup: ${fileName}`);
    await restoreFromBackup(targetPath);
    
    return { 
      success: false, 
      message: '',
      error: `Self-evolution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      securityResult: scanCode(improvedCode)
    };
  }
}

/**
 * Read AETHON's own source code for analysis
 * 
 * @param fileName - Relative path from project root
 * @returns The file contents or null if not allowed/not found
 */
export async function readOwnCode(fileName: string): Promise<{ 
  success: boolean; 
  content?: string; 
  error?: string;
  message?: string;
}> {
  if (!isAllowedForMutation(fileName)) {
    return { 
      success: false, 
      message: '',
      error: `Security: Cannot read ${fileName}` 
    };
  }

  const targetPath = path.join(process.cwd(), fileName);
  
  try {
    const content = await fs.readFile(targetPath, 'utf8');
    return { success: true, content };
  } catch (error) {
    return { 
      success: false, 
      error: `Failed to read ${fileName}: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

/**
 * List available files for self-mutation
 * Only lists files in src/ directory
 */
export async function listOwnFiles(dir: string = 'src'): Promise<string[]> {
  const files: string[] = [];
  const basePath = path.join(process.cwd(), dir);
  
  async function walkDirectory(currentPath: string): Promise<void> {
    try {
      const entries = await fs.readdir(currentPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name);
        
        if (entry.isDirectory()) {
          // Skip hidden and build directories
          if (!entry.name.startsWith('.') && !['node_modules', '.next'].includes(entry.name)) {
            await walkDirectory(fullPath);
          }
        } else if (entry.isFile() && entry.name.endsWith('.ts')) {
          // Return relative path
          files.push(path.relative(process.cwd(), fullPath));
        }
      }
    } catch {
      // Skip directories we can't read
    }
  }
  
  await walkDirectory(basePath);
  return files;
}
