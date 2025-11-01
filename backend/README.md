# Internship Application Generator - Backend

FastAPI backend service for generating personalized internship application content using LangChain and Google Gemini.

## Features

- 📝 **User Profile Management**: Store and manage personal information, skills, projects, experience, etc.
- 🏢 **Company Database**: Store company information for targeted applications
- 🤖 **AI-Powered Generation**: Generate personalized content using Google Gemini via LangChain
  - Cold Emails
  - Cold DMs (LinkedIn, Twitter, etc.)
  - Application Cover Letters

## Tech Stack

- **FastAPI**: Modern, fast web framework
- **SQLAlchemy**: SQL ORM with async support
- **LangChain**: LLM orchestration framework
- **Google Gemini**: AI model for content generation
- **Pydantic**: Data validation
- **SQLite**: Database (easily swappable with PostgreSQL)

## Project Structure

```
backend/
├── app/
│   ├── api/              # API route handlers
│   ├── models/           # Database models
│   ├── schemas/          # Pydantic schemas
│   ├── services/         # Business logic
│   ├── config.py         # Configuration
│   ├── database.py       # Database setup
│   └── main.py           # FastAPI app
├── requirements.txt      # Python dependencies
├── Dockerfile           # Docker configuration
└── .env.example         # Environment variables template
```

## Setup

### 1. Environment Variables

Copy `.env.example` to `.env` and fill in your API keys:

```bash
cp .env.example .env
```

Required variables:
```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.0-flash
```

Optional variables:
```env
LANGSMITH_API_KEY=your_langsmith_key  # For monitoring
LANGSMITH_PROJECT=internship-app
```

### 2. Using Docker (Recommended)

From the root directory:
```bash
docker-compose up backend
```

The API will be available at `http://localhost:8000`

### 3. Manual Setup

Install dependencies:
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Run the server:
```bash
uvicorn app.main:app --reload
```

## API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

### User Profile
- `POST /api/profile` - Create user profile
- `GET /api/profile` - Get user profile
- `GET /api/profile/{id}` - Get profile by ID
- `PUT /api/profile/{id}` - Update profile
- `DELETE /api/profile/{id}` - Delete profile

### Companies
- `POST /api/companies` - Add company
- `GET /api/companies` - List all companies
- `GET /api/companies/{id}` - Get company by ID
- `PUT /api/companies/{id}` - Update company
- `DELETE /api/companies/{id}` - Delete company

### Content Generation
- `POST /api/generate` - Generate content (specify type)
- `POST /api/generate/cold-email` - Generate cold email
- `POST /api/generate/cold-dm` - Generate cold DM
- `POST /api/generate/application` - Generate application
- `POST /api/generate/bulk` - Generate for multiple companies

## Example Usage

### 1. Create a User Profile

```bash
curl -X POST "http://localhost:8000/api/profile" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "bio": "Passionate software engineer",
    "skills": ["Python", "FastAPI", "React"],
    "experience": [
      {
        "company": "Tech Corp",
        "role": "Software Engineer Intern",
        "duration": "Summer 2023",
        "description": "Built scalable APIs"
      }
    ]
  }'
```

### 2. Add a Company

```bash
curl -X POST "http://localhost:8000/api/companies" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Awesome Startup",
    "founder_name": "Jane Smith",
    "description": "Building the future of AI",
    "industry": "Technology",
    "tech_stack": ["Python", "React", "AWS"]
  }'
```

### 3. Generate a Cold Email

```bash
curl -X POST "http://localhost:8000/api/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "user_profile_id": 1,
    "company_id": 1,
    "generation_type": "cold_email",
    "tone": "professional",
    "max_length": 500
  }'
```

## Database

The app uses SQLite by default. To switch to PostgreSQL:

1. Update `DATABASE_URL` in `.env`:
```env
DATABASE_URL=postgresql+asyncpg://user:password@localhost/dbname
```

2. Add `asyncpg` to requirements.txt:
```bash
pip install asyncpg
```

## Development

### Running Tests
```bash
pytest
```

### Code Formatting
```bash
black app/
isort app/
```

### Type Checking
```bash
mypy app/
```

## Troubleshooting

### Issue: "No module named 'app'"
- Make sure you're running from the `backend` directory
- Verify your PYTHONPATH is set correctly

### Issue: "API key not found"
- Check your `.env` file exists and has `GEMINI_API_KEY`
- Ensure the environment variable is loaded

### Issue: Database errors
- Delete `internship_app.db` and restart to reset the database
- Check file permissions

## License

MIT
