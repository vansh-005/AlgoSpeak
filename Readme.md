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
gcloud run deploy algospeak-backend --source ./server --region asia-south1 --allow-unauthenticated --env-vars-file server/env.yaml                     
```

After deploying, update `BACKEND_URL` in `client/src/api/sendAudio.js` and
`client/src/api/sendRequest.js` to the Cloud Run URL that command prints,
then rebuild the extension and reload it in `chrome://extensions`.

The frontend itself is never "deployed" anywhere — Chrome extensions run
locally in the browser. Publishing to the Chrome Web Store (for other
people to install it) is a separate, later step.

