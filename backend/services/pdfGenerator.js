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
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });

        const primaryColor = '#1a1a1a';
        const accentColor = '#2563eb';
        const lightGray = '#6b7280';
        let yPosition = 50;

        // HEADER
        doc.fontSize(28)
           .fillColor(primaryColor)
           .font('Helvetica-Bold')
           .text(resumeData.personalInfo.name || 'Your Name', 50, yPosition);
        yPosition += 35;

        // CONTACT
        doc.fontSize(10).fillColor(lightGray).font('Helvetica');
        const contactInfo = [
          resumeData.personalInfo.email,
          resumeData.personalInfo.phone,
          resumeData.personalInfo.linkedin && 'LinkedIn: ' + resumeData.personalInfo.linkedin,
          resumeData.personalInfo.github && 'GitHub: ' + resumeData.personalInfo.github
        ].filter(Boolean);

        doc.text(contactInfo.join(' | '), 50, yPosition, { width: 500 });
        yPosition += 25;

        doc.strokeColor('#e5e7eb')
           .moveTo(50, yPosition)
           .lineTo(545, yPosition)
           .stroke();
        yPosition += 20;

        doc.end();

      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = new PDFResumeGenerator();
