'use client';

import { useState, useEffect } from 'react';
import { companyAPI } from '@/lib/api';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    founder_name: '',
    description: '',
    industry: '',
    website: '',
    job_role: '',
    tech_stack: '',
  });

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const data = await companyAPI.list();
      setCompanies(data);
    } catch (error) {
      console.error('Error loading companies:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const payload = {
        ...formData,
        tech_stack: formData.tech_stack.split(',').map(s => s.trim()).filter(Boolean),
      };

      await companyAPI.create(payload);
      setMessage('Company added successfully!');
      setShowForm(false);
      setFormData({
        name: '',
        founder_name: '',
        description: '',
        industry: '',
        website: '',
        job_role: '',
        tech_stack: '',
      });
      await loadCompanies();
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this company?')) return;

    try {
      await companyAPI.delete(id);
      await loadCompanies();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Companies</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : '+ Add Company'}
        </button>
      </div>

      {message && (
        <div className={`mb-4 p-4 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 mb-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name *
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
                Founder Name
              </label>
              <input
                type="text"
                value={formData.founder_name}
                onChange={(e) => setFormData({ ...formData, founder_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Industry
              </label>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Role
              </label>
              <input
                type="text"
                placeholder="Software Engineer Intern"
                value={formData.job_role}
                onChange={(e) => setFormData({ ...formData, job_role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Website
            </label>
            <input
              type="url"
              placeholder="https://..."
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tech Stack (comma-separated)
            </label>
            <input
              type="text"
              placeholder="Python, React, AWS"
              value={formData.tech_stack}
              onChange={(e) => setFormData({ ...formData, tech_stack: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Adding...' : 'Add Company'}
          </button>
        </form>
      )}

      <div className="grid gap-4">
        {companies.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No companies added yet. Add your first company!</p>
          </div>
        ) : (
          companies.map((company) => (
            <div key={company.id} className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-xl font-semibold">{company.name}</h3>
                  {company.founder_name && (
                    <p className="text-sm text-gray-600">Founder: {company.founder_name}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(company.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>

              <p className="text-gray-700 mb-3">{company.description}</p>

              <div className="grid grid-cols-2 gap-2 text-sm">
                {company.industry && (
                  <p><span className="font-medium">Industry:</span> {company.industry}</p>
                )}
                {company.job_role && (
                  <p><span className="font-medium">Role:</span> {company.job_role}</p>
                )}
                {company.website && (
                  <p className="col-span-2">
                    <span className="font-medium">Website:</span>{' '}
                    <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {company.website}
                    </a>
                  </p>
                )}
                {company.tech_stack?.length > 0 && (
                  <p className="col-span-2">
                    <span className="font-medium">Tech Stack:</span> {company.tech_stack.join(', ')}
                  </p>
                )}
              </div>

              <div className="mt-3 text-xs text-gray-500">
                ID: {company.id}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
