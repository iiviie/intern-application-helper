# Quick Start Guide

## 🚀 Get Running in 3 Steps

### Step 1: Get Your Gemini API Key

1. Go to https://ai.google.dev/
2. Click "Get API key in Google AI Studio"
3. Create a new API key
4. Copy it!

### Step 2: Create Your `.env` File

```bash
cd backend
cp .env.example .env
```

Then edit `backend/.env` and add your API key:

```env
GEMINI_API_KEY=your_actual_api_key_here
```

**That's the only required setting!** Everything else has defaults.

### Step 3: Start the Application

From the project root directory:

```bash
docker compose up
```

Wait for the containers to start, then:

- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Frontend**: http://localhost:3000

## 🎯 First API Call

Once running, try this:

1. Go to http://localhost:8000/docs
2. Click on `POST /api/profile`
3. Click "Try it out"
4. Use this sample data:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "bio": "Passionate software engineer",
  "skills": ["Python", "FastAPI", "React"],
  "projects": [
    {
      "name": "My Awesome Project",
      "description": "A cool project I built",
      "tech_stack": ["Python", "FastAPI"],
      "link": "https://github.com/johndoe/project"
    }
  ]
}
```

5. Click "Execute"

## 🐛 Troubleshooting

### "No module named 'email_validator'"
The container needs to rebuild. Stop it (`Ctrl+C`) and run:
```bash
docker compose up --build
```

### "GEMINI_API_KEY variable is not set"
Make sure you created `backend/.env` with your API key:
```bash
cat backend/.env
# Should show: GEMINI_API_KEY=your_key_here
```

### Port already in use
Change the ports in `docker-compose.yml`:
```yaml
ports:
  - "8001:8000"  # Change 8000 to 8001 (or any available port)
```

## 📚 Next Steps

- Read the [main README](./README.md) for detailed documentation
- Check the [backend README](./backend/README.md) for API details
- Explore the API at http://localhost:8000/docs
