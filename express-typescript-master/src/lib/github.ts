export interface GitHubFile {
    filename: string;
    patch?: string;
    status: string;
    additions: number;
    deletions: number;
}

export function parsePRUrl(url: string) {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)\/pull\/(\d+)/);
    if (!match) return null;
    return { owner: match[1], repo: match[2], prNumber: parseInt(match[3]) };
}

export async function fetchPRFiles(owner: string, repo: string, prNumber: number, token?: string): Promise<GitHubFile[]> {
    const headers: Record<string, string> = {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "CodeReviewAI"
    };
    if (token) {
        headers["Authorization"] = `token ${token}`;
    }

    const url = `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}/files?per_page=100`;
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
}

export function extractCodeFromPatch(patch: string): string {
    if (!patch) return "";
    const lines = patch.split("\n");
    const result: string[] = [];
    
    for (const line of lines) {
        if (line.startsWith("@@")) continue;
        if (line.startsWith("-")) continue;
        if (line.startsWith("\\ No newline")) continue;
        
        if (line.startsWith("+")) {
            result.push(line.substring(1));
        } else if (line.startsWith(" ")) {
            result.push(line.substring(1));
        } else {
            result.push(line);
        }
    }
    return result.join("\n");
}

export function detectLanguage(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    const map: Record<string, string> = {
        js: "javascript", jsx: "javascript",
        ts: "typescript", tsx: "typescript",
        py: "python",
        go: "go",
        java: "java",
        cpp: "cpp", c: "cpp", h: "cpp", hpp: "cpp"
    };
    return map[ext || ""] || "other";
}

export function parseRepoUrl(url: string): { owner: string; repo: string } | null {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) return null;
    return { owner: match[1], repo: match[2].replace(/\.git$/, '').replace(/\/$/, '') };
}

function buildHeaders(token?: string): Record<string, string> {
    const headers: Record<string, string> = {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "CodeReviewAI"
    };
    if (token) headers["Authorization"] = `token ${token}`;
    return headers;
}

export async function fetchRepoFiles(
    owner: string,
    repo: string,
    token?: string
): Promise<Array<{ filename: string; content: string; language: string }>> {
    const headers = buildHeaders(token);

    // 1. Get default branch
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    if (!repoRes.ok) throw new Error(`GitHub API error: ${repoRes.status} ${repoRes.statusText}`);
    const repoData = await repoRes.json();
    const defaultBranch = repoData.default_branch;

    // 2. Get file tree recursively
    const treeRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`,
        { headers }
    );
    if (!treeRes.ok) throw new Error(`GitHub API error: ${treeRes.status} ${treeRes.statusText}`);
    const treeData = await treeRes.json();

    // 3. Filter to recognized code files, skip junk directories
    const codeExtensions = ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.go', '.rs', '.cpp', '.c'];
    const skipDirs = ['node_modules', 'dist', '.min.', 'vendor', '__pycache__', '.next', 'build'];

    const codeFiles = (treeData.tree || []).filter((f: any) =>
        f.type === 'blob' &&
        codeExtensions.some((ext: string) => f.path.endsWith(ext)) &&
        !skipDirs.some((dir: string) => f.path.includes(dir))
    );

    // 4. Download each file's content (limit to 20)
    const results: Array<{ filename: string; content: string; language: string }> = [];
    for (const file of codeFiles.slice(0, 20)) {
        try {
            const contentRes = await fetch(file.url, { headers });
            if (!contentRes.ok) continue;
            const contentData = await contentRes.json();
            const decoded = Buffer.from(contentData.content, 'base64').toString('utf-8');

            results.push({
                filename: file.path,
                content: decoded,
                language: detectLanguage(file.path),
            });
        } catch {
            continue; // Skip files that fail to download
        }
    }

    return results;
}

export async function fetchRepoFileTree(
    owner: string,
    repo: string,
    token?: string
): Promise<Array<{ path: string; url: string; size: number }>> {
    const headers = buildHeaders(token);

    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    if (!repoRes.ok) throw new Error(`GitHub API error: ${repoRes.status} ${repoRes.statusText}`);
    const repoData = await repoRes.json();
    const defaultBranch = repoData.default_branch;

    const treeRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`,
        { headers }
    );
    if (!treeRes.ok) throw new Error(`GitHub API error: ${treeRes.status} ${treeRes.statusText}`);
    const treeData = await treeRes.json();

    const codeExtensions = ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.go', '.rs', '.cpp', '.c'];
    const skipDirs = ['node_modules', 'dist', '.min.', 'vendor', '__pycache__', '.next', 'build'];

    return (treeData.tree || [])
        .filter((f: any) =>
            f.type === 'blob' &&
            codeExtensions.some((ext: string) => f.path.endsWith(ext)) &&
            !skipDirs.some((dir: string) => f.path.includes(dir))
        )
        .map((f: any) => ({ path: f.path, url: f.url, size: f.size || 0 }));
}

export async function fetchFileContent(fileUrl: string, token?: string): Promise<string> {
    const headers = buildHeaders(token);
    const res = await fetch(fileUrl, { headers });
    if (!res.ok) throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
    const data = await res.json();
    return Buffer.from(data.content, 'base64').toString('utf-8');
}
