# AlgoSpeak

A Chrome extension that lets you talk through a LeetCode problem out loud
and get real-time coaching feedback from an AI — hints, questions, and
code suggestions, without breaking your flow to type.

## How it works

1. **Client** (Chrome extension, injected into `leetcode.com/problems/*`)
   records your voice while you talk through your approach.
2. **Server** (Node/Express, deployed on Google Cloud Run):
    - Transcribes the audio via [Groq's hosted Whisper API](https://console.groq.com/docs/speech-to-text)
    - Pulls the current problem's statement, constraints, hints, and tags via
      the LeetCode API
    - Builds a prompt combining the problem context with what you said
    - Sends it to DeepSeek's chat API and returns the coaching response
3. The response is shown in the extension's panel on the LeetCode page.

## Project structure

```
AlgoSpeak/
├── client/       # Chrome extension frontend (React)
├── server/       # Express backend — deployed to Cloud Run
└── tts-server/   # Early scaffolding for text-to-speech, not wired in yet
```

## Tech stack

- **Frontend:** React, Chrome Extension Manifest V3, Webpack
- **Backend:** Node.js, Express
- **Speech-to-text:** Groq (`whisper-large-v3-turbo`)
- **LLM:** DeepSeek, via the OpenAI-compatible SDK
- **Database:** MongoDB — optional, used only to cache fetched problem
  statements
- **Deployment:** Google Cloud Run

## Getting started (local development)

### Prerequisites

- Node.js 18+
- A [Groq API key](https://console.groq.com) (free tier, no card needed)
- A [DeepSeek API key](https://platform.deepseek.com)
- (Optional) A MongoDB connection string, e.g. from Atlas's free tier

### Backend

```bash
cd server
npm install
```

Create `server/.env`:

```
GROQ_API_KEY=your-groq-key
DEEPSEEK_API_KEY=your-deepseek-key
MONGO_URI=your-mongo-uri   # optional — omit to skip problem-summary caching
```

```bash
npm run dev
```

Server starts on `http://localhost:5000`.

### Frontend

```bash
cd client
npm install
npm run build
```

Then in Chrome: go to `chrome://extensions`, enable Developer Mode, click
"Load unpacked", and select the `client/build` folder.

While iterating on the frontend, `npm run dev` inside `client/` watches for
changes instead of doing a one-off build.

## Deployment

The backend deploys to Google Cloud Run as a single service. Full
walkthrough (including one-time `gcloud` setup) is in `DEPLOY.md`.
Short version, run from the repo root once `gcloud` is installed and
authenticated:

```bash
gcloud run deploy algospeak-backend \
  --source ./server \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars GROQ_API_KEY=your-groq-key \
  --set-env-vars DEEPSEEK_API_KEY=your-deepseek-key
```

After deploying, update `BACKEND_URL` in `client/src/api/sendAudio.js` and
`client/src/api/sendRequest.js` to the Cloud Run URL that command prints,
then rebuild the extension and reload it in `chrome://extensions`.

The frontend itself is never "deployed" anywhere — Chrome extensions run
locally in the browser. Publishing to the Chrome Web Store (for other
people to install it) is a separate, later step.

## Current status / known limitations

- **Auth is disabled.** `middleware/auth.js` currently passes every request
  through without checking a token. Fine for testing solo; needs real JWT
  verification restored before sharing this with anyone else, since the
  backend URL would otherwise be open to whoever finds it.
- **No conversation memory yet.** Each request is stateless — the backend
  doesn't yet use Redis to remember earlier turns in the same session, or a
  vector DB to recall similar past discussions. See the TODOs below.
- **TTS isn't wired in.** `tts-server/` has early scaffolding for
  text-to-speech but the main pipeline currently returns text only.

## Roadmap

- [ ] Restore JWT auth before any public sharing
- [ ] Add conversation history via Redis
- [ ] Add vector-DB context retrieval (KNN over past sessions)
- [ ] Wire up text-to-speech for spoken responses
- [ ] Publish to the Chrome Web Store