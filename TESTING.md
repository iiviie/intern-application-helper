# Testing Guide

Complete guide to test the Internship Application Generator.

## Prerequisites

1. **Gemini API Key**: Get one from https://ai.google.dev/
2. **Docker & Docker Compose** installed
3. **Backend `.env` file** configured

## Setup

### 1. Configure Backend

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and add your Gemini API key:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
GEMINI_MODEL=gemini-2.0-flash
```

### 2. Start Services

From the project root:
```bash
docker compose up --build
```

Wait for both services to start:
- ✅ Backend: http://localhost:8000
- ✅ Frontend: http://localhost:3000

## Testing the Application

### Test 1: Backend Health Check

Open your browser and go to:
```
http://localhost:8000/health
```

You should see:
```json
{"status": "healthy"}
```

### Test 2: API Documentation

Visit the interactive API docs:
```
http://localhost:8000/docs
```

You should see the Swagger UI with all endpoints.

### Test 3: Frontend Home Page

Open:
```
http://localhost:3000
```

You should see:
- Navigation bar with links
- Three cards: Profile, Companies, Generate
- Clean, minimal design

### Test 4: Create Profile

1. Go to http://localhost:3000/profile
2. Fill in the form:
   - **Name**: John Doe
   - **Email**: john@example.com
   - **Phone**: +1234567890
   - **Location**: San Francisco, CA
   - **Bio**: Passionate software engineer with 2 years of experience
   - **Skills**: Python, FastAPI, React, TypeScript, Docker
   - **Resume URL**: https://example.com/resume.pdf

3. Click "Create Profile"
4. You should see: "Profile created successfully!"
5. The form should now show "Update Profile" button

### Test 5: Add Companies

1. Go to http://localhost:3000/companies
2. Click "+ Add Company"
3. Fill in the form:

   **Company 1:**
   - **Name**: TechStartup Inc
   - **Founder**: Jane Smith
   - **Description**: A cutting-edge AI startup building the future
   - **Industry**: Artificial Intelligence
   - **Job Role**: Software Engineer Intern
   - **Website**: https://techstartup.com
   - **Tech Stack**: Python, FastAPI, React, PostgreSQL

4. Click "Add Company"
5. Company should appear in the list

6. Add another company:

   **Company 2:**
   - **Name**: DevTools Co
   - **Founder**: Bob Johnson
   - **Description**: Building developer tools for modern teams
   - **Industry**: Developer Tools
   - **Job Role**: Backend Engineer Intern
   - **Website**: https://devtools.co
   - **Tech Stack**: Go, Kubernetes, Docker, AWS

### Test 6: Generate Cold Email

1. Go to http://localhost:3000/generate
2. Configure generation:
   - **Company**: TechStartup Inc
   - **Content Type**: Cold Email
   - **Tone**: Professional
   - **Max Length**: 500
   - **Additional Context**: (leave empty)

3. Click "✨ Generate Content"
4. Wait 5-10 seconds
5. You should see a personalized email appear!
6. Click "📋 Copy" to copy it to clipboard

### Test 7: Generate Cold DM

1. Stay on http://localhost:3000/generate
2. Change settings:
   - **Company**: DevTools Co
   - **Content Type**: Cold DM
   - **Tone**: Friendly
   - **Max Length**: 300

3. Click "✨ Generate Content"
4. Should get a shorter, more casual message

### Test 8: Generate Application

1. Select:
   - **Company**: TechStartup Inc
   - **Content Type**: Application/Cover Letter
   - **Tone**: Enthusiastic
   - **Max Length**: 500
   - **Additional Context**: "I recently built a similar AI project using LangChain"

2. Click "✨ Generate Content"
3. Should get a detailed cover letter

## Testing via API (Optional)

### Using curl

**Create Profile:**
```bash
curl -X POST http://localhost:8000/api/profile \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "bio": "Full-stack developer",
    "skills": ["JavaScript", "React", "Node.js"]
  }'
```

**List Companies:**
```bash
curl http://localhost:8000/api/companies
```

**Generate Content:**
```bash
curl -X POST http://localhost:8000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "user_profile_id": 1,
    "company_id": 1,
    "generation_type": "cold_email",
    "tone": "professional",
    "max_length": 500
  }'
```

## Expected Results

### Cold Email Sample
Should include:
- Subject line
- Professional greeting
- Relevant skills highlighted
- Specific mention of company/role
- Clear call-to-action
- Professional signature

### Cold DM Sample
Should include:
- Brief, casual introduction
- 1-2 key accomplishments
- Specific interest in the company
- Direct ask

### Application Sample
Should include:
- Strong opening
- Detailed relevant experience
- Alignment with company values
- Enthusiasm for the role
- Professional closing

## Troubleshooting

### Backend won't start
```bash
# Check logs
docker compose logs backend

# Common fixes:
# 1. Rebuild with clean slate
docker compose down
docker compose up --build

# 2. Check .env file exists
ls backend/.env
cat backend/.env
```

### Frontend can't connect to backend
```bash
# Check backend is running
curl http://localhost:8000/health

# Check frontend env
cat frontend/.env.local
```

### "No module named 'email_validator'" error
```bash
# Rebuild backend container
docker compose down
docker compose up --build backend
```

### Generation fails with API error
- Check your Gemini API key is valid
- Check you haven't exceeded rate limits
- Try a simpler generation first

### Generated content is empty or weird
- Make sure profile has meaningful data
- Add more details to company description
- Try different tones/lengths

## Performance Notes

- **First generation**: May take 5-10 seconds
- **Subsequent generations**: Usually 3-5 seconds
- **Gemini 2.0 Flash**: Faster than Pro version

## Next Steps

After testing:
1. Try different tones and see the difference
2. Add more detailed company information for better results
3. Experiment with additional context
4. Test bulk generation via API
5. Compare outputs for same company with different tones

## Getting Help

If you encounter issues:
1. Check the logs: `docker compose logs`
2. Verify your Gemini API key
3. Check the backend README: `backend/README.md`
4. Check the frontend README: `frontend/README.md`
