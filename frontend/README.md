# Frontend - Internship Application Generator
fix submodule bullshit


A minimalistic Next.js frontend for the Internship Application Generator API.

## Features

- 📝 **Profile Management**: Create and update your personal profile
- 🏢 **Company Management**: Add and manage companies you want to apply to
- ✨ **AI Content Generation**: Generate personalized emails, DMs, and applications

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4

## Getting Started

### With Docker (Recommended)

From the project root:
```bash
docker compose up
```

The frontend will be available at http://localhost:3000

### Manual Setup

```bash
npm install
npm run dev
```

## Pages

- `/` - Home page with overview
- `/profile` - Manage your personal profile
- `/companies` - Add and manage companies
- `/generate` - Generate personalized content

## API Configuration

The frontend connects to the backend API at `http://localhost:8000` by default.

To change this, edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://your-backend-url:8000
```

## Usage Flow

1. **Create Profile** (`/profile`)
   - Fill in your personal information
   - Add skills (comma-separated)
   - Add resume URL

2. **Add Companies** (`/companies`)
   - Click "+ Add Company"
   - Fill in company details
   - Add tech stack

3. **Generate Content** (`/generate`)
   - Select a company
   - Choose content type (email, DM, application)
   - Select tone and length
   - Click "Generate Content"
   - Copy the result!

## Development

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Troubleshooting

### Cannot connect to backend
- Make sure the backend is running on port 8000
- Check that `NEXT_PUBLIC_API_URL` is set correctly
- Verify CORS is enabled in the backend

### Page not found errors
- Make sure you're using Next.js App Router (not Pages Router)
- Check that page files are in the correct directories

### Styling issues
- Tailwind CSS 4 is configured
- Check `globals.css` for global styles
