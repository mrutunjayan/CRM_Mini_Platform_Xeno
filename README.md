# Mini CRM

A small customer relationship manager for keeping contacts and sales deals in one place. Create an account, track deals on a five-stage board, and ask Gemini to draft a follow-up email from the context you already have.

## Features

- Register and sign in with a hashed password and a seven-day JWT session.
- Add, search, view, edit, and delete contacts.
- Create deals and move them between New, Contacted, Qualified, Won, and Lost. Stage changes are saved to MongoDB.
- View contact, deal, won, and lost counts on a simple dashboard.
- Generate an editable follow-up email draft with Gemini. The API key stays on the backend.
- Keep each user's contacts and deals private to their account.

## Tech Stack

- Frontend: React, Vite, React Router, Lucide icons
- Backend: Node.js, Express, Mongoose
- Database: MongoDB Atlas
- Authentication: bcryptjs and JSON Web Tokens
- AI: Gemini API (`gemini-2.5-flash`)

## Folder Structure

```text
mini-crm/
├── backend/
│   ├── src/
│   │   ├── config/          MongoDB connection
│   │   ├── middleware/      Authentication and error handling
│   │   ├── models/          User, contact, and deal schemas
│   │   ├── routes/          REST API endpoints
│   │   ├── services/        Gemini API integration
│   │   └── server.js
│   └── .env.example
├── frontend/
│   └── src/                 React pages, components, and API client
├── docs/
│   ├── architecture.png
│   └── improvement-notes.md
├── .env.example
├── .gitignore
└── README.md
```

## Requirements

- Node.js 20 or newer
- npm
- A MongoDB Atlas database
- A Gemini API key for AI email drafts

## Environment Setup

1. In MongoDB Atlas, create a free cluster, a database user, and allow your development IP in Network Access. Copy the application's connection URI; replace the password placeholder and use a database name such as `mini-crm`.
2. Copy `backend/.env.example` to `backend/.env` and enter your own values:

   ```env
   MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/mini-crm?retryWrites=true&w=majority
   JWT_SECRET=<a-long-random-secret>
   GEMINI_API_KEY=<your-gemini-api-key>
   PORT=5000
   CLIENT_URL=http://localhost:5173
   ```

   Keep `backend/.env` private. It is ignored by Git. Do not put the Gemini key in frontend variables; Vite variables are bundled for browsers.
3. Get a Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey). Without it, the rest of the CRM works; the AI endpoint returns a clear configuration error.

The API loads these values with `dotenv` from `process.env`. No real credentials are included in this project.

## Run the Backend

From the project root:

```bash
cd backend
npm install
npm run dev
```

The API listens on `http://localhost:5000`. It connects to MongoDB before accepting requests. For a non-watching process, use `npm start`.

## Run the Frontend

In a second terminal, from the project root:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. Vite forwards `/api` requests to the local Express API. If the API is hosted elsewhere, set `VITE_API_URL` when building the frontend to the API origin.

## API Endpoints

All endpoints other than register and login require `Authorization: Bearer <token>`. JSON request bodies use `Content-Type: application/json`.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Sign in and receive a JWT |
| GET | `/api/health` | Check API availability |
| GET | `/api/contacts` | List the signed-in user's contacts |
| POST | `/api/contacts` | Add a contact |
| PUT | `/api/contacts/:id` | Update a contact |
| DELETE | `/api/contacts/:id` | Delete a contact without deals |
| GET | `/api/deals` | List deals, including contact details |
| POST | `/api/deals` | Create a deal linked to the user's contact |
| PUT | `/api/deals/:id` | Update a deal, including its stage |
| DELETE | `/api/deals/:id` | Delete a deal |
| POST | `/api/ai/follow-up` | Generate an email draft with Gemini |

Contact fields: `name`, `email`, `phone`, `company`, `notes`. Deal fields: `title`, `contact` (contact ID), `value`, `stage`, `notes`. Allowed stages are `New`, `Contacted`, `Qualified`, `Won`, and `Lost`. The AI endpoint accepts `contactName`, `company`, `notes`, `dealTitle`, and `dealStage`, and responds with `{ "email": "..." }`.

## Validation and Errors

The API validates required fields, email addresses, stage names, values, and text lengths. It returns JSON errors with appropriate 400, 401, 404, 409, 413, 502, or 503 status codes. Records are always queried with the signed-in user's ID; a deal cannot be linked to another user's contact. A contact with existing deals cannot be deleted until those deals are removed.

Run backend unit tests with `cd backend && npm test`. Create a production frontend build with `cd frontend && npm run build`.

## Architecture

See [docs/architecture.png](docs/architecture.png) for the request and data flow.

## Future Improvements

See [docs/improvement-notes.md](docs/improvement-notes.md) for a short list of possible next steps.