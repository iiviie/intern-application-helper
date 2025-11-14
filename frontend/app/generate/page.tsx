'use client';

import { useState, useEffect } from 'react';
import { profileAPI, companyAPI, generateAPI } from '@/lib/api';

const LENGTH_PRESETS = {
  short: { words: 200, label: 'Short (~1 min read)', description: '150-250 words' },
  medium: { words: 400, label: 'Medium (~2 min read)', description: '300-500 words' },
  long: { words: 700, label: 'Long (~3 min read)', description: '600-800 words' },
};

export default function GeneratePage() {
  const [profile, setProfile] = useState<any>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState('');
  const [chainOfThought, setChainOfThought] = useState('');
  const [showThinking, setShowThinking] = useState(false);
  const [error, setError] = useState('');
  const [refining, setRefining] = useState(false);
  const [sectionToReplace, setSectionToReplace] = useState('');
  const [refineFeedback, setRefineFeedback] = useState('');
  const [refinedSection, setRefinedSection] = useState('');

  const [formData, setFormData] = useState({
    company_id: '',
    generation_type: 'cold_email',
    tone: 'professional',
    max_length: 400,
    additional_context: '',
    use_chain_of_thought: true,
    use_examples: true,
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
    setChainOfThought('');
    setShowThinking(false);

    try {
      const result = await generateAPI.generate({
        user_profile_id: profile.id,
        company_id: parseInt(formData.company_id),
        generation_type: formData.generation_type,
        tone: formData.tone,
        max_length: formData.max_length,
        additional_context: formData.additional_context || undefined,
        use_chain_of_thought: formData.use_chain_of_thought,
        use_examples: formData.use_examples,
      });

      setGenerated(result.generated_content);
      if (result.chain_of_thought) {
        setChainOfThought(result.chain_of_thought);
      }
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

  const handleRefine = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!sectionToReplace.trim() || !refineFeedback.trim()) {
      setError('Please provide both the section to replace and your feedback.');
      return;
    }

    setRefining(true);
    setError('');
    setRefinedSection('');

    try {
      const result = await generateAPI.refine({
        user_profile_id: profile.id,
        company_id: parseInt(formData.company_id),
        generation_type: formData.generation_type,
        full_content: generated,
        section_to_replace: sectionToReplace,
        user_feedback: refineFeedback,
        tone: formData.tone,
      });

      setRefinedSection(result.refined_section);
    } catch (error: any) {
      setError(`Error refining: ${error.message}`);
    } finally {
      setRefining(false);
    }
  };

  const applyRefinedSection = () => {
    if (!refinedSection) return;
    const updated = generated.replace(sectionToReplace, refinedSection);
    setGenerated(updated);
    setSectionToReplace('');
    setRefineFeedback('');
    setRefinedSection('');
    alert('Section replaced in generated content!');
  };

  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).length;
  };

  return (
    <div className="max-w-7xl mx-auto">
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
          <form onSubmit={handleGenerate} className="bg-white shadow rounded-lg p-6 space-y-5">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Length: {formData.max_length} words
              </label>
              <input
                type="range"
                min="150"
                max="800"
                step="50"
                value={formData.max_length}
                onChange={(e) => setFormData({ ...formData, max_length: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Short (150)</span>
                <span>Medium (400)</span>
                <span>Long (800)</span>
              </div>
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

            <div className="space-y-2 border-t pt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.use_chain_of_thought}
                  onChange={(e) => setFormData({ ...formData, use_chain_of_thought: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm">
                  <strong>Use 2-Stage Generation</strong> (higher quality, slower)
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.use_examples}
                  onChange={(e) => setFormData({ ...formData, use_examples: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm">
                  <strong>Use Example Templates</strong> (learn from best examples)
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !profile || companies.length === 0}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 font-medium"
            >
              {loading ? 'Generating...' : '✨ Generate Content'}
            </button>
          </form>
        </div>

        {/* Generated Content */}
        <div className="space-y-4">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Generated Content</h2>
              <div className="flex gap-2">
                {chainOfThought && (
                  <button
                    onClick={() => setShowThinking(!showThinking)}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    {showThinking ? '👁️ Hide' : '🧠 Show'} Thinking
                  </button>
                )}
                {generated && (
                  <button
                    onClick={copyToClipboard}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    📋 Copy
                  </button>
                )}
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-100 text-red-700 rounded-lg mb-4">
                {error}
              </div>
            )}

            {loading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
                <p className="mt-4 text-gray-600">
                  {formData.use_chain_of_thought ? 'Planning and generating...' : 'Generating...'}
                </p>
                {formData.use_chain_of_thought && (
                  <p className="text-sm text-gray-500 mt-2">This may take 10-15 seconds</p>
                )}
              </div>
            )}

            {generated && !loading && (
              <>
                {showThinking && chainOfThought && (
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="text-sm font-semibold text-blue-900 mb-2">🧠 Strategic Plan:</h3>
                    <div className="text-sm text-blue-800 whitespace-pre-wrap">
                      {chainOfThought}
                    </div>
                  </div>
                )}

                <div className="prose max-w-none">
                  <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                    <div className="whitespace-pre-wrap text-gray-900 leading-relaxed">
                      {generated}
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    {getWordCount(generated)} words
                  </div>
                </div>
              </>
            )}

            {!generated && !loading && !error && (
              <div className="text-center py-12 text-gray-500">
                <p>Fill out the form and click "Generate Content" to create your personalized message.</p>
              </div>
            )}
          </div>

          {/* Refinement Section */}
          {generated && !loading && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">✨ Refine a Section</h2>
              <p className="text-sm text-gray-600 mb-4">
                Not happy with a specific part? Copy-paste it below and tell me what you want different.
              </p>

              <form onSubmit={handleRefine} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Section to Replace
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Paste the exact text you want to improve..."
                    value={sectionToReplace}
                    onChange={(e) => setSectionToReplace(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    What do you want different?
                  </label>
                  <textarea
                    rows={2}
                    placeholder="E.g., 'Make it more casual', 'Focus on my Python experience instead', 'Sound less formal'..."
                    value={refineFeedback}
                    onChange={(e) => setRefineFeedback(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={refining || !sectionToReplace.trim() || !refineFeedback.trim()}
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:bg-gray-400"
                >
                  {refining ? 'Refining...' : '✨ Refine Section'}
                </button>
              </form>

              {refinedSection && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-semibold text-green-900">✅ Refined Version:</h3>
                    <button
                      onClick={applyRefinedSection}
                      className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                      Replace in Content
                    </button>
                  </div>
                  <div className="text-sm text-gray-800 whitespace-pre-wrap bg-white p-3 rounded border border-green-300">
                    {refinedSection}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
