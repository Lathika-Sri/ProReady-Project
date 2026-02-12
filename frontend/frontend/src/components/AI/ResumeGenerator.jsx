import React, { useState, useEffect } from 'react';
import { FileText, Download, Sparkles, History, Eye, Trash2, FileDown } from 'lucide-react';
import api from '../../utils/api';

const ResumeGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [generatedResume, setGeneratedResume] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [savedResumes, setSavedResumes] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const [formData, setFormData] = useState({
    personalInfo: {
      name: '',
      email: '',
      phone: '',
      linkedin: '',
      github: '',
      portfolio: ''
    },
    education: [{
      institution: '',
      degree: '',
      year: '',
      cgpa: ''
    }],
    skills: {
      technical: '',
      soft: ''
    },
    projects: [{
      name: '',
      description: '',
      technologies: '',
      link: ''
    }],
    experience: [{
      company: '',
      role: '',
      duration: '',
      description: ''
    }],
    certifications: '',
    achievements: ''
  });

  useEffect(() => {
    fetchSavedResumes();
  }, []);

  const fetchSavedResumes = async () => {
    try {
      const res = await api.get('/ai/resume');
      setSavedResumes(res.data.resumes || []);
    } catch (error) {
      console.error('Error fetching resumes:', error);
    }
  };

  const deleteResume = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) return;

    try {
      await api.delete(`/ai/resume/${id}`);
      setSavedResumes(prev => prev.filter(r => r._id !== id));
      alert('Resume deleted successfully! ✓');
    } catch (error) {
      alert('Error deleting resume: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleInputChange = (section, field, value, index = null) => {
    if (index !== null) {
      const newData = { ...formData };
      newData[section][index][field] = value;
      setFormData(newData);
    } else if (section === 'personalInfo') {
      setFormData({
        ...formData,
        personalInfo: { ...formData.personalInfo, [field]: value }
      });
    } else if (section === 'skills') {
      setFormData({
        ...formData,
        skills: { ...formData.skills, [field]: value }
      });
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  const addEntry = (section) => {
    const templates = {
      education: { institution: '', degree: '', year: '', cgpa: '' },
      projects: { name: '', description: '', technologies: '', link: '' },
      experience: { company: '', role: '', duration: '', description: '' }
    };

    setFormData({
      ...formData,
      [section]: [...formData[section], templates[section]]
    });
  };

  const removeEntry = (section, index) => {
    setFormData({
      ...formData,
      [section]: formData[section].filter((_, i) => i !== index)
    });
  };

  const generateResume = async () => {
    setLoading(true);
    try {
      const resumeData = {
        personalInfo: formData.personalInfo,
        education: formData.education.filter(e => e.institution),
        skills: {
          technical: formData.skills.technical.split(',').map(s => s.trim()).filter(Boolean),
          soft: formData.skills.soft.split(',').map(s => s.trim()).filter(Boolean)
        },
        projects: formData.projects.filter(p => p.name).map(p => ({
          ...p,
          technologies: p.technologies.split(',').map(t => t.trim()).filter(Boolean)
        })),
        experience: formData.experience.filter(e => e.company).map(e => ({
          ...e,
          description: e.description.split('.').map(d => d.trim()).filter(Boolean)
        })),
        certifications: formData.certifications.split(',').map(c => c.trim()).filter(Boolean),
        achievements: formData.achievements.split(',').map(a => a.trim()).filter(Boolean)
      };

      const res = await api.post('/ai/resume/generate', resumeData);
      setGeneratedResume(res.data.resume.generatedResume);
      setPdfUrl(res.data.pdfUrl); // This already has the full path
      
      fetchSavedResumes();
      alert('✅ Resume generated successfully!\n\n📄 You now have TWO formats:\n1. TXT (AI-generated text)\n2. PDF (ATS-friendly format)');
    } catch (error) {
      console.error('Full error:', error);
      alert('Error generating resume: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const downloadTXT = (resumeText = generatedResume) => {
    const blob = new Blob([resumeText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resume_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPDF = async (pdfPath) => {
    try {
      console.log('Downloading PDF from:', pdfPath);
      
      const response = await api.get(pdfPath, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'resume.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF Download Error:", error);
      alert("Error downloading PDF. The file may not exist on the server. Try generating a new resume.");
    }
  };

  const viewResume = (resume) => {
    setGeneratedResume(resume.generatedResume);
    // Only set PDF URL if the resume has a pdfPath
    setPdfUrl(resume.pdfPath ? `/api/ai/resume/download-pdf/${resume.pdfPath}` : '');
    setShowHistory(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FileText size={32} className="text-teal-500" />
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">AI Resume Generator</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Generate TXT + ATS-friendly PDF</p>
          </div>
        </div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition shadow-lg"
        >
          <History size={20} />
          My Resumes ({savedResumes.length})
        </button>
      </div>

      {showHistory ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Saved Resumes</h3>
            <button
              onClick={() => setShowHistory(false)}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium"
            >
              ← Back to Generator
            </button>
          </div>

          {savedResumes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📄</div>
              <p className="text-gray-500 dark:text-gray-400 text-lg">No saved resumes yet.</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Generate your first one!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {savedResumes.map((resume) => (
                <div key={resume._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg text-gray-900 dark:text-white">
                        {resume.personalInfo?.name || 'Unnamed Resume'}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Created: {new Date(resume.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => viewResume(resume)}
                        className="flex items-center gap-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium transition"
                        title="View resume"
                      >
                        <Eye size={16} />
                        View
                      </button>
                      <button
                        onClick={() => downloadTXT(resume.generatedResume)}
                        className="flex items-center gap-1 px-3 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 text-sm font-medium transition"
                        title="Download TXT"
                      >
                        <Download size={16} />
                        TXT
                      </button>
                      {resume.pdfPath && (
                        <button
                          onClick={() => downloadPDF(`/api/ai/resume/download-pdf/${resume.pdfPath}`)}
                          className="flex items-center gap-1 px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm font-medium transition"
                          title="Download PDF"
                        >
                          <FileDown size={16} />
                          PDF
                        </button>
                      )}
                      <button
                        onClick={() => deleteResume(resume._id)}
                        className="flex items-center gap-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium transition"
                        title="Delete resume"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">

            {/* Personal Information */}
            <section className="mb-6">
              <h3 className="text-xl font-semibold mb-4 text-teal-500">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Full Name *"
                  value={formData.personalInfo.name}
                  onChange={(e) => handleInputChange('personalInfo','name',e.target.value)}
                  className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" />
                <input type="email" placeholder="Email *"
                  value={formData.personalInfo.email}
                  onChange={(e) => handleInputChange('personalInfo','email',e.target.value)}
                  className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" />
                <input type="tel" placeholder="Phone"
                  value={formData.personalInfo.phone}
                  onChange={(e) => handleInputChange('personalInfo','phone',e.target.value)}
                  className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" />
                <input type="text" placeholder="LinkedIn URL"
                  value={formData.personalInfo.linkedin}
                  onChange={(e) => handleInputChange('personalInfo','linkedin',e.target.value)}
                  className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" />
                <input type="text" placeholder="GitHub URL"
                  value={formData.personalInfo.github}
                  onChange={(e) => handleInputChange('personalInfo','github',e.target.value)}
                  className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" />
                <input type="text" placeholder="Portfolio URL"
                  value={formData.personalInfo.portfolio}
                  onChange={(e) => handleInputChange('personalInfo','portfolio',e.target.value)}
                  className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" />
              </div>
            </section>

            {/* Education */}
            <section className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-teal-500">Education</h3>
                <button onClick={() => addEntry('education')}
                  className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 text-sm font-medium transition">
                  + Add Education
                </button>
              </div>

              {formData.education.map((edu,index)=>(
                <div key={index} className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" placeholder="Institution *"
                      value={edu.institution}
                      onChange={(e)=>handleInputChange('education','institution',e.target.value,index)}
                      className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"/>
                    <input type="text" placeholder="Degree (e.g., B.Tech CSE)"
                      value={edu.degree}
                      onChange={(e)=>handleInputChange('education','degree',e.target.value,index)}
                      className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"/>
                    <input type="text" placeholder="Year (e.g., 2020-2024)"
                      value={edu.year}
                      onChange={(e)=>handleInputChange('education','year',e.target.value,index)}
                      className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"/>
                    <input type="text" placeholder="CGPA (e.g., 8.5/10)"
                      value={edu.cgpa}
                      onChange={(e)=>handleInputChange('education','cgpa',e.target.value,index)}
                      className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"/>
                  </div>
                  {index>0 && (
                    <button onClick={()=>removeEntry('education',index)}
                      className="mt-2 text-red-500 dark:text-red-400 text-sm hover:underline">
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </section>

            {/* Skills */}
            <section className="mb-6">
              <h3 className="text-xl font-semibold mb-4 text-teal-500">Skills</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Technical Skills (comma-separated) *
                  </label>
                  <textarea
                    placeholder="Python, JavaScript, React, Node.js, MongoDB, MySQL, Git"
                    value={formData.skills.technical}
                    onChange={(e)=>handleInputChange('skills','technical',e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    rows="2"/>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Soft Skills (comma-separated)
                  </label>
                  <textarea
                    placeholder="Team Leadership, Communication, Problem Solving, Time Management"
                    value={formData.skills.soft}
                    onChange={(e)=>handleInputChange('skills','soft',e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    rows="2"/>
                </div>
              </div>
            </section>

            {/* Projects */}
            <section className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-teal-500">Projects</h3>
                <button onClick={()=>addEntry('projects')}
                  className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 text-sm font-medium transition">
                  + Add Project
                </button>
              </div>

              {formData.projects.map((project,index)=>(
                <div key={index} className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                  <input type="text" placeholder="Project Name *"
                    value={project.name}
                    onChange={(e)=>handleInputChange('projects','name',e.target.value,index)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mb-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"/>
                  <textarea placeholder="Description (what the project does, your role, impact)"
                    value={project.description}
                    onChange={(e)=>handleInputChange('projects','description',e.target.value,index)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mb-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    rows="2"/>
                  <input type="text"
                    placeholder="Technologies (comma-separated): React, Node.js, MongoDB"
                    value={project.technologies}
                    onChange={(e)=>handleInputChange('projects','technologies',e.target.value,index)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mb-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"/>
                  <input type="text"
                    placeholder="Project Link (GitHub/Live Demo)"
                    value={project.link}
                    onChange={(e)=>handleInputChange('projects','link',e.target.value,index)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"/>
                  {index>0 && (
                    <button onClick={()=>removeEntry('projects',index)}
                      className="mt-2 text-red-500 dark:text-red-400 text-sm hover:underline">
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </section>

            {/* Experience */}
            <section className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-teal-500">Experience (Optional)</h3>
                <button onClick={()=>addEntry('experience')}
                  className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 text-sm font-medium transition">
                  + Add Experience
                </button>
              </div>

              {formData.experience.map((exp,index)=>(
                <div key={index} className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                    <input type="text" placeholder="Company Name"
                      value={exp.company}
                      onChange={(e)=>handleInputChange('experience','company',e.target.value,index)}
                      className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"/>
                    <input type="text" placeholder="Role/Position"
                      value={exp.role}
                      onChange={(e)=>handleInputChange('experience','role',e.target.value,index)}
                      className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"/>
                  </div>
                  <input type="text" placeholder="Duration (e.g., Jun 2023 - Aug 2023)"
                    value={exp.duration}
                    onChange={(e)=>handleInputChange('experience','duration',e.target.value,index)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mb-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"/>
                  <textarea placeholder="Description (responsibilities, achievements - use periods to separate points)"
                    value={exp.description}
                    onChange={(e)=>handleInputChange('experience','description',e.target.value,index)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    rows="3"/>
                  <button onClick={()=>removeEntry('experience',index)}
                    className="mt-2 text-red-500 dark:text-red-400 text-sm hover:underline">
                    Remove
                  </button>
                </div>
              ))}
            </section>

            {/* Additional Info */}
            <section className="mb-6">
              <h3 className="text-xl font-semibold mb-4 text-teal-500">Additional Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Certifications (comma-separated)
                  </label>
                  <textarea
                    placeholder="AWS Certified Developer, Google Analytics Certified, Coursera Machine Learning"
                    value={formData.certifications}
                    onChange={(e)=>handleInputChange(null,'certifications',e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    rows="2"/>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Achievements (comma-separated)
                  </label>
                  <textarea
                    placeholder="Winner of Hackathon 2023, Published Research Paper, Dean's List Scholar"
                    value={formData.achievements}
                    onChange={(e)=>handleInputChange(null,'achievements',e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    rows="2"/>
                </div>
              </div>
            </section>

            <button
              onClick={generateResume}
              disabled={loading}
              className="w-full bg-gradient-to-r from-teal-500 to-purple-500 text-white font-bold py-4 px-6 rounded-lg hover:from-teal-600 hover:to-purple-600 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Generating Resume with AI...
                </>
              ) : (
                <>
                  <Sparkles size={20}/>
                  Generate AI Resume (TXT + PDF)
                </>
              )}
            </button>

          </div>

          {generatedResume && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Your Generated Resume</h3>
                <div className="flex gap-3">
                  <button onClick={()=>downloadTXT()}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition shadow-lg">
                    <Download size={18}/>
                    Download TXT
                  </button>
                  {pdfUrl && (
                    <button onClick={()=>downloadPDF(pdfUrl)}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition shadow-lg">
                      <FileDown size={18}/>
                      Download PDF
                    </button>
                  )}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg whitespace-pre-wrap font-mono text-sm border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto text-gray-900 dark:text-gray-100">
                {generatedResume}
              </div>
              <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>💡 Pro Tip:</strong> You now have two formats:
                </p>
                <ul className="text-sm text-blue-700 dark:text-blue-300 mt-2 ml-4 list-disc">
                  <li><strong>TXT</strong> - AI-generated text you can copy/paste</li>
                  <li><strong>PDF</strong> - ATS-friendly professional format</li>
                </ul>
              </div>
            </div>
          )}

        </>
      )}
    </div>
  );
};

export default ResumeGenerator;