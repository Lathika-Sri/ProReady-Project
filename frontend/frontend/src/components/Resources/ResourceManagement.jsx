import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ExternalLink } from 'lucide-react';
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

  const addResource = async () => {
    if (!newResource.name) {
      alert('Please enter a resource name');
      return;
    }

    try {
      await api.post('/resources', newResource);
      setNewResource({ name: '', category: 'DSA', url: '', icon: '📚' });
      setShowAddForm(false);
      fetchResources();
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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Learning Resources</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition"
        >
          <Plus size={20} />
          Add Resource
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Add New Resource</h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Resource Name"
              value={newResource.name}
              onChange={(e) => setNewResource({ ...newResource, name: e.target.value })}
              className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            />
            <select
              value={newResource.category}
              onChange={(e) => setNewResource({ ...newResource, category: e.target.value })}
              className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
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
              className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            />
            <input
              type="text"
              placeholder="Icon (emoji)"
              value={newResource.icon}
              onChange={(e) => setNewResource({ ...newResource, icon: e.target.value })}
              className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            />
            <div className="flex gap-3">
              <button
                onClick={addResource}
                className="flex-1 bg-teal-500 text-white py-2 px-4 rounded-lg hover:bg-teal-600 transition"
              >
                Add Resource
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {resources.map((resource) => (
          <div key={resource._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{resource.icon}</span>
              <div>
                <h3 className="font-semibold">{resource.name}</h3>
                <p className="text-sm text-gray-500">{resource.category}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {resource.url && (
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900 rounded"
                >
                  <ExternalLink size={20} />
                </a>
              )}
              {resource.isCustom && (
                <button
                  onClick={() => deleteResource(resource._id)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900 rounded"
                >
                  <Trash2 size={20} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResourceManagement;