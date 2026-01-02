import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { generateHtmlString } from './html-export';
import { generateFilename } from './export-utils';

export interface PdfExportOptions {
  filename?: string;
  pageSize?: 'a4' | 'letter';
  orientation?: 'portrait' | 'landscape';
}

export async function exportAsPdf(
  markdown: string,
  agentName: string,
  options: PdfExportOptions = {}
): Promise<void> {
  const {
    filename,
    pageSize = 'a4',
    orientation = 'portrait',
  } = options;

  const htmlString = await generateHtmlString(markdown, agentName, 'light');

  const container = document.createElement('div');
  container.innerHTML = htmlString;
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = orientation === 'portrait' ? '210mm' : '297mm';
  container.style.backgroundColor = '#edd5c5';
  document.body.appendChild(container);

  const body = container.querySelector('body');
  const contentElement = body ?? container;

  try {
    const canvas = await html2canvas(contentElement as HTMLElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#edd5c5',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: pageSize,
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const contentWidth = pageWidth - margin * 2;

    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = contentWidth / imgWidth;
    const scaledHeight = imgHeight * ratio;

    let heightLeft = scaledHeight;
    let position = margin;
    let page = 1;

    pdf.addImage(imgData, 'PNG', margin, position, contentWidth, scaledHeight);
    heightLeft -= pageHeight - margin * 2;

    while (heightLeft > 0) {
      position = -(pageHeight - margin * 2) * page + margin;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', margin, position, contentWidth, scaledHeight);
      heightLeft -= pageHeight - margin * 2;
      page++;
    }

    const outputFilename = filename ?? generateFilename(agentName, 'pdf');
    pdf.save(outputFilename);
  } finally {
    document.body.removeChild(container);
  }
}
