import { useState } from 'react';
import { PlanningDocumentGenerator } from '@/lib/documentation/document-generator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Copy, Check, FileText } from 'lucide-react';
import type { AgentRequirements, AgentRecommendations } from '@/types/agent';

interface DocumentExportProps {
  templateId: string;
  agentName: string;
  requirements: AgentRequirements;
  recommendations: AgentRecommendations;
}

export function DocumentExport({
  templateId,
  agentName,
  requirements,
  recommendations,
}: DocumentExportProps) {
  const [copied, setCopied] = useState(false);

  const generator = new PlanningDocumentGenerator();
  const document = generator.generate({
    templateId,
    agentName,
    requirements,
    recommendations,
  });

  const preview = document.length > 500 ? `${document.slice(0, 500)}...` : document;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(document);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([document], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `${agentName.toLowerCase().replace(/\s+/g, '-')}-planning-doc.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Planning Document
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap font-mono">
          {preview}
        </pre>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleCopy}>
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </Button>
          <Button onClick={handleDownload}>
            <Download className="h-4 w-4" />
            Download as Markdown
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
