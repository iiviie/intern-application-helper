const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// User Profile API
export const profileAPI = {
  async create(data: any) {
    const res = await fetch(`${API_URL}/api/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async get() {
    const res = await fetch(`${API_URL}/api/profile`);
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(await res.text());
    }
    return res.json();
  },

  async update(id: number, data: any) {
    const res = await fetch(`${API_URL}/api/profile/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
};

// Company API
export const companyAPI = {
  async create(data: any) {
    const res = await fetch(`${API_URL}/api/companies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async list() {
    const res = await fetch(`${API_URL}/api/companies`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async get(id: number) {
    const res = await fetch(`${API_URL}/api/companies/${id}`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async delete(id: number) {
    const res = await fetch(`${API_URL}/api/companies/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(await res.text());
  },
};

// Generation API
export const generateAPI = {
  async generate(data: {
    user_profile_id: number;
    company_id: number;
    generation_type: string;
    tone?: string;
    max_length?: number;
    additional_context?: string;
  }) {
    const res = await fetch(`${API_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
};
