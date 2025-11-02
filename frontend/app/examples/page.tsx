'use client';

import { useState, useEffect } from 'react';
import { exampleAPI } from '@/lib/api';

export default function ExamplesPage() {
  const [examples, setExamples] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [filterType, setFilterType] = useState('');

  const [formData, setFormData] = useState({
    generation_type: 'cold_email',
    title: '',
    content: '',
    quality_rating: 5,
    notes: '',
  });

  useEffect(() => {
    loadExamples();
  }, [filterType]);

  const loadExamples = async () => {
    try {
      const data = await exampleAPI.list(filterType || undefined);
      setExamples(data);
    } catch (error) {
      console.error('Error loading examples:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await exampleAPI.create(formData);
      setMessage('Example added successfully!');
      setShowForm(false);
      setFormData({
        generation_type: 'cold_email',
        title: '',
        content: '',
        quality_rating: 5,
        notes: '',
      });
      await loadExamples();
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this example?')) return;

    try {
      await exampleAPI.delete(id);
      await loadExamples();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const getRatingStars = (rating: number) => {
    return '⭐'.repeat(Math.round(rating));
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Example Templates</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : '+ Add Example'}
        </button>
      </div>

      <div className="mb-6 p-4 bg-blue-50 rounded-lg text-blue-900">
        <p className="text-sm">
          <strong>💡 Tip:</strong> Add high-quality examples here to improve AI-generated content.
          The system will learn from these examples when "Use Example Templates" is enabled.
        </p>
      </div>

      {message && (
        <div className={`mb-4 p-4 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      {/* Filter */}
      <div className="mb-6">
        <label className="text-sm font-medium text-gray-700 mr-2">Filter by type:</label>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Types</option>
          <option value="cold_email">Cold Email</option>
          <option value="cold_dm">Cold DM</option>
          <option value="application">Application</option>
        </select>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 mb-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type *
              </label>
              <select
                required
                value={formData.generation_type}
                onChange={(e) => setFormData({ ...formData, generation_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="cold_email">Cold Email</option>
                <option value="cold_dm">Cold DM</option>
                <option value="application">Application</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quality Rating (1-5) *
              </label>
              <input
                type="number"
                min="1"
                max="5"
                step="0.5"
                required
                value={formData.quality_rating}
                onChange={(e) => setFormData({ ...formData, quality_rating: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title / Description
            </label>
            <input
              type="text"
              placeholder="e.g., 'Successful cold email to tech startup'"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Example Content *
            </label>
            <textarea
              required
              rows={10}
              placeholder="Paste your example email, DM, or application here..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Why is this example good?)
            </label>
            <textarea
              rows={2}
              placeholder="e.g., 'Great opening line, specific project mention, natural tone'"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Adding...' : 'Add Example'}
          </button>
        </form>
      )}

      {/* Examples List */}
      <div className="grid gap-4">
        {examples.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No examples added yet. Add your first example to improve AI generation!</p>
          </div>
        ) : (
          examples.map((example) => (
            <div key={example.id} className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">
                      {example.generation_type.replace('_', ' ')}
                    </span>
                    <span className="text-lg">{getRatingStars(example.quality_rating)}</span>
                  </div>
                  {example.title && (
                    <h3 className="text-lg font-semibold mt-2">{example.title}</h3>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(example.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-3">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                  {example.content}
                </pre>
              </div>

              {example.notes && (
                <div className="text-sm text-gray-600 bg-green-50 p-3 rounded border-l-4 border-green-400">
                  <strong>Why it works:</strong> {example.notes}
                </div>
              )}

              <div className="mt-3 text-xs text-gray-500">
                ID: {example.id} • Added: {new Date(example.created_at).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
