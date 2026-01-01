# Task 2.6.1: Export Formats (PDF, HTML)

**Task ID**: 2.6.1
**Phase**: 2.6 - Enhanced Features
**Estimated**: 5 hours
**Dependencies**: None (some features require auth for cloud features)
**Status**: Not Started

---

## Overview

Add PDF and HTML export options for generated planning documents.

---

## Deliverables

- [ ] PDF export using react-pdf or html2pdf
- [ ] HTML export with inline styles
- [ ] Export format selector in DocumentViewer
- [ ] Styled exports matching theme

---

## Files to Create

```
packages/web/src/lib/export/
├── pdf-export.ts
├── html-export.ts
└── export-utils.ts

packages/web/src/components/export/
└── ExportFormatSelector.tsx
```

---

## Success Criteria

- PDF generates correctly
- HTML renders in any browser
- Styles match application theme

---

## Notes

Current export is Markdown only. Adding PDF and HTML provides:
- PDF: Professional document format, easy to share
- HTML: Self-contained file with styles, viewable anywhere

Library options:
- `react-pdf` - React-specific PDF generation
- `html2pdf.js` - HTML to PDF conversion
- `jsPDF` - Pure JavaScript PDF generation

Ensure exports respect:
- Light/dark theme (let user choose or use light for PDF)
- Typography (Satoshi/General Sans fonts may need fallbacks)
- Code syntax highlighting colors
