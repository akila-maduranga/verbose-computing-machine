# Subtitle Magic - AI Subtitle Generator

A premium, secure AI subtitle generator built with Next.js and ElevenLabs Scribe v2.

## Features
- **Client-Side Audio Extraction**: Extracts and compresses audio directly in your browser using FFmpeg WebAssembly.
- **Secure Transcription**: Uses ElevenLabs Scribe v2 for state-of-the-art speech-to-text.
- **Premium UI**: Glassmorphic dark-mode design with synchronized subtitle preview.
- **Vercel Optimized**: Engineered to bypass Vercel's 4.5MB request limit.

## Getting Started

1.  **Environment Variables**:
    Create a `.env.local` file and add your ElevenLabs API key:
    ```env
    ELEVENLABS_API_KEY=your_key_here
    ```

2.  **Install & Run**:
    ```bash
    npm install
    npm run dev
    ```

## Vercel Deployment

This project is ready for Vercel deployment.

### 1. Environment Variables
Add the following variable in your Vercel project settings:
- `ELEVENLABS_API_KEY`: Your ElevenLabs API key.

### 2. Header Configuration
The project includes `next.config.mjs` and `vercel.json` with the required CORS headers for FFmpeg WASM:
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: require-corp`

### 3. Deploy
Simply push your code to GitHub and connect it to Vercel, or use the Vercel CLI:
```bash
vercel --prod
```
