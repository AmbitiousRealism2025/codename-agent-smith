import { useState } from 'react';
import { PlanningDocumentGenerator } from '@/lib/documentation/document-generator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Check, FileText } from 'lucide-react';
import { ExportFormatSelector } from './ExportFormatSelector';
import { exportAsHtml, exportAsPdf, downloadBlob, generateFilename, type ExportFormat } from '@/lib/export';
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
  const [isExporting, setIsExporting] = useState(false);

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

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true);
    try {
      switch (format) {
        case 'markdown': {
          const blob = new Blob([document], { type: 'text/markdown' });
          downloadBlob(blob, generateFilename(agentName, 'markdown'));
          break;
        }
        case 'html': {
          await exportAsHtml(document, agentName);
          break;
        }
        case 'pdf': {
          await exportAsPdf(document, agentName);
          break;
        }
      }
    } catch (error) {
      console.error(`Export failed:`, error);
    } finally {
      setIsExporting(false);
    }
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
          <ExportFormatSelector onSelect={handleExport} isExporting={isExporting} />
        </div>
      </CardContent>
    </Card>
  );
}
