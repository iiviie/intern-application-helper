# Internship Application Generator

A full-stack application that generates personalized content for internship applications using AI. Enter your personal details and company information, and get tailored cold emails, DMs, and application responses powered by Google Gemini.

## Features

✨ **Personalized Content Generation**
- 📧 Cold Emails
- 💬 Cold DMs (LinkedIn, Twitter, etc.)
- 📄 Application Cover Letters

🎯 **Smart Matching**
- Store your profile with skills, projects, and experience
- Save company details and job requirements
- AI analyzes both to create highly relevant content

🚀 **Modern Tech Stack**
- **Backend**: FastAPI + LangChain + Google Gemini
- **Frontend**: Next.js + React
- **Database**: SQLite (easily switchable to PostgreSQL)
- **Deployment**: Docker + Docker Compose

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Google Gemini API key ([Get one here](https://ai.google.dev/))

### 1. Clone and Setup

```bash
git clone <your-repo-url>
cd intern-application
```

### 2. Configure Environment

Create a `.env` file in the `backend` directory:

```bash
cd backend
cp .env.example .env
```

Edit `.env` and add your Gemini API key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Start the Application

From the root directory:

```bash
docker-compose up
```

This will start:
- **Backend**: http://localhost:8000
- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:8000/docs

## Project Structure

```
intern-application/
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── api/         # API endpoints
│   │   ├── models/      # Database models
│   │   ├── schemas/     # Pydantic schemas
│   │   ├── services/    # AI service & business logic
│   │   └── main.py      # FastAPI app
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/            # Next.js frontend
│   ├── app/
│   ├── Dockerfile
│   └── package.json
└── docker-compose.yml   # Orchestration
```

## Usage Flow

1. **Create Your Profile**
   - Add your name, skills, projects, experience
   - Include links to GitHub, LinkedIn, portfolio
   - Upload your resume URL

2. **Add Companies**
   - Company name, founder, description
   - Tech stack, culture, job requirements
   - Why you're interested

3. **Generate Content**
   - Select profile and company
   - Choose content type (email, DM, application)
   - Customize tone and length
   - Get AI-generated personalized content

## API Endpoints

### User Profile
- `POST /api/profile` - Create profile
- `GET /api/profile` - Get profile
- `PUT /api/profile/{id}` - Update profile

### Companies
- `POST /api/companies` - Add company
- `GET /api/companies` - List companies
- `GET /api/companies/{id}` - Get company details

### Content Generation
- `POST /api/generate` - Generate any type
- `POST /api/generate/cold-email` - Generate cold email
- `POST /api/generate/cold-dm` - Generate DM
- `POST /api/generate/application` - Generate application
- `POST /api/generate/bulk` - Generate for multiple companies

## Development

### Backend Development

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

## Configuration

### Backend Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `GEMINI_API_KEY` | Google Gemini API key | Yes | - |
| `GEMINI_MODEL` | Gemini model to use | No | `gemini-1.5-pro` |
| `DATABASE_URL` | Database connection string | No | SQLite file |
| `LANGSMITH_API_KEY` | LangSmith monitoring | No | - |
| `DEBUG` | Enable debug mode | No | `True` |

### Frontend Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8000` |

## Features in Detail

### 🎨 Customization Options
- **Tone**: Professional, friendly, enthusiastic, casual
- **Length**: Customize word count for different platforms
- **Context**: Add specific requirements or highlights

### 🔄 Bulk Generation
Generate content for multiple companies at once:
- Save time applying to multiple positions
- Consistent quality across all applications
- Track which companies you've prepared content for

### 📊 Smart Prompting
The AI considers:
- Your relevant skills matching the company's tech stack
- Projects that align with the company's domain
- Experience relevant to the role
- Company culture and values
- Recent company news or achievements

## Roadmap

- [ ] Save generated content history
- [ ] Export to PDF/Word
- [ ] Email integration (send directly)
- [ ] A/B testing for different tones
- [ ] Analytics on response rates
- [ ] Templates library
- [ ] Multi-user support with authentication

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Support

For issues or questions:
- Open an issue on GitHub
- Check the [API documentation](http://localhost:8000/docs)
- Review the [backend README](./backend/README.md)

---

Built with ❤️ using FastAPI, Next.js, and Google Gemini
