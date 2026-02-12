const PDFDocument = require('pdfkit');

class PDFResumeGenerator {

  generateATSResume(resumeData, outputPath) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 60, bottom: 50, left: 60, right: 60 }
        });

        const fs = require('fs');
        const stream = fs.createWriteStream(outputPath);
        doc.pipe(stream);

        const primary = '#111827';
        const blue = '#2563eb';
        const gray = '#6b7280';

        let y = 60;

        // ================= NAME =================
        doc
          .fontSize(26)
          .fillColor(primary)
          .font('Helvetica-Bold')
          .text(resumeData.personalInfo.name || '', {
            align: 'center'
          });

        y = doc.y + 8;

        // ================= CONTACT =================
        const contact = [
          resumeData.personalInfo.phone,
          resumeData.personalInfo.email,
          resumeData.personalInfo.linkedin,
          resumeData.personalInfo.github
        ].filter(Boolean).join(' | ');

        doc
          .fontSize(10)
          .fillColor(gray)
          .font('Helvetica')
          .text(contact, {
            align: 'center'
          });

        y = doc.y + 20;

        doc.moveTo(60, y).lineTo(535, y).stroke();
        y += 25;

        // SECTION FUNCTION
        const sectionTitle = (title) => {
          doc
            .fontSize(14)
            .fillColor(blue)
            .font('Helvetica-Bold')
            .text(title, 60, y);

          y = doc.y + 5;

          doc
            .strokeColor(blue)
            .moveTo(60, y)
            .lineTo(150, y)
            .stroke();

          y += 15;
        };

        // ================= EDUCATION =================
        if (resumeData.education?.length > 0) {
          sectionTitle('EDUCATION');

          resumeData.education.forEach(edu => {
            doc
              .fontSize(11)
              .fillColor(primary)
              .font('Helvetica-Bold')
              .text(edu.institution || '', 60, y);

            doc
              .fontSize(10)
              .fillColor(gray)
              .font('Helvetica')
              .text(edu.year || '', 400, y, { align: 'right' });

            y = doc.y + 5;

            doc
              .fontSize(10)
              .fillColor(gray)
              .text(`${edu.degree || ''} ${edu.cgpa ? '| CGPA: ' + edu.cgpa : ''}`, 60, y);

            y = doc.y + 20;
          });
        }

        // ================= SKILLS =================
        if (resumeData.skills?.technical?.length > 0 || resumeData.skills?.soft?.length > 0) {
          sectionTitle('SKILLS');

          if (resumeData.skills.technical?.length > 0) {
            doc
              .fontSize(10)
              .fillColor(primary)
              .font('Helvetica-Bold')
              .text('Technical: ', 60, y, { continued: true })
              .font('Helvetica')
              .fillColor(gray)
              .text(resumeData.skills.technical.join(', '));
            y = doc.y + 10;
          }

          if (resumeData.skills.soft?.length > 0) {
            doc
              .fontSize(10)
              .fillColor(primary)
              .font('Helvetica-Bold')
              .text('Soft Skills: ', 60, y, { continued: true })
              .font('Helvetica')
              .fillColor(gray)
              .text(resumeData.skills.soft.join(', '));
            y = doc.y + 20;
          }
        }

        // ================= PROJECTS =================
        if (resumeData.projects?.length > 0) {
          sectionTitle('PROJECTS');

          resumeData.projects.forEach(project => {
            doc
              .fontSize(11)
              .fillColor(primary)
              .font('Helvetica-Bold')
              .text(project.name || '', 60, y);

            y = doc.y + 5;

            if (project.technologies?.length > 0) {
              doc
                .fontSize(9)
                .fillColor(blue)
                .font('Helvetica-Oblique')
                .text('Technologies: ' + project.technologies.join(', '), 60, y);
              y = doc.y + 5;
            }

            if (project.description) {
              doc
                .fontSize(10)
                .fillColor(gray)
                .font('Helvetica')
                .text(project.description, 60, y, { width: 470 });
              y = doc.y + 15;
            }
          });
        }

        // ================= EXPERIENCE =================
        if (resumeData.experience?.length > 0) {
          sectionTitle('EXPERIENCE');

          resumeData.experience.forEach(exp => {
            doc
              .fontSize(11)
              .fillColor(primary)
              .font('Helvetica-Bold')
              .text(exp.company || '', 60, y);

            doc
              .fontSize(10)
              .fillColor(gray)
              .text(exp.duration || '', 400, y, { align: 'right' });

            y = doc.y + 5;

            if (exp.role) {
              doc
                .fontSize(10)
                .fillColor(blue)
                .font('Helvetica-Oblique')
                .text(exp.role, 60, y);
              y = doc.y + 5;
            }

            if (exp.description?.length > 0) {
              exp.description.forEach(point => {
                doc
                  .fontSize(10)
                  .fillColor(gray)
                  .font('Helvetica')
                  .text('• ' + point, 70, y, { width: 460 });
                y = doc.y + 5;
              });
            }

            y += 10;
          });
        }

        // ================= CERTIFICATIONS =================
        if (resumeData.certifications?.length > 0) {
          sectionTitle('CERTIFICATIONS');

          resumeData.certifications.forEach(cert => {
            doc.text('• ' + cert, 70, y);
            y = doc.y + 5;
          });

          y += 10;
        }

        // ================= ACHIEVEMENTS =================
        if (resumeData.achievements?.length > 0) {
          sectionTitle('ACHIEVEMENTS');

          resumeData.achievements.forEach(ach => {
            doc.text('• ' + ach, 70, y);
            y = doc.y + 5;
          });
        }

        doc.end();

        stream.on('finish', () => resolve(outputPath));
        stream.on('error', reject);

      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = new PDFResumeGenerator();
