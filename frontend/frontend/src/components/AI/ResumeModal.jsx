import { X, Download } from 'lucide-react';
import jsPDF from 'jspdf';

const ResumeModal = ({ resumeText, onClose }) => {
  if (!resumeText) return null;

  const downloadTXT = () => {
    const blob = new Blob([resumeText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ATS_Resume_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPDF = () => {
    const pdf = new jsPDF();
    pdf.setFont('Times', 'Normal');
    pdf.setFontSize(11);
    const lines = pdf.splitTextToSize(resumeText, 180);
    pdf.text(lines, 15, 20);
    pdf.save(`ATS_Resume_${Date.now()}.pdf`);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
      <div className="bg-white w-11/12 md:w-3/4 max-h-[90vh] rounded-lg shadow-xl relative p-6">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-red-500"
        >
          <X size={24} />
        </button>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">ATS Friendly Resume</h2>
          <div className="flex gap-2">
            <button
              onClick={downloadPDF}
              className="px-3 py-2 bg-blue-600 text-white rounded flex items-center gap-1"
            >
              <Download size={16} /> PDF
            </button>
            <button
              onClick={downloadTXT}
              className="px-3 py-2 bg-teal-600 text-white rounded flex items-center gap-1"
            >
              <Download size={16} /> TXT
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[70vh] whitespace-pre-wrap font-mono text-sm border p-4 rounded bg-gray-50">
          {resumeText}
        </div>
      </div>
    </div>
  );
};

export default ResumeModal;
