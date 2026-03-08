/**
 * AETHON Automatic Security Scanner
 * 
 * Scans code for security vulnerabilities before self-evolution.
 * Includes vulnerability detection, pattern matching, and fix recommendations.
 */

import crypto from 'crypto';

// ─── Vulnerability Types ───────────────────────────────────────────────────────
export type VulnerabilitySeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export interface Vulnerability {
  id: string;
  type: string;
  severity: VulnerabilitySeverity;
  title: string;
  description: string;
  line?: number;
  code?: string;
  recommendation: string;
  cwe?: string;
  owasp?: string;
}

export interface SecurityScanResult {
  safe: boolean;
  vulnerabilities: Vulnerability[];
  score: number; // 0-100
  summary: string;
}

// ─── Security Rules (OWASP Top 10 + Common Issues) ─────────────────────────────
const SECURITY_RULES: Array<{
  pattern: RegExp;
  type: string;
  severity: VulnerabilitySeverity;
  title: string;
  description: string;
  recommendation: string;
  cwe?: string;
  owasp?: string;
}> = [
  // Command Injection
  {
    pattern: /exec\s*\(\s*[\w\d]*\s*\+|exec\s*\(\s*`|`\)/,
    type: 'command-injection',
    severity: 'critical',
    title: 'Command Injection Risk',
    description: 'Dynamic command execution detected. User input could be executed as shell commands.',
    recommendation: 'Use parameterized commands or a safe execution library. Avoid shell interpolation.',
    cwe: 'CWE-78',
    owasp: 'A03:2021'
  },
  // SQL Injection
  {
    pattern: /`.*\$\{.*\}.*`/,
    type: 'sql-injection',
    severity: 'critical',
    title: 'SQL Injection Risk',
    description: 'String interpolation in SQL query detected.',
    recommendation: 'Use parameterized queries or an ORM. Never interpolate user input into SQL.',
    cwe: 'CWE-89',
    owasp: 'A03:2021'
  },
  // Hardcoded Secrets
  {
    pattern: /(api_key|apikey|secret|token|password)\s*[:=]\s*['"][a-zA-Z0-9_\-]{20,}['"]/i,
    type: 'hardcoded-secret',
    severity: 'critical',
    title: 'Hardcoded Secret Detected',
    description: 'Potential API key, token, or password found in source code.',
    recommendation: 'Move secrets to environment variables. Use a secrets manager.',
    cwe: 'CWE-798',
    owasp: 'A02:2021'
  },
  // Eval Usage
  {
    pattern: /\beval\s*\(/,
    type: 'eval-usage',
    severity: 'high',
    title: 'Dangerous eval() Usage',
    description: 'eval() executes arbitrary code and is a major security risk.',
    recommendation: 'Avoid eval(). Use JSON.parse() for data or function references for logic.',
    cwe: 'CWE-95',
    owasp: 'A03:2021'
  },
  // Path Traversal
  {
    pattern: /\.\.\/|\.\.\\|%2e%2e/i,
    type: 'path-traversal',
    severity: 'high',
    title: 'Path Traversal Risk',
    description: 'Potential path traversal attack detected.',
    recommendation: 'Validate and sanitize file paths. Use a allowlist of permitted paths.',
    cwe: 'CWE-22',
    owasp: 'A01:2021'
  },
  // XSS Risk (innerHTML)
  {
    pattern: /\.innerHTML\s*=|\.html\s*\(/,
    type: 'xss',
    severity: 'medium',
    title: 'Cross-Site Scripting (XSS) Risk',
    description: 'Direct DOM manipulation that could lead to XSS vulnerabilities.',
    recommendation: 'Use textContent instead of innerHTML, or sanitize input with DOMPurify.',
    cwe: 'CWE-79',
    owasp: 'A03:2021'
  },
  // Weak Cryptography
  {
    pattern: /md5\s*\(|sha1\s*\(|des\s*\(/i,
    type: 'weak-crypto',
    severity: 'medium',
    title: 'Weak Cryptographic Algorithm',
    description: 'MD5, SHA1, or DES are cryptographically weak.',
    recommendation: 'Use SHA-256 or stronger. For encryption, use AES-256-GCM.',
    cwe: 'CWE-327',
    owasp: 'A02:2021'
  },
  // Insecure Random
  {
    pattern: /Math\.random\s*\(/,
    type: 'weak-random',
    severity: 'low',
    title: 'Insecure Random Number Generation',
    description: 'Math.random() is not cryptographically secure.',
    recommendation: 'Use crypto.randomBytes() or crypto.getRandomValues() for security-critical code.',
    cwe: 'CWE-338',
    owasp: 'A02:2021'
  },
  // TODO comments with security implications
  {
    pattern: /TODO.*(?:security|vuln|hack|bypass|password|secret)/i,
    type: 'security-todo',
    severity: 'info',
    title: 'Security-related TODO',
    description: 'Security-related TODO comment found.',
    recommendation: 'Address this TODO before production deployment.',
  },
  // Disabled security
  {
    pattern: /(?:secure|ssl|tls)\s*:\s*false/i,
    type: 'disabled-security',
    severity: 'high',
    title: 'Security Feature Disabled',
    description: 'Security setting has been disabled.',
    recommendation: 'Enable security features unless there is a specific reason not to.',
    cwe: 'CWE-295',
    owasp: 'A02:2021'
  },
  // console.log in production (potential info leak)
  {
    pattern: /console\.(log|debug|info)\s*\([^)]*(?:key|token|secret|password|email)/i,
    type: 'info-leak',
    severity: 'medium',
    title: 'Potential Information Leak',
    description: 'Sensitive data being logged to console.',
    recommendation: 'Avoid logging sensitive data. Use a proper logger with redaction.',
    cwe: 'CWE-532',
    owasp: 'A01:2021'
  },
  // Unsafe JSON parse
  {
    pattern: /JSON\.parse\s*\([^)]*\+/,
    type: 'unsafe-json-parse',
    severity: 'medium',
    title: 'Unsafe JSON Parsing',
    description: 'Concatenation before JSON parsing could allow injection.',
    recommendation: 'Parse only complete, validated JSON strings.',
    cwe: 'CWE-91',
    owasp: 'A08:2021'
  }
];

// ─── Scanner Functions ─────────────────────────────────────────────────────────

/**
 * Generate unique vulnerability ID
 */
function generateVulnId(): string {
  return `vuln-${crypto.randomBytes(4).toString('hex')}`;
}

/**
 * Scan code for security vulnerabilities
 */
export function scanCode(code: string): SecurityScanResult {
  const vulnerabilities: Vulnerability[] = [];
  const lines = code.split('\n');

  for (const rule of SECURITY_RULES) {
    const matches = code.matchAll(new RegExp(rule.pattern, 'gi'));
    
    for (const match of matches) {
      // Find line number
      const matchIndex = match.index || 0;
      const lineNumber = code.substring(0, matchIndex).split('\n').length;
      
      // Get the problematic line
      const line = lines[lineNumber - 1]?.trim() || '';
      
      vulnerabilities.push({
        id: generateVulnId(),
        type: rule.type,
        severity: rule.severity,
        title: rule.title,
        description: rule.description,
        line: lineNumber,
        code: line.substring(0, 100), // Truncate long lines
        recommendation: rule.recommendation,
        cwe: rule.cwe,
        owasp: rule.owasp
      });
    }
  }

  // Calculate security score
  const score = calculateSecurityScore(vulnerabilities);
  
  // Generate summary
  const summary = generateSummary(vulnerabilities, score);

  return {
    safe: vulnerabilities.filter(v => v.severity === 'critical' || v.severity === 'high').length === 0,
    vulnerabilities,
    score,
    summary
  };
}

/**
 * Calculate security score based on vulnerabilities
 */
function calculateSecurityScore(vulnerabilities: Vulnerability[]): number {
  const severityWeights: Record<VulnerabilitySeverity, number> = {
    critical: 25,
    high: 15,
    medium: 5,
    low: 2,
    info: 0
  };

  let deduction = 0;
  for (const vuln of vulnerabilities) {
    deduction += severityWeights[vuln.severity] || 0;
  }

  return Math.max(0, 100 - deduction);
}

/**
 * Generate human-readable summary
 */
function generateSummary(vulnerabilities: Vulnerability[], score: number): string {
  const critical = vulnerabilities.filter(v => v.severity === 'critical').length;
  const high = vulnerabilities.filter(v => v.severity === 'high').length;
  const medium = vulnerabilities.filter(v => v.severity === 'medium').length;
  const low = vulnerabilities.filter(v => v.severity === 'low').length;

  let summary = `Security Score: ${score}/100`;
  
  if (critical > 0) summary += ` | ⚠️ ${critical} critical`;
  if (high > 0) summary += ` | ⚠️ ${high} high`;
  if (medium > 0) summary += ` | ℹ️ ${medium} medium`;
  if (low > 0) summary += ` | ℹ️ ${low} low`;
  
  if (vulnerabilities.length === 0) {
    summary += ' | ✅ No vulnerabilities detected';
  }

  return summary;
}

/**
 * Scan multiple files
 */
export async function scanFiles(files: Array<{ path: string; content: string }>): Promise<{
  totalVulnerabilities: number;
  filesWithIssues: string[];
  results: Record<string, SecurityScanResult>;
}> {
  const results: Record<string, SecurityScanResult> = {};
  const filesWithIssues: string[] = [];
  let totalVulnerabilities = 0;

  for (const file of files) {
    const result = scanCode(file.content);
    results[file.path] = result;
    
    if (!result.safe) {
      filesWithIssues.push(file.path);
      totalVulnerabilities += result.vulnerabilities.length;
    }
  }

  return { totalVulnerabilities, filesWithIssues, results };
}

// ─── Auto-Security Enhancement ─────────────────────────────────────────────────

/**
 * Check if code is safe for self-evolution
 */
export function isSafeForEvolution(code: string): {
  safe: boolean;
  blockers: Vulnerability[];
  warnings: Vulnerability[];
} {
  const result = scanCode(code);
  
  const blockers = result.vulnerabilities.filter(
    v => v.severity === 'critical' || v.severity === 'high'
  );
  
  const warnings = result.vulnerabilities.filter(
    v => v.severity === 'medium' || v.severity === 'low' || v.severity === 'info'
  );

  return {
    safe: blockers.length === 0,
    blockers,
    warnings
  };
}

/**
 * Get security recommendations for improving code
 */
export function getSecurityRecommendations(code: string): string[] {
  const result = scanCode(code);
  return result.vulnerabilities.map(v => 
    `[${v.severity.toUpperCase()}] ${v.title}: ${v.recommendation}`
  );
}
