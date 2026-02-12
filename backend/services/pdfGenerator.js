const PDFDocument = require('pdfkit');

class PDFResumeGenerator {
  generateATSResumeBuffer(resumeData) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 50, bottom: 50, left: 50, right: 50 }
        });

        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        doc.fontSize(24).text(resumeData.personalInfo.name || '');
        doc.moveDown();
        doc.text(resumeData.personalInfo.email || '');
        doc.moveDown();

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = new PDFResumeGenerator();
