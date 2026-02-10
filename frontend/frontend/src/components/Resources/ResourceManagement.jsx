import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ExternalLink, Star, Sparkles } from 'lucide-react';
import api from '../../utils/api';

const ResourceManagement = () => {
  const [resources, setResources] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newResource, setNewResource] = useState({
    name: '',
    category: 'DSA',
    url: '',
    icon: '📚'
  });

  // Suggested/Popular resources
  const suggestedResources = [
    {
      name: 'LeetCode',
      category: 'DSA',
      url: 'https://leetcode.com',
      icon: '💻',
      description: 'Best platform for coding interview preparation',
      rating: 5,
      tags: ['DSA', 'Interview Prep', 'Contests']
    },
    {
      name: 'GeeksforGeeks',
      category: 'DSA',
      url: 'https://geeksforgeeks.org',
      icon: '📚',
      description: 'Comprehensive tutorials and practice problems',
      rating: 5,
      tags: ['DSA', 'Tutorials', 'Theory']
    },
    {
      name: 'TakeUForward',
      category: 'DSA',
      url: 'https://takeuforward.org',
      icon: '🎯',
      description: 'Striver\'s A2Z DSA sheet and video solutions',
      rating: 5,
      tags: ['DSA', 'Roadmap', 'Videos']
    },
    {
      name: 'Coding Ninjas',
      category: 'DSA',
      url: 'https://codingninjas.com',
      icon: '🥷',
      description: 'Structured courses and guided paths',
      rating: 4,
      tags: ['DSA', 'Courses', 'Practice']
    },
    {
      name: 'HackerRank',
      category: 'DSA',
      url: 'https://hackerrank.com',
      icon: '🏆',
      description: 'Skills certification and company challenges',
      rating: 4,
      tags: ['DSA', 'Certification', 'Companies']
    },
    {
      name: 'CodeChef',
      category: 'DSA',
      url: 'https://codechef.com',
      icon: '👨‍🍳',
      description: 'Competitive programming and contests',
      rating: 4,
      tags: ['Competitive', 'Contests', 'DSA']
    },
    {
      name: 'Codeforces',
      category: 'DSA',
      url: 'https://codeforces.com',
      icon: '⚔️',
      description: 'Top competitive programming platform',
      rating: 5,
      tags: ['Competitive', 'Contests', 'Rating']
    },
    {
      name: 'YouTube (Striver)',
      category: 'Development',
      url: 'https://youtube.com/@takeUforward',
      icon: '📺',
      description: 'Free DSA video tutorials by Striver',
      rating: 5,
      tags: ['Videos', 'Free', 'DSA']
    },
    {
      name: 'FreeCodeCamp',
      category: 'Web Dev',
      url: 'https://freecodecamp.org',
      icon: '🔥',
      description: 'Learn web development for free',
      rating: 5,
      tags: ['Web Dev', 'Free', 'Projects']
    },
    {
      name: 'Udemy',
      category: 'Development',
      url: 'https://udemy.com',
      icon: '🎓',
      description: 'Comprehensive paid courses on all topics',
      rating: 4,
      tags: ['Courses', 'Paid', 'All Topics']
    },
    {
      name: 'GitHub',
      category: 'Development',
      url: 'https://github.com',
      icon: '🐙',
      description: 'Open source projects and version control',
      rating: 5,
      tags: ['Projects', 'Open Source', 'Portfolio']
    },
    {
      name: 'System Design Primer',
      category: 'System Design',
      url: 'https://github.com/donnemartin/system-design-primer',
      icon: '🏗️',
      description: 'Learn system design concepts',
      rating: 5,
      tags: ['System Design', 'Free', 'GitHub']
    }
  ];

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const res = await api.get('/resources');
      setResources(res.data.resources);
    } catch (error) {
      console.error('Error fetching resources:', error);
    }
  };

  const addResourceFromSuggestion = async (suggested) => {
    try {
      await api.post('/resources', {
        name: suggested.name,
        category: suggested.category,
        url: suggested.url,
        icon: suggested.icon
      });
      fetchResources();
      alert(`${suggested.name} added to your resources! 🎉`);
    } catch (error) {
      if (error.response?.status === 400) {
        alert('This resource is already in your list!');
      } else {
        alert('Error adding resource');
      }
    }
  };

  const addCustomResource = async () => {
    if (!newResource.name) {
      alert('Please enter a resource name');
      return;
    }

    try {
      await api.post('/resources', newResource);
      setNewResource({ name: '', category: 'DSA', url: '', icon: '📚' });
      setShowAddForm(false);
      fetchResources();
      alert('Custom resource added successfully! ✅');
    } catch (error) {
      alert('Error adding resource');
    }
  };

  const deleteResource = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) {
      return;
    }

    try {
      await api.delete(`/resources/${id}`);
      fetchResources();
    } catch (error) {
      alert('Error deleting resource');
    }
  };

  const isResourceAdded = (suggestedName) => {
    return resources.some(r => r.name === suggestedName);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Learning Resources</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your study platforms</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition shadow-lg"
        >
          <Plus size={20} />
          Add Custom Resource
        </button>
      </div>

      {/* Add Custom Resource Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Add Custom Resource</h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Resource Name (e.g., My Study Notes)"
              value={newResource.name}
              onChange={(e) => setNewResource({ ...newResource, name: e.target.value })}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <select
              value={newResource.category}
              onChange={(e) => setNewResource({ ...newResource, category: e.target.value })}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="DSA">DSA</option>
              <option value="Development">Development</option>
              <option value="Web Dev">Web Dev</option>
              <option value="System Design">System Design</option>
              <option value="Other">Other</option>
            </select>
            <input
              type="text"
              placeholder="URL (optional)"
              value={newResource.url}
              onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <input
              type="text"
              placeholder="Icon (emoji, e.g., 📖)"
              value={newResource.icon}
              onChange={(e) => setNewResource({ ...newResource, icon: e.target.value })}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <div className="flex gap-3">
              <button
                onClick={addCustomResource}
                className="flex-1 bg-teal-500 text-white py-2 px-4 rounded-lg hover:bg-teal-600 transition font-medium"
              >
                Add Resource
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suggested Resources */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={24} className="text-yellow-500" />
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Suggested Resources</h3>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Popular platforms recommended for placement preparation
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suggestedResources.map((suggested, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-5 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{suggested.icon}</span>
                  <div>
                    <h4 className="font-semibold text-lg text-gray-900 dark:text-white">
                      {suggested.name}
                    </h4>
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(suggested.rating)].map((_, i) => (
                        <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {suggested.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {suggested.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                {suggested.url && (
                  <a
                    href={suggested.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-medium"
                  >
                    <ExternalLink size={16} />
                    Visit
                  </a>
                )}
                
                {!isResourceAdded(suggested.name) ? (
                  <button
                    onClick={() => addResourceFromSuggestion(suggested)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition text-sm font-medium"
                  >
                    <Plus size={16} />
                    Add
                  </button>
                ) : (
                  <button
                    disabled
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 rounded-lg cursor-not-allowed text-sm font-medium"
                  >
                    ✓ Added
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* My Resources */}
      <div>
        <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          My Resources ({resources.length})
        </h3>
        
        {resources.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center border border-gray-200 dark:border-gray-700">
            <div className="text-6xl mb-4">📚</div>
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No resources yet
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Add resources from suggestions above or create custom ones
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map((resource) => (
              <div
                key={resource._id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-3xl">{resource.icon}</span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {resource.name}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {resource.category}
                      </p>
                      {!resource.isCustom && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">
                          Default
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {resource.url && (
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition"
                        title="Visit website"
                      >
                        <ExternalLink size={20} />
                      </a>
                    )}
                    {resource.isCustom && (
                      <button
                        onClick={() => deleteResource(resource._id)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition"
                        title="Delete resource"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pro Tips */}
      <div className="mt-8 bg-gradient-to-r from-teal-500 to-purple-500 rounded-lg p-6 text-white shadow-lg">
        <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
          💡 Pro Tips for Resource Management
        </h4>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <span>•</span>
            <span>Start with 2-3 platforms to avoid overwhelm</span>
          </li>
          <li className="flex items-start gap-2">
            <span>•</span>
            <span>LeetCode + GeeksforGeeks is a solid combo for DSA</span>
          </li>
          <li className="flex items-start gap-2">
            <span>•</span>
            <span>Use TakeUForward's A2Z sheet for structured preparation</span>
          </li>
          <li className="flex items-start gap-2">
            <span>•</span>
            <span>Track time on each resource to identify what works best</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ResourceManagement;