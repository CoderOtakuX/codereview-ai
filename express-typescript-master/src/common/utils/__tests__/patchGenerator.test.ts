import { generateGitPatch, generateMultiIssuePatch } from '../patchGenerator';

describe('patchGenerator', () => {
  describe('generateGitPatch', () => {
    it('should generate a valid unified diff patch for a single line replacement', () => {
      const patch = generateGitPatch({
        filename: 'src/app.ts',
        line: 15,
        affectedCode: 'const x = var1;',
        fixedCode: 'const x = var2;'
      });

      expect(patch).toContain('diff --git a/src/app.ts b/src/app.ts');
      expect(patch).toContain('--- a/src/app.ts');
      expect(patch).toContain('+++ b/src/app.ts');
      expect(patch).toContain('@@ -15,1 +15,1 @@');
      expect(patch).toContain('-const x = var1;');
      expect(patch).toContain('+const x = var2;');
    });

    it('should handle multi-line replacements correctly', () => {
      const patch = generateGitPatch({
        filename: 'utils.js',
        line: 42,
        affectedCode: 'function old() {\n  return false;\n}',
        fixedCode: 'function old() {\n  return true;\n}'
      });

      expect(patch).toContain('@@ -42,3 +42,3 @@');
      expect(patch).toContain('-function old() {');
      expect(patch).toContain('-  return false;');
      expect(patch).toContain('-}');
      expect(patch).toContain('+function old() {');
      expect(patch).toContain('+  return true;');
      expect(patch).toContain('+}');
    });
  });

  describe('generateMultiIssuePatch', () => {
    it('should combine multiple issues into a single patch string sorted bottom-to-top', () => {
      const issues = [
        { line: 10, affectedCode: 'var a = 1;', fixedCode: 'const a = 1;' },
        { line: 20, affectedCode: 'var b = 2;', fixedCode: 'const b = 2;' }
      ];

      const multiPatch = generateMultiIssuePatch('test.ts', issues);
      
      // Should sort line 20 first, then line 10
      const patchParts = multiPatch.split('diff --git');
      expect(patchParts.length).toBe(3); // 1 empty string before the first split, then 2 patches
      
      expect(patchParts[1]).toContain('@@ -20,1 +20,1 @@');
      expect(patchParts[2]).toContain('@@ -10,1 +10,1 @@');
    });
  });
});
