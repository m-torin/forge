#!/usr/bin/env python3
"""
Safe TypeScript Error Fixer
Only applies extremely safe, pattern-based fixes that won't break code
"""

import subprocess
import re
import os
import shutil
from pathlib import Path
from typing import List, Tuple, Dict, Optional
import json
import argparse
from datetime import datetime

class SafeTypeScriptFixer:
    def __init__(self, repo_root: str):
        self.repo_root = Path(repo_root)
        self.backup_dir = self.repo_root / '.typescript-fixer-backups' / datetime.now().strftime('%Y%m%d_%H%M%S')
        self.fixes_applied = 0
        self.files_modified = set()
        
        # Define ONLY the safest possible fixes
        self.safe_patterns = [
            # Fix arrow function syntax errors
            (r'(\w+)\s*=>\s*_:\s*any\s*{', r'\1 => ({'),  # param => _: any{ -> param => ({
            (r'\(\s*\)\s*=>\s*_:\s*any\s*{', r'() => ({'),  # () => _: any{ -> () => ({
            (r',\s*\(\s*_:\s*any\s*\)\s*=>\s*_:\s*any\s*{', r', () => ({'),  # , (_: any) => _: any{ -> , () => ({
            
            # Fix vi.fn mock syntax
            (r'vi\.fn\(\(\)\s*=>\s*_:\s*any\s*{', r'vi.fn(() => ({'),
            (r'vi\.fn\(\(_:\s*any\)\s*=>\s*_:\s*any\s*{', r'vi.fn(() => ({'),
            
            # Fix object return in arrow functions missing parentheses
            (r'=>\s*{\s*\.\.\.', r'=> ({ ...'),  # => { ... -> => ({ ...
            
            # Add missing semicolons for const/let/var declarations
            (r'^(\s*)(const|let|var)\s+(\w+)\s*=\s*([^;]+)$', r'\1\2 \3 = \4;'),
            
            # Fix double commas
            (r',,', r','),
            
            # Fix trailing commas in function parameters (TypeScript doesn't like them in some contexts)
            (r'\(\s*([^,\)]+),\s*\)', r'(\1)'),  # (param,) -> (param)
        ]
        
    def create_backup(self, filepath: Path):
        """Create a backup of the file before modifying"""
        backup_path = self.backup_dir / filepath.relative_to(self.repo_root)
        backup_path.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(filepath, backup_path)
        
    def validate_fix(self, original: str, fixed: str) -> bool:
        """Validate that a fix doesn't break code structure"""
        # Check balanced brackets
        for bracket_pair in [('(', ')'), ('{', '}'), ('[', ']')]:
            if original.count(bracket_pair[0]) != fixed.count(bracket_pair[0]) or \
               original.count(bracket_pair[1]) != fixed.count(bracket_pair[1]):
                return False
                
        # Check we didn't remove important keywords
        important_keywords = ['return', 'throw', 'if', 'else', 'for', 'while', 'switch', 'case', 'try', 'catch']
        for keyword in important_keywords:
            if original.count(keyword) != fixed.count(keyword):
                return False
                
        # Make sure we didn't create invalid syntax
        if '{{' in fixed or '}}' in fixed or '((' in fixed and '((' not in original:
            return False
            
        return True
    
    def apply_safe_patterns(self, filepath: str) -> int:
        """Apply only the safest pattern-based fixes"""
        file_path = self.repo_root / filepath
        
        if not file_path.exists():
            return 0
            
        # Skip non-TypeScript files
        if file_path.suffix not in ['.ts', '.tsx', '.js', '.jsx']:
            return 0
            
        # Skip node_modules and generated files
        if 'node_modules' in str(file_path) or '.next' in str(file_path) or 'dist' in str(file_path):
            return 0
            
        fixes_count = 0
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
            original_content = content
            
            # Apply each safe pattern
            for pattern, replacement in self.safe_patterns:
                new_content = re.sub(pattern, replacement, content, flags=re.MULTILINE)
                
                # Only apply if it changed something and is valid
                if new_content != content and self.validate_fix(content, new_content):
                    content = new_content
                    fixes_count += len(re.findall(pattern, original_content, flags=re.MULTILINE))
            
            # Only write if we made changes
            if content != original_content:
                # Create backup first
                self.create_backup(file_path)
                
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                    
                self.files_modified.add(filepath)
                self.fixes_applied += fixes_count
                print(f"✅ Fixed {fixes_count} issues in {filepath}")
                
        except Exception as e:
            print(f"❌ Error processing {filepath}: {e}")
            
        return fixes_count
    
    def find_typescript_files(self) -> List[str]:
        """Find all TypeScript files in the repo"""
        files = []
        
        for ext in ['*.ts', '*.tsx']:
            for file in self.repo_root.rglob(ext):
                # Skip excluded directories
                if any(excluded in str(file) for excluded in ['node_modules', '.next', 'dist', '.git']):
                    continue
                    
                files.append(str(file.relative_to(self.repo_root)))
                
        return files
    
    def run_typecheck_for_file(self, filepath: str) -> bool:
        """Run typecheck on a specific file to verify it's not broken"""
        file_path = self.repo_root / filepath
        
        # Try to compile just this file
        result = subprocess.run(
            ['npx', 'tsc', '--noEmit', '--skipLibCheck', str(file_path)],
            cwd=self.repo_root,
            capture_output=True,
            text=True
        )
        
        return result.returncode == 0
    
    def restore_backup(self, filepath: str):
        """Restore file from backup if something went wrong"""
        backup_path = self.backup_dir / filepath
        original_path = self.repo_root / filepath
        
        if backup_path.exists():
            shutil.copy2(backup_path, original_path)
            print(f"↩️  Restored {filepath} from backup")
    
    def generate_report(self) -> str:
        """Generate a detailed report"""
        report = f"""
Safe TypeScript Fixer Report
===========================
Backup directory: {self.backup_dir}
Files modified: {len(self.files_modified)}
Total fixes applied: {self.fixes_applied}

Patterns applied:
- Arrow function syntax: () => _: any{{ → () => ({{
- Mock function syntax: vi.fn(() => _: any{{ → vi.fn(() => ({{
- Missing semicolons on declarations
- Double comma removal
- Trailing comma removal in function params

Modified files:
"""
        for file in sorted(self.files_modified):
            report += f"  - {file}\n"
            
        report += f"\nTo restore all files: rm -rf modified files and copy from {self.backup_dir}"
            
        return report
    
    def run(self, dry_run: bool = False, verify: bool = True):
        """Main execution"""
        print("🔍 Finding TypeScript files...")
        files = self.find_typescript_files()
        print(f"📁 Found {len(files)} TypeScript files")
        
        if dry_run:
            print("\n🔍 DRY RUN MODE - No files will be modified")
            
        # Create backup directory
        if not dry_run:
            self.backup_dir.mkdir(parents=True, exist_ok=True)
            print(f"\n💾 Backup directory: {self.backup_dir}")
        
        print("\n🔧 Applying safe patterns...")
        
        for i, filepath in enumerate(files, 1):
            if i % 100 == 0:
                print(f"Progress: {i}/{len(files)} files...")
                
            if dry_run:
                # In dry run, just check what would be fixed
                with open(self.repo_root / filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                    
                for pattern, _ in self.safe_patterns:
                    matches = re.findall(pattern, content, flags=re.MULTILINE)
                    if matches:
                        print(f"Would fix {len(matches)} instances of pattern in {filepath}")
            else:
                fixes = self.apply_safe_patterns(filepath)
                
                # Optionally verify the file still compiles
                if verify and fixes > 0:
                    if not self.run_typecheck_for_file(filepath):
                        print(f"⚠️  TypeScript check failed for {filepath}, restoring backup...")
                        self.restore_backup(filepath)
                        self.files_modified.discard(filepath)
                        self.fixes_applied -= fixes
        
        print(self.generate_report())
        
        if not dry_run and self.files_modified:
            print("\n⚠️  IMPORTANT: Run 'pnpm typecheck' to verify all fixes are correct!")
            print(f"💾 Backups saved to: {self.backup_dir}")

def main():
    parser = argparse.ArgumentParser(description='Safe TypeScript error fixer')
    parser.add_argument('--dry-run', action='store_true', help='Show what would be fixed without modifying files')
    parser.add_argument('--no-verify', action='store_true', help='Skip TypeScript verification after fixes')
    parser.add_argument('--repo-root', default='/Users/torin/repos/new--/forge', help='Repository root path')
    
    args = parser.parse_args()
    
    fixer = SafeTypeScriptFixer(args.repo_root)
    fixer.run(dry_run=args.dry_run, verify=not args.no_verify)

if __name__ == '__main__':
    main()