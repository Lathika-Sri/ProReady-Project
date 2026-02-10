import React, { useState } from 'react';
import { Map, Sparkles } from 'lucide-react';
import api from '../../utils/api';

const RoadmapGenerator = () => {
  const [targetRole, setTargetRole] = useState('');
  const [duration, setDuration] = useState(8);
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState(null);

  const roleOptions = [
    'Software Development Engineer',
    'Full Stack Developer',
    'Frontend Developer',
    'Backend Developer',
    'Data Scientist',
    'Machine Learning Engineer',
    'DevOps Engineer',
    'Mobile App Developer',
    'System Design Expert'
  ];

  const generateRoadmap = async () => {
    if (!targetRole) {
      alert('Please select a target role');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/ai/roadmap/generate', { targetRole, duration });
      setRoadmap(res.data.roadmap);
    } catch (error) {
      alert('Error generating roadmap: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <Map size={32} className="text-teal-500" />
        <h2 className="text-3xl font-bold">AI Roadmap Generator</h2>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Target Role</label>
          <select
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="">Select your target role...</option>
            {roleOptions.map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Preparation Duration: {duration} weeks
          </label>
          <input
            type="range"
            min="4"
            max="24"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>4 weeks</span>
            <span>24 weeks</span>
          </div>
        </div>

        <button
          onClick={generateRoadmap}
          disabled={loading}
          className="w-full bg-gradient-to-r from-teal-500 to-purple-500 text-white font-bold py-4 px-6 rounded-lg hover:from-teal-600 hover:to-purple-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? 'Generating Roadmap...' : (
            <>
              <Sparkles size={20} />
              Generate Roadmap
            </>
          )}
        </button>
      </div>

      {roadmap && (
        <div className="space-y-4">
          {roadmap.weeklyPlan?.map((week) => (
            <div key={week.week} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-teal-500 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold">
                  W{week.week}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{week.title || `Week ${week.week}`}</h3>
                  {week.estimatedHours && (
                    <p className="text-sm text-gray-500">{week.estimatedHours} hours</p>
                  )}
                </div>
              </div>

              {week.focus && week.focus.length > 0 && (
                <div className="mb-3">
                  <h4 className="font-semibold mb-2">Focus Areas:</h4>
                  <div className="flex flex-wrap gap-2">
                    {week.focus.map((item, i) => (
                      <span key={i} className="bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 px-3 py-1 rounded-full text-sm">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {week.topics && week.topics.length > 0 && (
                <div className="mb-3">
                  <h4 className="font-semibold mb-2">Topics to Cover:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {week.topics.map((topic, i) => (
                      <li key={i} className="text-sm">{topic}</li>
                    ))}
                  </ul>
                </div>
              )}

              {week.resources && week.resources.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Recommended Resources:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {week.resources.map((resource, i) => (
                      <li key={i} className="text-sm text-blue-600 dark:text-blue-400">{resource}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoadmapGenerator;