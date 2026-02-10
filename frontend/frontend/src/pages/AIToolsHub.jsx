import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, BookOpen, Map } from 'lucide-react';

const AIToolsHub = () => {
  const tools = [
    {
      icon: <FileText size={48} className="text-teal-500" />,
      title: 'Resume Generator',
      description: 'Create ATS-friendly resumes with AI assistance',
      link: '/ai/resume',
      color: 'from-teal-500 to-teal-600'
    },
    {
      icon: <BookOpen size={48} className="text-purple-500" />,
      title: 'Notes Summarizer',
      description: 'Summarize your study notes into key points',
      link: '/ai/notes',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: <Map size={48} className="text-orange-500" />,
      title: 'Roadmap Generator',
      description: 'Get personalized preparation roadmaps',
      link: '/ai/roadmap',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">AI-Powered Tools</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Supercharge your preparation with artificial intelligence
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {tools.map((tool, index) => (
          <Link
            key={index}
            to={tool.link}
            className="group"
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 hover:shadow-2xl transition transform hover:-translate-y-2">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4">{tool.icon}</div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                  {tool.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {tool.description}
                </p>
                <button className={`w-full bg-gradient-to-r ${tool.color} text-white font-bold py-3 px-6 rounded-lg hover:opacity-90 transition`}>
                  Try Now
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-16 bg-gradient-to-r from-teal-500 to-purple-500 rounded-lg p-8 text-white text-center">
        <h2 className="text-2xl font-bold mb-3">All AI Tools are Free!</h2>
        <p className="text-lg">
          Use cutting-edge AI technology to enhance your placement preparation
        </p>
      </div>
    </div>
  );
};

export default AIToolsHub;