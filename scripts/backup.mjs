#!/usr/bin/env node
// Backup script voor TrimGids
// Maakt een .tar.gz backup van alle belangrijke bestanden

import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const backupDir = 'backups';
const backupFile = `${backupDir}/trimgids-backup-${timestamp}.tar.gz`;

try {
  if (!existsSync(backupDir)) {
    execSync(`mkdir -p ${backupDir}`, { stdio: 'inherit' });
  }
  // Maak een tar.gz van de hele repo BEHALVE .git en node_modules
  const cmd = `tar -czf ${backupFile} --exclude='.git' --exclude='node_modules' --exclude='backups' --exclude='.next' --exclude='.cache' .`;
  console.log('Backup maken:', backupFile);
  execSync(cmd, { stdio: 'inherit' });
  console.log('\nBackup voltooid:', backupFile);
  console.log('Bestandsgrootte:', execSync(`ls -lh ${backupFile}`).toString().trim());
} catch (e) {
  console.error('Backup mislukt:', e.message);
  process.exit(1);
}
