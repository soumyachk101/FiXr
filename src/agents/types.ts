export interface Bug {
  id: number;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  line: number;
  description: string;
  category: string;
}

export interface BugReport {
  bugs: Bug[];
  summary: string;
}

export interface Fix {
  bugId: number;
  action: string;
  fixed: boolean;
}

export interface Unfixed {
  bugId: number;
  reason: string;
}

export interface BugFixResponse {
  fixedCode: string;
  fixes: Fix[];
  unfixed: Unfixed[];
}

export interface Suggestion {
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
  line: number;
  issue: string;
  suggestion: string;
}

export interface QualityReport {
  rating: 'EXCELLENT' | 'GOOD' | 'NEEDS_WORK' | 'POOR';
  score: number;
  suggestions: Suggestion[];
  positives: string[];
  summary: string;
}

export interface SecurityIssue {
  id: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  line: number;
  title: string;
  description: string;
  owasp?: string;
  fix: string;
}

export interface SecurityReport {
  issues: SecurityIssue[];
  overallRisk: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  summary: string;
}

export interface PipelineContext {
  filePath: string;
  language: string;
  originalCode: string;
  bugReport?: BugReport;
  bugFixResponse?: BugFixResponse;
  qualityReport?: QualityReport;
  securityReport?: SecurityReport;
}
