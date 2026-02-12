const PDFDocument = require('pdfkit');

class PDFResumeGenerator {
  generateATSResume(resumeData) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 50, bottom: 50, left: 50, right: 50 }
        });

        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);

        // Personal Info Header
        const pi = resumeData.personalInfo || {};
        if (pi.name) {
          doc.fontSize(22).font('Helvetica-Bold').text(pi.name, { align: 'center' });
          doc.moveDown(0.3);
        }
        
        // Contact Info
        const contactInfo = [
          pi.email,
          pi.phone,
          pi.linkedin,
          pi.github,
          pi.portfolio
        ].filter(Boolean).join(' | ');
        
        if (contactInfo) {
          doc.fontSize(10).font('Helvetica').text(contactInfo, { align: 'center' });
          doc.moveDown(1);
        }

        // Education
        if (resumeData.education && resumeData.education.length > 0) {
          this.addSectionHeader(doc, 'EDUCATION');
          resumeData.education.forEach(edu => {
            if (edu.institution) {
              doc.font('Helvetica-Bold').fontSize(11).text(edu.institution);
              const eduDetails = [edu.degree, edu.cgpa ? `CGPA: ${edu.cgpa}` : '', edu.year]
                .filter(Boolean).join(' | ');
              if (eduDetails) {
                doc.font('Helvetica').fontSize(10).text(eduDetails);
              }
              doc.moveDown(0.5);
            }
          });
        }

        // Skills
        if (resumeData.skills) {
          const hasTech = resumeData.skills.technical && resumeData.skills.technical.length > 0;
          const hasSoft = resumeData.skills.soft && resumeData.skills.soft.length > 0;
          
          if (hasTech || hasSoft) {
            this.addSectionHeader(doc, 'SKILLS');
            
            if (hasTech) {
              doc.font('Helvetica-Bold').fontSize(10).text('Technical: ', { continued: true });
              doc.font('Helvetica').text(resumeData.skills.technical.join(', '));
              doc.moveDown(0.3);
            }
            
            if (hasSoft) {
              doc.font('Helvetica-Bold').fontSize(10).text('Soft Skills: ', { continued: true });
              doc.font('Helvetica').text(resumeData.skills.soft.join(', '));
              doc.moveDown(0.5);
            }
          }
        }

        // Experience
        if (resumeData.experience && resumeData.experience.length > 0) {
          this.addSectionHeader(doc, 'EXPERIENCE');
          resumeData.experience.forEach(exp => {
            if (exp.company) {
              doc.font('Helvetica-Bold').fontSize(11).text(exp.company);
              const expDetails = [exp.role, exp.duration].filter(Boolean).join(' | ');
              if (expDetails) {
                doc.font('Helvetica-Oblique').fontSize(10).text(expDetails);
              }
              doc.moveDown(0.2);
              
              if (exp.description && exp.description.length > 0) {
                exp.description.forEach(point => {
                  if (point && point.trim()) {
                    doc.font('Helvetica').fontSize(10).text(`• ${point.trim()}`, { indent: 10 });
                  }
                });
              }
              doc.moveDown(0.5);
            }
          });
        }

        // Projects
        if (resumeData.projects && resumeData.projects.length > 0) {
          this.addSectionHeader(doc, 'PROJECTS');
          resumeData.projects.forEach(proj => {
            if (proj.name) {
              doc.font('Helvetica-Bold').fontSize(11).text(proj.name);
              
              if (proj.technologies && proj.technologies.length > 0) {
                doc.font('Helvetica-Oblique').fontSize(9)
                  .text(`Technologies: ${proj.technologies.join(', ')}`);
              }
              
              if (proj.description) {
                doc.font('Helvetica').fontSize(10).text(proj.description);
              }
              
              if (proj.link) {
                doc.fontSize(9).fillColor('blue').text(proj.link, { link: proj.link });
                doc.fillColor('black');
              }
              
              doc.moveDown(0.5);
            }
          });
        }

        // Certifications
        if (resumeData.certifications && resumeData.certifications.length > 0) {
          this.addSectionHeader(doc, 'CERTIFICATIONS');
          resumeData.certifications.forEach(cert => {
            if (cert && cert.trim()) {
              doc.font('Helvetica').fontSize(10).text(`• ${cert.trim()}`);
            }
          });
          doc.moveDown(0.5);
        }

        // Achievements
        if (resumeData.achievements && resumeData.achievements.length > 0) {
          this.addSectionHeader(doc, 'ACHIEVEMENTS');
          resumeData.achievements.forEach(ach => {
            if (ach && ach.trim()) {
              doc.font('Helvetica').fontSize(10).text(`• ${ach.trim()}`);
            }
          });
        }

        doc.end();
      } catch (error) {
        console.error('PDF Generation Error:', error);
        reject(error);
      }
    });
  }

  addSectionHeader(doc, title) {
    doc.font('Helvetica-Bold')
      .fontSize(12)
      .text(title, { underline: true })
      .moveDown(0.5);
  }
}

module.exports = new PDFResumeGenerator();