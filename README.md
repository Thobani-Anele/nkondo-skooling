# Nkondo Schooling (Merged, GitHub/Vercel Ready)

This is the **merged** project with all features discussed:

- ✅ AI Tutor connected to **OpenAI API** (friendly teacher tone, multilingual)
- ✅ Voice input (speech recognition) + voice output (TTS)
- ✅ Session-only memory (clears on logout/close)
- ✅ Social **Study Rooms** (demo links + shared local notes)
- ✅ FAQ section
- ✅ Calm but colorful UI + branding

## Quick Deploy (Vercel)

1. Create a **new GitHub repo** and upload all files from this folder.
2. Go to **Vercel → New Project → Import GitHub repo**.
3. In **Project Settings → Environment Variables** add:
   - `OPENAI_API_KEY` = your OpenAI key (keep it secret)
4. Deploy. Your site will be live, and **/api/chat** will call OpenAI.

> 🔐 I did **not** hardcode your API key because it is unsafe. Using env vars keeps your key private and prevents abuse.

## Local run (optional)

You can simply open `index.html` to test the static parts. The AI endpoint needs a server:
- Install `vercel` globally: `npm i -g vercel`
- Run dev: `vercel dev`
- Or serve statics: `npm i` then `npm run start` (AI calls will fail without server).

## Notes

- **Study Rooms** are demo-only without a signaling server. They create links and store notes locally. Later, add a free signaling service (e.g., WebSocket or WebRTC broker) for real-time collaboration.
- Voices depend on the browser. Chrome desktop has the best support.
- Memory is kept only in the current session (tab).

## Branding

Replace `assets/logo.svg` with your own logo and tweak `styles.css` colors to your brand.
