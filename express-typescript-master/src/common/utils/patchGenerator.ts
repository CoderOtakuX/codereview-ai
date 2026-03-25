interface PatchParams {
  filename: string;
  line: number;
  affectedCode: string;
  fixedCode: string;
  context?: string; // Optional: surrounding code for better context
}

export function generateGitPatch(params: PatchParams): string {
  const { filename, line, affectedCode, fixedCode } = params;
  
  // Split code into lines for proper diff formatting
  const oldLines = affectedCode.split('\n');
  const newLines = fixedCode.split('\n');
  
  // Calculate line range
  const startLine = line;
  const oldCount = oldLines.length;
  const newCount = newLines.length;
  
  // Generate unified diff format
  const patch = `diff --git a/${filename} b/${filename}
--- a/${filename}
+++ b/${filename}
@@ -${startLine},${oldCount} +${startLine},${newCount} @@
${oldLines.map(l => `-${l}`).join('\n')}
${newLines.map(l => `+${l}`).join('\n')}
`;

  return patch;
}

export function generateMultiIssuePatch(
  filename: string,
  issues: Array<{ line: number, affectedCode: string, fixedCode: string }>
): string {
  // Sort issues by line number (apply from bottom to top to avoid offset issues)
  const sortedIssues = [...issues].sort((a, b) => b.line - a.line);
  
  const patches = sortedIssues.map(issue => 
    generateGitPatch({ filename, ...issue })
  );
  
  return patches.join('\n\n');
}
