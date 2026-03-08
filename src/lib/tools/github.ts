/**
 * AETHON Tool: GitHub API — write files and open PRs (self-mutation persist)
 * Real API calls — no mocks.
 */

const GITHUB_API = "https://api.github.com";

function getToken(): string {
  const token = process.env.GITHUB_ACCESS_TOKEN;
  if (!token) throw new Error("GITHUB_ACCESS_TOKEN is not configured.");
  return token;
}

function headers() {
  return {
    Authorization: `Bearer ${getToken()}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
  };
}

// ─── Get file SHA (required for updates) ─────────────────────────────────────
async function getFileSha(owner: string, repo: string, path: string, branch: string) {
  const res = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
    { headers: headers() }
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub getFileSha error ${res.status}`);
  const data = await res.json();
  return data.sha as string;
}

// ─── Write File ───────────────────────────────────────────────────────────────
export async function githubWriteFile(
  owner: string,
  repo: string,
  filePath: string,
  content: string,
  commitMessage: string,
  branch = "main"
): Promise<{ commitSha: string; fileUrl: string }> {
  const sha = await getFileSha(owner, repo, filePath, branch);
  const encodedContent = Buffer.from(content, "utf-8").toString("base64");

  const body: Record<string, unknown> = {
    message: commitMessage,
    content: encodedContent,
    branch,
  };
  if (sha) body.sha = sha;

  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/contents/${filePath}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub writeFile error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return {
    commitSha: data.commit.sha as string,
    fileUrl: data.content.html_url as string,
  };
}

// ─── Create Branch ────────────────────────────────────────────────────────────
export async function githubCreateBranch(
  owner: string,
  repo: string,
  newBranch: string,
  fromBranch = "main"
): Promise<void> {
  // Get SHA of fromBranch
  const refRes = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/git/ref/heads/${fromBranch}`,
    { headers: headers() }
  );
  if (!refRes.ok) throw new Error(`GitHub getRef error ${refRes.status}`);
  const refData = await refRes.json();
  const sha = refData.object.sha as string;

  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/git/refs`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ ref: `refs/heads/${newBranch}`, sha }),
  });

  if (!res.ok && res.status !== 422) {
    // 422 = branch already exists
    const err = await res.text();
    throw new Error(`GitHub createBranch error ${res.status}: ${err}`);
  }
}

// ─── Open Pull Request ────────────────────────────────────────────────────────
export async function githubOpenPR(
  owner: string,
  repo: string,
  title: string,
  body: string,
  head: string,
  base = "main"
): Promise<{ prNumber: number; prUrl: string }> {
  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/pulls`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ title, body, head, base }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub openPR error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return {
    prNumber: data.number as number,
    prUrl: data.html_url as string,
  };
}
