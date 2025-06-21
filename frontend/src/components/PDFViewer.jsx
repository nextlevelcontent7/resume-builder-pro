import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export default function PDFViewer({ url }) {
  const [numPages, setNumPages] = useState(null);
  const { t } = useTranslation();

  const onLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  return (
    <div className="my-4">
      <div className="mb-2 space-x-2">
        <a href={url} className="px-2 py-1 border rounded" download>
          {t('downloadPDF')}
        </a>
        <button onClick={() => window.print()} className="px-2 py-1 border rounded">
          {t('print')}
        </button>
      </div>
      <Document file={url} onLoadSuccess={onLoadSuccess} className="border">
        {Array.from(new Array(numPages), (el, index) => (
          <Page key={`page_${index + 1}`} pageNumber={index + 1} />
        ))}
      </Document>
    </div>
  );
}
