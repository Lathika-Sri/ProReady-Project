import React, { useState, useEffect } from 'react';
import { FileText, Download, Sparkles, History, Eye, Trash2 } from 'lucide-react';
import api from '../../utils/api';
import ResumeModal from './ResumeModal';

const ResumeGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [generatedResume, setGeneratedResume] = useState('');
  const [savedResumes, setSavedResumes] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedResumeText, setSelectedResumeText] = useState(null);

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
    const res = await api.get('/ai/resume');
    setSavedResumes(res.data.resumes || []);
  };

  const handleInputChange = (section, field, value, index = null) => {
    if (index !== null) {
      const newData = { ...formData };
      newData[section][index][field] = value;
      setFormData(newData);
    } else if (section) {
      setFormData({
        ...formData,
        [section]: { ...formData[section], [field]: value }
      });
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  const addEntry = (section) => {
    const map = {
      education: { institution: '', degree: '', year: '', cgpa: '' },
      projects: { name: '', description: '', technologies: '', link: '' },
      experience: { company: '', role: '', duration: '', description: '' }
    };
    setFormData({ ...formData, [section]: [...formData[section], map[section]] });
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
      const res = await api.post('/ai/resume/generate', formData);
      setGeneratedResume(res.data.resume.generatedResume);
      fetchSavedResumes();
      alert('Resume generated successfully 🎉');
    } catch {
      alert('Error generating resume');
    } finally {
      setLoading(false);
    }
  };

  const downloadResume = (text = generatedResume) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resume_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const viewResume = (resume) => {
    setSelectedResumeText(resume.generatedResume);
  };

  const deleteResume = async (id) => {
    if (!window.confirm('Delete this resume?')) return;
    await api.delete(`/ai/resume/${id}`);
    fetchSavedResumes();
  };

  return (
    <>
      <div className="max-w-6xl mx-auto p-6 min-h-screen">

        {/* HEADER */}
        <div className="flex justify-between mb-6">
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <FileText /> AI Resume Generator
          </h2>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="px-4 py-2 bg-purple-600 text-white rounded"
          >
            <History size={18} /> My Resumes ({savedResumes.length})
          </button>
        </div>

        {/* HISTORY */}
        {showHistory ? (
          <div className="space-y-4">
            {savedResumes.map((r) => (
              <div key={r._id} className="p-4 border rounded flex justify-between">
                <div>
                  <h4 className="font-semibold">{r.personalInfo?.name}</h4>
                  <p className="text-sm text-gray-500">
                    {new Date(r.createdAt).toDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => viewResume(r)}
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => deleteResume(r._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <button
              onClick={generateResume}
              disabled={loading}
              className="w-full bg-gradient-to-r from-teal-500 to-purple-500 text-white py-4 rounded-lg flex justify-center gap-2"
            >
              <Sparkles />
              {loading ? 'Generating...' : 'Generate ATS Resume'}
            </button>

            {generatedResume && (
              <div className="mt-6 p-4 border rounded">
                <button
                  onClick={() => downloadResume()}
                  className="mb-2 flex gap-2 bg-teal-600 text-white px-4 py-2 rounded"
                >
                  <Download size={16} /> Download TXT
                </button>
                <pre className="whitespace-pre-wrap">{generatedResume}</pre>
              </div>
            )}
          </>
        )}
      </div>

      {/* MODAL */}
      {selectedResumeText && (
        <ResumeModal
          resumeText={selectedResumeText}
          onClose={() => setSelectedResumeText(null)}
        />
      )}
    </>
  );
};

export default ResumeGenerator;
