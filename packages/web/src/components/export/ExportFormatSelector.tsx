import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Download, FileText, FileCode, File } from 'lucide-react';
import type { ExportFormat } from '@/lib/export';

interface ExportFormatSelectorProps {
  onSelect: (format: ExportFormat) => void;
  disabled?: boolean;
  isExporting?: boolean;
}

const FORMAT_OPTIONS: { format: ExportFormat; label: string; icon: typeof FileText }[] = [
  { format: 'markdown', label: 'Markdown (.md)', icon: FileText },
  { format: 'html', label: 'HTML (.html)', icon: FileCode },
  { format: 'pdf', label: 'PDF (.pdf)', icon: File },
];

export function ExportFormatSelector({
  onSelect,
  disabled = false,
  isExporting = false,
}: ExportFormatSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button disabled={disabled || isExporting}>
          <Download className="h-4 w-4" />
          {isExporting ? 'Exporting...' : 'Download'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {FORMAT_OPTIONS.map(({ format, label, icon: Icon }) => (
          <DropdownMenuItem
            key={format}
            onClick={() => onSelect(format)}
            className="cursor-pointer"
          >
            <Icon className="h-4 w-4 mr-2" />
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
