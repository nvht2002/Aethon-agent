/**
 * AETHON Tool: Vercel Deployment API
 * Real API calls — no mocks.
 */

const VERCEL_API = "https://api.vercel.com";

function getToken(): string {
  const token = process.env.VERCEL_TOKEN;
  if (!token) throw new Error("VERCEL_TOKEN is not configured.");
  return token;
}

// ─── List Deployments ─────────────────────────────────────────────────────────
export async function listDeployments(projectId?: string, limit = 10) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (projectId) params.set("projectId", projectId);

  const res = await fetch(`${VERCEL_API}/v6/deployments?${params}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Vercel listDeployments error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.deployments as Array<{
    uid: string;
    name: string;
    url: string;
    state: string;
    createdAt: number;
  }>;
}

// ─── Trigger Deployment ───────────────────────────────────────────────────────
export interface VercelDeployOptions {
  name: string;
  gitSource?: {
    type: "github";
    repoId: string;
    ref: string;
  };
  projectSettings?: {
    framework?: string;
    buildCommand?: string;
    outputDirectory?: string;
  };
  env?: Record<string, string>;
}

export async function triggerDeploy(options: VercelDeployOptions) {
  const res = await fetch(`${VERCEL_API}/v13/deployments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: options.name,
      gitSource: options.gitSource,
      projectSettings: options.projectSettings,
      env: options.env ?? {},
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Vercel triggerDeploy error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return {
    id: data.id as string,
    url: data.url as string,
    state: data.readyState as string,
  };
}

// ─── Get Deployment Status ────────────────────────────────────────────────────
export async function getDeploymentStatus(deploymentId: string) {
  const res = await fetch(`${VERCEL_API}/v13/deployments/${deploymentId}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Vercel getDeploymentStatus error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return {
    id: data.id as string,
    url: data.url as string,
    state: data.readyState as string,
    createdAt: data.createdAt as number,
  };
}
