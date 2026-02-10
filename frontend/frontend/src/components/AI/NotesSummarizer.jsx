import React, { useState, useEffect } from 'react';
import { FileText, Sparkles, History, Eye, Trash2 } from 'lucide-react';
import api from '../../utils/api';

const NotesSummarizer = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [savedNotes, setSavedNotes] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetchSavedNotes();
  }, []);

  const fetchSavedNotes = async () => {
    try {
      const res = await api.get('/ai/notes');
      setSavedNotes(res.data.notes || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const summarizeNotes = async () => {
    if (!title || !content) {
      alert('Please enter both title and content');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/ai/notes/summarize', { title, content });
      setSummary(res.data.notes);
      fetchSavedNotes();
      setTitle('');
      setContent('');
      alert('Notes summarized and saved!');
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const viewNote = (note) => {
    setSummary(note);
    setShowHistory(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">AI Notes Summarizer</h2>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
        >
          <History size={20} />
          My Notes ({savedNotes.length})
        </button>
      </div>

      {showHistory ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Saved Notes</h3>
          {savedNotes.map((note) => (
            <div key={note._id} className="border p-4 rounded mb-3">
              <h4 className="font-semibold">{note.title}</h4>
              <p className="text-sm text-gray-500">{new Date(note.createdAt).toLocaleDateString()}</p>
              <button onClick={() => viewNote(note)} className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm">
                View
              </button>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="w-full p-3 border rounded-lg mb-4 dark:bg-gray-700"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Your notes..."
              className="w-full p-3 border rounded-lg dark:bg-gray-700"
              rows="12"
            />
            <button
              onClick={summarizeNotes}
              disabled={loading}
              className="w-full mt-4 bg-gradient-to-r from-teal-500 to-purple-500 text-white font-bold py-4 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Sparkles size={20} />
              {loading ? 'Summarizing...' : 'Summarize with AI (FREE)'}
            </button>
          </div>

          {summary && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-2xl font-bold mb-4">{summary.title}</h3>
              <div className="mb-6">
                <h4 className="font-semibold mb-2">Summary:</h4>
                <p className="whitespace-pre-wrap">{summary.summary}</p>
              </div>
              {summary.keyPoints?.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Key Points:</h4>
                  <ul className="list-disc list-inside space-y-2">
                    {summary.keyPoints.map((point, i) => <li key={i}>{point}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NotesSummarizer;