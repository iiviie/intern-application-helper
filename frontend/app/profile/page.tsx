'use client';

import { useState, useEffect } from 'react';
import { profileAPI } from '@/lib/api';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Resume parsing state
  const [showResumeParser, setShowResumeParser] = useState(false);
  const [parsingResume, setParsingResume] = useState(false);
  const [resumeText, setResumeText] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [parseMode, setParseMode] = useState<'text' | 'pdf'>('pdf');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    skills: '',
    resume_url: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await profileAPI.get();
      if (data) {
        setProfile(data);
        setFormData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          location: data.location || '',
          bio: data.bio || '',
          skills: data.skills?.join(', ') || '',
          resume_url: data.resume_url || '',
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const payload = {
        ...formData,
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
      };

      if (profile) {
        await profileAPI.update(profile.id, payload);
        setMessage('Profile updated successfully!');
      } else {
        await profileAPI.create(payload);
        setMessage('Profile created successfully!');
      }

      await loadProfile();
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleParseResume = async () => {
    setParsingResume(true);
    setMessage('');

    try {
      let result;

      if (parseMode === 'pdf') {
        if (!resumeFile) {
          setMessage('Please select a PDF file');
          return;
        }
        result = await profileAPI.parseResumePdf(resumeFile);
      } else {
        if (!resumeText.trim()) {
          setMessage('Please paste your resume text');
          return;
        }
        result = await profileAPI.parseResumeText(resumeText);
      }

      // Auto-fill form with parsed data
      const parsed = result.parsed_data;
      setFormData({
        name: parsed.name || '',
        email: parsed.email || '',
        phone: parsed.phone || '',
        location: parsed.location || '',
        bio: parsed.bio || '',
        skills: parsed.skills?.join(', ') || '',
        resume_url: parsed.resume_url || '',
      });

      setMessage(`✅ ${result.message} - Form auto-filled with extracted data!`);
      setShowResumeParser(false);
    } catch (error: any) {
      setMessage(`Error parsing resume: ${error.message}`);
    } finally {
      setParsingResume(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>

      {/* Resume Parser Section */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <button
          onClick={() => setShowResumeParser(!showResumeParser)}
          className="w-full flex items-center justify-between text-left font-semibold text-blue-900"
        >
          <span>📄 Auto-fill from Resume</span>
          <span>{showResumeParser ? '▼' : '▶'}</span>
        </button>

        {showResumeParser && (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-gray-700">
              Upload a PDF or paste your resume text to automatically extract and fill your profile information.
            </p>

            {/* Mode Selector */}
            <div className="flex gap-4">
              <button
                onClick={() => setParseMode('pdf')}
                className={`flex-1 py-2 px-4 rounded-md font-medium ${
                  parseMode === 'pdf'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300'
                }`}
              >
                Upload PDF
              </button>
              <button
                onClick={() => setParseMode('text')}
                className={`flex-1 py-2 px-4 rounded-md font-medium ${
                  parseMode === 'text'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300'
                }`}
              >
                Paste Text/LaTeX
              </button>
            </div>

            {/* PDF Upload */}
            {parseMode === 'pdf' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose PDF File
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {resumeFile && (
                  <p className="mt-2 text-sm text-gray-600">
                    Selected: {resumeFile.name}
                  </p>
                )}
              </div>
            )}

            {/* Text/LaTeX Paste */}
            {parseMode === 'text' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paste Resume Text (LaTeX or Plain Text)
                </label>
                <textarea
                  rows={8}
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your resume here..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>
            )}

            {/* Parse Button */}
            <button
              onClick={handleParseResume}
              disabled={parsingResume}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 font-semibold"
            >
              {parsingResume ? '🔄 Parsing Resume...' : '✨ Parse & Auto-Fill'}
            </button>
          </div>
        )}
      </div>

      {message && (
        <div className={`mb-4 p-4 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bio
          </label>
          <textarea
            rows={3}
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Skills (comma-separated)
          </label>
          <input
            type="text"
            placeholder="Python, JavaScript, React"
            value={formData.skills}
            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Resume URL
          </label>
          <input
            type="url"
            placeholder="https://..."
            value={formData.resume_url}
            onChange={(e) => setFormData({ ...formData, resume_url: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Saving...' : profile ? 'Update Profile' : 'Create Profile'}
        </button>
      </form>

      {profile && (
        <div className="mt-6 text-sm text-gray-600">
          Profile ID: {profile.id}
        </div>
      )}
    </div>
  );
}
