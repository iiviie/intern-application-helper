'use client';

import { useState, useEffect } from 'react';
import { profileAPI, companyAPI, generateAPI } from '@/lib/api';

export default function GeneratePage() {
  const [profile, setProfile] = useState<any>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    company_id: '',
    generation_type: 'cold_email',
    tone: 'professional',
    max_length: 500,
    additional_context: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [profileData, companiesData] = await Promise.all([
        profileAPI.get(),
        companyAPI.list(),
      ]);
      setProfile(profileData);
      setCompanies(companiesData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profile) {
      setError('Please create your profile first!');
      return;
    }

    if (!formData.company_id) {
      setError('Please select a company!');
      return;
    }

    setLoading(true);
    setError('');
    setGenerated('');

    try {
      const result = await generateAPI.generate({
        user_profile_id: profile.id,
        company_id: parseInt(formData.company_id),
        generation_type: formData.generation_type,
        tone: formData.tone,
        max_length: formData.max_length,
        additional_context: formData.additional_context || undefined,
      });

      setGenerated(result.generated_content);
    } catch (error: any) {
      setError(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generated);
    alert('Copied to clipboard!');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Generate Content</h1>

      {!profile && (
        <div className="mb-6 p-4 bg-yellow-100 text-yellow-800 rounded-lg">
          ⚠️ Please create your profile first before generating content.
        </div>
      )}

      {companies.length === 0 && (
        <div className="mb-6 p-4 bg-yellow-100 text-yellow-800 rounded-lg">
          ⚠️ Please add at least one company before generating content.
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Generation Form */}
        <div>
          <form onSubmit={handleGenerate} className="bg-white shadow rounded-lg p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Company *
              </label>
              <select
                required
                value={formData.company_id}
                onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select a company --</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name} {company.job_role && `(${company.job_role})`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content Type *
              </label>
              <select
                value={formData.generation_type}
                onChange={(e) => setFormData({ ...formData, generation_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="cold_email">Cold Email</option>
                <option value="cold_dm">Cold DM</option>
                <option value="application">Application/Cover Letter</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tone
              </label>
              <select
                value={formData.tone}
                onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="professional">Professional</option>
                <option value="friendly">Friendly</option>
                <option value="enthusiastic">Enthusiastic</option>
                <option value="casual">Casual</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Length (words)
              </label>
              <input
                type="number"
                min="100"
                max="1000"
                value={formData.max_length}
                onChange={(e) => setFormData({ ...formData, max_length: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Context (optional)
              </label>
              <textarea
                rows={3}
                placeholder="Any specific points you want to highlight..."
                value={formData.additional_context}
                onChange={(e) => setFormData({ ...formData, additional_context: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !profile || companies.length === 0}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Generating...' : '✨ Generate Content'}
            </button>
          </form>
        </div>

        {/* Generated Content */}
        <div>
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Generated Content</h2>
              {generated && (
                <button
                  onClick={copyToClipboard}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  📋 Copy
                </button>
              )}
            </div>

            {error && (
              <div className="p-4 bg-red-100 text-red-700 rounded-lg mb-4">
                {error}
              </div>
            )}

            {loading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
                <p className="mt-4 text-gray-600">Generating your content...</p>
              </div>
            )}

            {generated && !loading && (
              <div className="prose max-w-none">
                <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap font-mono text-sm">
                  {generated}
                </div>
              </div>
            )}

            {!generated && !loading && !error && (
              <div className="text-center py-12 text-gray-500">
                <p>Fill out the form and click "Generate Content" to create your personalized message.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
