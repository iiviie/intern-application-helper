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
  const [parseMode, setParseMode] = useState<'text' | 'pdf'>('text');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    skills: '',
    resume_url: '',
    experience: [] as any[],
    projects: [] as any[],
    education: [] as any[],
    links: {} as any,
    achievements: [] as string[],
    certifications: [] as any[],
    languages: [] as string[],
    interests: '',
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
          experience: data.experience || [],
          projects: data.projects || [],
          education: data.education || [],
          links: data.links || {},
          achievements: data.achievements || [],
          certifications: data.certifications || [],
          languages: data.languages || [],
          interests: data.interests || '',
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
        skills: typeof formData.skills === 'string'
          ? formData.skills.split(',').map(s => s.trim()).filter(Boolean)
          : formData.skills,
        languages: typeof formData.languages === 'string'
          ? formData.languages.split(',').map(s => s.trim()).filter(Boolean)
          : formData.languages,
        achievements: typeof formData.achievements === 'string'
          ? formData.achievements.split(',').map(s => s.trim()).filter(Boolean)
          : formData.achievements,
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

      // Log parsed data to console
      console.log("================== PARSED RESUME DATA ==================");
      console.log("Name:", parsed.name);
      console.log("Email:", parsed.email);
      console.log("Phone:", parsed.phone);
      console.log("Location:", parsed.location);
      console.log("Bio:", parsed.bio);
      console.log("Skills:", parsed.skills);
      console.log("Experience:", parsed.experience);
      console.log("Projects:", parsed.projects);
      console.log("Education:", parsed.education);
      console.log("Links:", parsed.links);
      console.log("========================================================");

      setFormData({
        name: parsed.name || '',
        email: parsed.email || '',
        phone: parsed.phone || '',
        location: parsed.location || '',
        bio: parsed.bio || '',
        skills: parsed.skills || [],
        resume_url: parsed.resume_url || '',
        experience: parsed.experience || [],
        projects: parsed.projects || [],
        education: parsed.education || [],
        links: parsed.links || {},
        achievements: parsed.achievements || [],
        certifications: parsed.certifications || [],
        languages: parsed.languages || [],
        interests: parsed.interests || '',
      });

      setMessage(`✅ ${result.message} - Check browser console for full parsed data!`);
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
            <div className="bg-white border border-blue-300 rounded-md p-3">
              <p className="text-sm text-gray-700 mb-2">
                <strong>✨ AI-Powered Resume Parser</strong>
              </p>
              <p className="text-xs text-gray-600">
                Paste your LaTeX resume code (or upload PDF) and our AI will automatically extract all your information - experience, projects, skills, education, and links.
              </p>
            </div>

            {/* Mode Selector */}
            <div className="flex gap-4">
              <button
                onClick={() => setParseMode('text')}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition ${
                  parseMode === 'text'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                📝 Paste LaTeX/Text
              </button>
              <button
                onClick={() => setParseMode('pdf')}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition ${
                  parseMode === 'pdf'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                📄 Upload PDF
              </button>
            </div>

            {/* Text/LaTeX Paste */}
            {parseMode === 'text' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paste Your Resume (LaTeX or Plain Text)
                </label>
                <div className="relative">
                  <textarea
                    rows={16}
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Paste your complete LaTeX resume code here...&#10;&#10;Example:&#10;\documentclass[letterpaper,11pt]{article}&#10;...&#10;\begin{document}&#10;{\Huge \scshape Your Name}&#10;..."
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-xs leading-relaxed bg-gray-50"
                    style={{ minHeight: '400px' }}
                  />
                  <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                    {resumeText.length} characters
                  </div>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  💡 Tip: Copy and paste your entire .tex file content. AI will handle all LaTeX commands automatically.
                </p>
              </div>
            )}

            {/* PDF Upload */}
            {parseMode === 'pdf' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose PDF File
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  />
                  {resumeFile && (
                    <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded">
                      <p className="text-sm text-green-700 font-medium">
                        ✅ Selected: {resumeFile.name}
                      </p>
                      <p className="text-xs text-green-600">
                        {(resumeFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  )}
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  📄 Upload your resume in PDF format. AI will extract text and parse all information.
                </p>
              </div>
            )}

            {/* Parse Button */}
            <button
              onClick={handleParseResume}
              disabled={parsingResume}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-md hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 font-semibold shadow-md transition transform hover:scale-[1.02] disabled:hover:scale-100"
            >
              {parsingResume ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Parsing Resume with AI...
                </span>
              ) : (
                '🤖 Parse & Auto-Fill Profile'
              )}
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
            Skills
          </label>
          <div className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 min-h-[40px] flex flex-wrap gap-1">
            {Array.isArray(formData.skills) ? (
              formData.skills.length > 0 ? (
                formData.skills.map((skill, idx) => (
                  <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-gray-400 text-sm">No skills added yet</span>
              )
            ) : (
              <span className="text-gray-600 text-sm">{formData.skills}</span>
            )}
          </div>
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

      {/* Display Parsed Data */}
      {(formData.experience.length > 0 || formData.projects.length > 0 || formData.education.length > 0) && (
        <div className="mt-6 space-y-6">
          <h2 className="text-2xl font-bold">Parsed Resume Data</h2>

          {/* Experience */}
          {formData.experience.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">💼 Experience ({formData.experience.length})</h3>
              <div className="space-y-4">
                {formData.experience.map((exp: any, idx: number) => (
                  <div key={idx} className="border-l-4 border-blue-500 pl-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-900">{exp.role}</h4>
                        <p className="text-sm text-gray-600">{exp.company}</p>
                      </div>
                      <span className="text-xs text-gray-500">{exp.duration}</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-700">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {formData.projects.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">🚀 Projects ({formData.projects.length})</h3>
              <div className="space-y-4">
                {formData.projects.map((proj: any, idx: number) => (
                  <div key={idx} className="border-l-4 border-green-500 pl-4">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold text-gray-900">{proj.name}</h4>
                      {proj.link && (
                        <a href={proj.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                          GitHub →
                        </a>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-gray-700">{proj.description}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {proj.tech_stack?.map((tech: string, techIdx: number) => (
                        <span key={techIdx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {formData.education.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">🎓 Education ({formData.education.length})</h3>
              <div className="space-y-4">
                {formData.education.map((edu: any, idx: number) => (
                  <div key={idx} className="border-l-4 border-purple-500 pl-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-900">{edu.degree}</h4>
                        <p className="text-sm text-gray-600">{edu.institution}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">{edu.year}</p>
                        {edu.gpa && <p className="text-xs font-semibold text-purple-600">GPA: {edu.gpa}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Links */}
          {formData.links && Object.keys(formData.links).length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">🔗 Links</h3>
              <div className="space-y-2">
                {formData.links.github && (
                  <a href={formData.links.github} target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
                    GitHub: {formData.links.github}
                  </a>
                )}
                {formData.links.linkedin && (
                  <a href={formData.links.linkedin} target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
                    LinkedIn: {formData.links.linkedin}
                  </a>
                )}
                {formData.links.portfolio && (
                  <a href={formData.links.portfolio} target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
                    Portfolio: {formData.links.portfolio}
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {profile && (
        <div className="mt-6 text-sm text-gray-600">
          Profile ID: {profile.id}
        </div>
      )}
    </div>
  );
}
