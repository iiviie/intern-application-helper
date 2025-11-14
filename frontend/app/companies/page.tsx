'use client';

import { useState, useEffect } from 'react';
import { companyAPI } from '@/lib/api';

interface CompanyFormData {
  name: string;
  job_role: string;
  all_info: string;
}

const initialFormData: CompanyFormData = {
  name: '',
  job_role: '',
  all_info: '',
};

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CompanyFormData>(initialFormData);

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

  const handleEdit = (company: any) => {
    setEditingId(company.id);

    // Consolidate all info back into one text field
    const allInfoParts = [];
    if (company.description) allInfoParts.push(company.description);
    if (company.founder_name) allInfoParts.push(`Founder: ${company.founder_name}`);
    if (company.industry) allInfoParts.push(`Industry: ${company.industry}`);
    if (company.size) allInfoParts.push(`Size: ${company.size}`);
    if (company.location) allInfoParts.push(`Location: ${company.location}`);
    if (company.website) allInfoParts.push(`Website: ${company.website}`);
    if (company.job_description) allInfoParts.push(`\nJob Description:\n${company.job_description}`);
    if (company.requirements?.length > 0) allInfoParts.push(`\nRequirements:\n${company.requirements.join('\n')}`);
    if (company.tech_stack?.length > 0) allInfoParts.push(`\nTech Stack: ${company.tech_stack.join(', ')}`);
    if (company.values?.length > 0) allInfoParts.push(`\nValues: ${company.values.join(', ')}`);
    if (company.culture_notes) allInfoParts.push(`\nCulture:\n${company.culture_notes}`);
    if (company.recent_news) allInfoParts.push(`\nRecent News:\n${company.recent_news}`);
    if (company.why_interested) allInfoParts.push(`\nWhy I'm Interested:\n${company.why_interested}`);
    if (company.contact_info?.contact_person) allInfoParts.push(`\nContact: ${company.contact_info.contact_person}`);
    if (company.contact_info?.email) allInfoParts.push(`Email: ${company.contact_info.email}`);
    if (company.contact_info?.linkedin) allInfoParts.push(`LinkedIn: ${company.contact_info.linkedin}`);

    setFormData({
      name: company.name || '',
      job_role: company.job_role || '',
      all_info: allInfoParts.join('\n'),
    });
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(initialFormData);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const payload = {
        name: formData.name,
        job_role: formData.job_role || undefined,
        description: formData.all_info, // Store everything in description for now
        // The AI will be able to extract relevant info from the description
      };

      if (editingId) {
        await companyAPI.update(editingId, payload);
        setMessage('Company updated successfully!');
      } else {
        await companyAPI.create(payload);
        setMessage('Company added successfully!');
      }

      handleCancelEdit();
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
      setMessage('Company deleted successfully!');
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Companies</h1>
        <button
          onClick={() => {
            if (showForm) {
              handleCancelEdit();
            } else {
              setShowForm(true);
            }
          }}
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
          <h2 className="text-xl font-semibold border-b pb-2">
            {editingId ? 'Edit Company' : 'Add New Company'}
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Stripe, Anthropic, etc."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Role
            </label>
            <input
              type="text"
              placeholder="e.g., Software Engineer Intern (optional but helpful)"
              value={formData.job_role}
              onChange={(e) => setFormData({ ...formData, job_role: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              All Information *
            </label>
            <p className="text-sm text-gray-500 mb-2">
              Paste everything here - job description, requirements, company info, tech stack, culture, contact details, etc.
            </p>
            <textarea
              required
              rows={16}
              placeholder="Example:
Founded by John Doe in 2020. Series A startup in SF.

Software Engineer Intern - Backend Team
Work with Python, FastAPI, PostgreSQL, Redis
Build scalable APIs for financial data processing

Requirements:
- Python experience
- Understanding of databases
- CS fundamentals

Company values innovation and work-life balance. Remote-friendly.
Recently raised $20M Series A.

Contact: jane@company.com (Hiring Manager)"
              value={formData.all_info}
              onChange={(e) => setFormData({ ...formData, all_info: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? (editingId ? 'Updating...' : 'Adding...') : (editingId ? 'Update Company' : 'Add Company')}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-6 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            )}
          </div>
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
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-xl font-semibold">{company.name}</h3>
                  {company.job_role && (
                    <p className="text-sm text-blue-600 font-medium mt-1">{company.job_role}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(company)}
                    className="text-blue-600 hover:text-blue-800 px-3 py-1 border border-blue-600 rounded hover:bg-blue-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(company.id)}
                    className="text-red-600 hover:text-red-800 px-3 py-1 border border-red-600 rounded hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="text-gray-700 whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded border border-gray-200">
                {company.description}
              </div>

              <div className="mt-3 text-xs text-gray-400">
                ID: {company.id}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
