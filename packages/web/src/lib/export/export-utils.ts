import { marked } from 'marked';

export type ExportFormat = 'markdown' | 'html' | 'pdf';

export interface ExportOptions {
  theme?: 'light' | 'dark';
  filename?: string;
  includeTimestamp?: boolean;
}

export function sanitizeFilename(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export function generateFilename(
  agentName: string,
  format: ExportFormat,
  includeTimestamp = false
): string {
  const base = sanitizeFilename(agentName);
  const timestamp = includeTimestamp
    ? `-${new Date().toISOString().slice(0, 10)}`
    : '';
  const ext = format === 'pdf' ? 'pdf' : format === 'html' ? 'html' : 'md';
  return `${base}-planning-doc${timestamp}.${ext}`;
}

export async function markdownToHtml(markdown: string): Promise<string> {
  return await marked(markdown, {
    gfm: true,
    breaks: true,
  });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
