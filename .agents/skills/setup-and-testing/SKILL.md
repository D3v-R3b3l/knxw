# Revenue Projection App — Setup & Testing

## Project Structure
- Frontend: Vite + React + TypeScript + Tailwind v4 at `client/`
- Backend: Express + TypeScript at `server/`
- Database: SQLite with WAL mode at `data/app.db`
- AI: Configurable — OpenAI or local (Ollama/LocalAI/LM Studio/vLLM)

## Environment Variables
- `AI_BASE_URL` — Local AI endpoint (e.g. `http://localhost:11434/v1` for Ollama). If not set, uses OpenAI.
- `AI_MODEL` — Model name (e.g. `llama3.2:3b` for Ollama, `gpt-4o-mini` for OpenAI)
- `AI_API_KEY` — API key for local AI (defaults to `ollama` for Ollama)
- `OPENAI_API_KEY` — OpenAI API key (used if `AI_BASE_URL` not set)
- `WAVESPEED_API_KEY` — WaveSpeed API key for image generation (nano-banana-2)

## Starting the App

### With Ollama (free, local)
```bash
# Install Ollama if needed
curl -fsSL https://ollama.com/install.sh | sh
ollama pull llama3.2:3b

# Start backend
export AI_BASE_URL=http://localhost:11434/v1
export AI_MODEL=llama3.2:3b
npx tsx server/index.ts

# Start frontend (separate terminal)
npx vite --config vite.config.ts --port 3000
```

### With OpenAI
```bash
export OPENAI_API_KEY=<key>
npx tsx server/index.ts
npx vite --config vite.config.ts --port 3000
```

## Key URLs
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Command Dashboard: http://localhost:3000/command
- Revenue Projection: http://localhost:3000/

## Testing Agents
1. Open http://localhost:3000/command
2. Verify header shows model name (e.g. `llama3.2:3b OK`) and `Backend Online`
3. Click `Run` on any Phase 1 agent (Trend Intelligence, Digital Products, Short-Form Video)
4. Switch to `Live Feed` tab to watch real-time logs
5. Ollama CPU inference takes ~60-120s per agent. OpenAI takes ~5-10s.

## Known Issues
- `client/src/const.ts` has a pre-existing TS error for `@shared/const` module — not related to agents
- Ollama on CPU is slow; GPU recommended for production
- Local models may produce malformed JSON — `repairJSON()` in `aiClient.ts` handles this
- Vite config must be explicitly passed: `--config vite.config.ts`
- Do NOT use `postcss.config.js` with Tailwind v4 + @tailwindcss/vite plugin

## Build for Production
```bash
npx vite build --config vite.config.ts
# Express serves built files from dist/public/ on port 3001
```
