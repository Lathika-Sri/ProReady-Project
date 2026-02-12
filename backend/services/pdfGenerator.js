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

        const primaryColor = '#1a1a1a';
        const accentColor = '#2563eb';
        const lightGray = '#6b7280';
        let y = 50;

        // ================= HEADER =================
        doc.fontSize(24).fillColor(primaryColor).font('Helvetica-Bold')
           .text(resumeData.personalInfo?.name || '', 50, y);
        y += 30;

        doc.fontSize(10).fillColor(lightGray).font('Helvetica');

        const contact = [
          resumeData.personalInfo?.phone,
          resumeData.personalInfo?.email,
          resumeData.personalInfo?.linkedin,
          resumeData.personalInfo?.github
        ].filter(Boolean);

        doc.text(contact.join(' | '), 50, y, { width: 500 });
        y += 20;

        doc.moveTo(50, y).lineTo(550, y).stroke();
        y += 20;

        // ================= EDUCATION =================
        if (resumeData.education?.length > 0) {
          y = this.addSection(doc, 'EDUCATION', y, accentColor);

          resumeData.education.forEach(edu => {
            doc.fontSize(11).fillColor(primaryColor).font('Helvetica-Bold')
               .text(edu.institution || '', 50, y);
            y += 15;

            doc.fontSize(10).fillColor(lightGray).font('Helvetica')
               .text(`${edu.degree || ''} ${edu.cgpa ? '| CGPA: ' + edu.cgpa : ''}`, 50, y);
            y += 15;

            doc.text(edu.year || '', 50, y);
            y += 20;
          });
        }

        // ================= SKILLS =================
        if (resumeData.skills?.technical?.length > 0 || resumeData.skills?.soft?.length > 0) {
          y = this.addSection(doc, 'SKILLS', y, accentColor);

          if (resumeData.skills.technical?.length > 0) {
            doc.fontSize(10).fillColor(lightGray)
               .text('Technical: ' + resumeData.skills.technical.join(', '), 50, y, { width: 500 });
            y += 20;
          }

          if (resumeData.skills.soft?.length > 0) {
            doc.text('Soft Skills: ' + resumeData.skills.soft.join(', '), 50, y, { width: 500 });
            y += 20;
          }
        }

        // ================= PROJECTS =================
        if (resumeData.projects?.length > 0) {
          y = this.addSection(doc, 'PROJECTS', y, accentColor);

          resumeData.projects.forEach(project => {
            doc.fontSize(11).fillColor(primaryColor).font('Helvetica-Bold')
               .text(project.name || '', 50, y);
            y += 15;

            if (project.technologies?.length > 0) {
              doc.fontSize(9).fillColor(accentColor)
                 .text('Technologies: ' + project.technologies.join(', '), 50, y);
              y += 15;
            }

            if (project.description) {
              doc.fontSize(10).fillColor(lightGray)
                 .text(project.description, 50, y, { width: 500 });
              y += doc.heightOfString(project.description, { width: 500 }) + 10;
            }
          });
        }

        // ================= EXPERIENCE =================
        if (resumeData.experience?.length > 0) {
          y = this.addSection(doc, 'EXPERIENCE', y, accentColor);

          resumeData.experience.forEach(exp => {
            doc.fontSize(11).fillColor(primaryColor).font('Helvetica-Bold')
               .text(exp.company || '', 50, y);
            y += 15;

            doc.fontSize(10).fillColor(lightGray)
               .text(`${exp.role || ''} ${exp.duration || ''}`, 50, y);
            y += 15;

            if (exp.description?.length > 0) {
              exp.description.forEach(point => {
                doc.text('• ' + point, 60, y, { width: 480 });
                y += 15;
              });
            }

            y += 10;
          });
        }

        // ================= CERTIFICATIONS =================
        if (resumeData.certifications?.length > 0) {
          y = this.addSection(doc, 'CERTIFICATIONS', y, accentColor);

          resumeData.certifications.forEach(cert => {
            doc.text('• ' + cert, 60, y);
            y += 15;
          });
        }

        // ================= ACHIEVEMENTS =================
        if (resumeData.achievements?.length > 0) {
          y = this.addSection(doc, 'ACHIEVEMENTS', y, accentColor);

          resumeData.achievements.forEach(ach => {
            doc.text('• ' + ach, 60, y);
            y += 15;
          });
        }

        doc.end();

      } catch (error) {
        reject(error);
      }
    });
  }

  addSection(doc, title, y, color) {
    doc.fontSize(14).fillColor(color).font('Helvetica-Bold')
       .text(title, 50, y);
    y += 20;
    doc.moveTo(50, y).lineTo(150, y).strokeColor(color).stroke();
    y += 15;
    return y;
  }
}

module.exports = new PDFResumeGenerator();
