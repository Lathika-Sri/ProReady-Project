// backend/services/pdfGenerator.js
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class PDFResumeGenerator {
  
  generateATSResume(resumeData, outputPath) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 50, bottom: 50, left: 50, right: 50 }
        });

        const stream = fs.createWriteStream(outputPath);
        doc.pipe(stream);

        const primaryColor = '#1a1a1a';
        const accentColor = '#2563eb';
        const lightGray = '#6b7280';
        let yPosition = 50;

        // HEADER - Name
        doc.fontSize(28)
           .fillColor(primaryColor)
           .font('Helvetica-Bold')
           .text(resumeData.personalInfo.name || 'Your Name', 50, yPosition);
        yPosition += 35;

        // Contact Info
        doc.fontSize(10).fillColor(lightGray).font('Helvetica');
        const contactInfo = [
          resumeData.personalInfo.email,
          resumeData.personalInfo.phone,
          resumeData.personalInfo.linkedin && 'LinkedIn: ' + resumeData.personalInfo.linkedin,
          resumeData.personalInfo.github && 'GitHub: ' + resumeData.personalInfo.github
        ].filter(Boolean);
        
        doc.text(contactInfo.join(' | '), 50, yPosition, { width: 500 });
        yPosition += 25;

        // Line
        doc.strokeColor('#e5e7eb').lineWidth(1)
           .moveTo(50, yPosition).lineTo(545, yPosition).stroke();
        yPosition += 20;

        // EDUCATION
        if (resumeData.education?.length > 0) {
          yPosition = this.addSection(doc, 'EDUCATION', yPosition, accentColor);
          
          resumeData.education.forEach((edu) => {
            if (edu.institution) {
              doc.fontSize(11).fillColor(primaryColor).font('Helvetica-Bold')
                 .text(edu.institution, 50, yPosition);
              doc.fontSize(10).fillColor(lightGray).font('Helvetica')
                 .text(edu.year || '', 400, yPosition, { align: 'right' });
              yPosition += 15;

              const degreeText = `${edu.degree || ''}${edu.cgpa ? ' - CGPA: ' + edu.cgpa : ''}`;
              doc.fontSize(10).fillColor(lightGray)
                 .text(degreeText, 50, yPosition);
              yPosition += 20;
            }
          });
          yPosition += 5;
        }

        // SKILLS
        if (resumeData.skills?.technical?.length > 0 || resumeData.skills?.soft?.length > 0) {
          yPosition = this.addSection(doc, 'SKILLS', yPosition, accentColor);
          
          if (resumeData.skills.technical?.length > 0) {
            doc.fontSize(10).fillColor(primaryColor).font('Helvetica-Bold')
               .text('Technical: ', 50, yPosition, { continued: true })
               .font('Helvetica').fillColor(lightGray)
               .text(resumeData.skills.technical.join(', '), { width: 480 });
            yPosition += 20;
          }

          if (resumeData.skills.soft?.length > 0) {
            doc.fontSize(10).fillColor(primaryColor).font('Helvetica-Bold')
               .text('Soft Skills: ', 50, yPosition, { continued: true })
               .font('Helvetica').fillColor(lightGray)
               .text(resumeData.skills.soft.join(', '), { width: 480 });
            yPosition += 20;
          }
          yPosition += 5;
        }

        // PROJECTS
        if (resumeData.projects?.length > 0) {
          yPosition = this.addSection(doc, 'PROJECTS', yPosition, accentColor);
          
          resumeData.projects.forEach((project) => {
            if (project.name) {
              doc.fontSize(11).fillColor(primaryColor).font('Helvetica-Bold')
                 .text(project.name, 50, yPosition);
              yPosition += 15;

              if (project.technologies?.length > 0) {
                doc.fontSize(9).fillColor(accentColor).font('Helvetica-Oblique')
                   .text('Technologies: ' + project.technologies.join(', '), 50, yPosition);
                yPosition += 12;
              }

              if (project.description) {
                doc.fontSize(10).fillColor(lightGray).font('Helvetica')
                   .text(project.description, 50, yPosition, { width: 480 });
                yPosition += doc.heightOfString(project.description, { width: 480 }) + 5;
              }

              if (project.link) {
                doc.fontSize(9).fillColor(accentColor)
                   .text(project.link, 50, yPosition);
                yPosition += 15;
              }
              yPosition += 10;
            }
          });
        }

        // EXPERIENCE
        if (resumeData.experience?.length > 0) {
          const hasValid = resumeData.experience.some(exp => exp.company);
          
          if (hasValid) {
            yPosition = this.addSection(doc, 'EXPERIENCE', yPosition, accentColor);
            
            resumeData.experience.forEach((exp) => {
              if (exp.company) {
                doc.fontSize(11).fillColor(primaryColor).font('Helvetica-Bold')
                   .text(exp.company, 50, yPosition);
                doc.fontSize(10).fillColor(lightGray).font('Helvetica')
                   .text(exp.duration || '', 400, yPosition, { align: 'right' });
                yPosition += 15;

                if (exp.role) {
                  doc.fontSize(10).fillColor(accentColor).font('Helvetica-Oblique')
                     .text(exp.role, 50, yPosition);
                  yPosition += 15;
                }

                if (exp.description?.length > 0) {
                  exp.description.forEach((point) => {
                    if (point) {
                      doc.fontSize(10).fillColor(lightGray).font('Helvetica')
                         .text('• ' + point, 60, yPosition, { width: 470 });
                      yPosition += doc.heightOfString('• ' + point, { width: 470 }) + 5;
                    }
                  });
                }
                yPosition += 10;
              }
            });
          }
        }

        // CERTIFICATIONS
        if (resumeData.certifications?.length > 0) {
          yPosition = this.addSection(doc, 'CERTIFICATIONS', yPosition, accentColor);
          resumeData.certifications.forEach((cert) => {
            doc.fontSize(10).fillColor(lightGray).font('Helvetica')
               .text('• ' + cert, 60, yPosition, { width: 470 });
            yPosition += 15;
          });
          yPosition += 5;
        }

        // ACHIEVEMENTS
        if (resumeData.achievements?.length > 0) {
          yPosition = this.addSection(doc, 'ACHIEVEMENTS', yPosition, accentColor);
          resumeData.achievements.forEach((achievement) => {
            doc.fontSize(10).fillColor(lightGray).font('Helvetica')
               .text('• ' + achievement, 60, yPosition, { width: 470 });
            yPosition += 15;
          });
        }

        doc.end();

        stream.on('finish', () => resolve(outputPath));
        stream.on('error', (error) => reject(error));

      } catch (error) {
        reject(error);
      }
    });
  }

  addSection(doc, title, yPosition, accentColor) {
    doc.fontSize(14).fillColor(accentColor).font('Helvetica-Bold')
       .text(title, 50, yPosition);
    yPosition += 20;

    doc.strokeColor(accentColor).lineWidth(2)
       .moveTo(50, yPosition).lineTo(150, yPosition).stroke();
    yPosition += 15;

    return yPosition;
  }
}

module.exports = new PDFResumeGenerator();