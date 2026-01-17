// components/PDFViewer.tsx
'use client';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';

export default function PDFViewer({ url }: { url: string }) {
    console.log("PDF URL: ", url);
    return (
        <div className="h-full w-full">
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                <Viewer fileUrl={url} />
            </Worker>
        </div>
    );
}