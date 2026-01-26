'use client';

import { useState } from 'react';
import { pdfjs, Document, Page } from 'react-pdf';

// Import styles for text layer (enables text selection) and annotations (enables links)
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure the worker to use a secure, modern version from a CDN
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  url: string;
}

export default function PDFViewer({ url }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>();

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  return (
    <div className="flex flex-col items-center w-full h-full overflow-auto bg-gray-100 p-4">
      <Document
        file={url}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={<p>Loading PDF...</p>}
        error={<p>Failed to load PDF.</p>}
        className="flex flex-col gap-4"
      >
        {/* Renders all pages in a vertical scroll. 
            For single page navigation, replace the map with a 'pageNumber' state. */}
        {Array.from(new Array(numPages), (_, index) => (
          <div key={`page_${index + 1}`} className="shadow-lg">
            <Page 
              pageNumber={index + 1} 
              renderAnnotationLayer={true}
              renderTextLayer={true}
              // Optional: scale={1.5} for better resolution
            />
          </div>
        ))}
      </Document>
    </div>
  );
}