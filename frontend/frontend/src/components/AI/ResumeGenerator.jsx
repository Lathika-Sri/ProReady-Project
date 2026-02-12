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
    education: [{ institution: '', degree: '', year: '', cgpa: '' }],
    skills: { technical: '', soft: '' },
    projects: [{ name: '', description: '', technologies: '', link: '' }],
    experience: [{ company: '', role: '', duration: '', description: '' }],
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
      alert('Error deleting resume');
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

      // ✅ Correct PDF URL (NO replace)
      setPdfUrl(res.data.pdfUrl);

      fetchSavedResumes();

      alert('✅ Resume generated successfully!');
    } catch (error) {
      alert('Error generating resume');
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
      const response = await api.get(pdfPath, { responseType: 'blob' });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'resume.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert("Error downloading PDF");
    }
  };

  const viewResume = (resume) => {
    setGeneratedResume(resume.generatedResume);

    // ✅ Correct path with /api
    setPdfUrl(resume.pdfPath ? `/api/ai/resume/download-pdf/${resume.pdfPath}` : '');

    setShowHistory(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FileText size={32} className="text-teal-500" />
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              AI Resume Generator
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Generate TXT + ATS-friendly PDF
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={generateResume}
        disabled={loading}
        className="w-full bg-gradient-to-r from-teal-500 to-purple-500 text-white font-bold py-4 px-6 rounded-lg"
      >
        {loading ? 'Generating...' : 'Generate AI Resume'}
      </button>

      {generatedResume && (
        <div className="mt-6 bg-white dark:bg-gray-800 p-6 rounded-lg">
          <div className="flex gap-3 mb-4">
            <button
              onClick={() => downloadTXT()}
              className="px-4 py-2 bg-teal-500 text-white rounded-lg"
            >
              Download TXT
            </button>

            {pdfUrl && (
              <button
                onClick={() => downloadPDF(pdfUrl)}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg"
              >
                Download PDF
              </button>
            )}
          </div>

          <pre className="whitespace-pre-wrap text-sm">
            {generatedResume}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ResumeGenerator;
