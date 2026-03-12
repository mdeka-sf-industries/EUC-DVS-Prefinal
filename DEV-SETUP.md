# Why changes don’t show on localhost

## Dev vs build+preview (important)

| Command | What it does | When changes show |
|--------|----------------|-------------------|
| **`npm run dev`** | Runs the **dev server** from `src/`. Use this for development. | **Immediately** (often without refresh). Always use **http://localhost:5174** for this project. |
| **`npm run build`** then **`npm run preview`** | Builds static files into `dist/` and serves that folder. | **Only after you run `npm run build` again** and refresh. Preview does **not** use your latest `src/` edits. |

If you were running **build + preview** and saw changes, that’s because you ran **build** again each time — preview only shows the last build. For day-to-day coding, use **`npm run dev`** and open **http://localhost:5174**.

---

## 1. Stop old servers first (fixes “multiple ports”)

Every time you run `npm run dev` without stopping the previous one, a **new** dev server starts on the next free port (5175, 5176, …). So you end up with several servers; your browser might be on an **old** port with old code.

**Fix:**

1. **Stop all dev/preview servers**  
   In every terminal where you ran `npm run dev` or `npm run preview`, press **Ctrl+C** to stop it.

2. **Optional: kill any process still using 5174** (if you closed the terminal but the process is still running):
   ```bash
   lsof -ti:5174 | xargs kill -9
   ```
   (On Windows you’d use a different command or Task Manager.)

3. **Start the dev server once:**
   ```bash
   cd "/Users/mdeka/Documents/Kenton Energy GenChat DVS"
   npm run dev
   ```
   This project is set to use **port 5174** only. If 5174 is still in use, the server will **refuse to start** and tell you — so you know to stop whatever is on 5174.

4. **Open only this URL:** **http://localhost:5174**  
   Don’t use an old tab on 5175, 5176, or preview (e.g. 4173).

---

## 2. You might be viewing the **built** app (preview) instead of the **dev** app

- **Dev server** = runs from `src/`, so every save is reflected (with hot reload).
- **Preview** = serves the `dist/` folder. It only updates after you run `npm run build` again.

If you use **`npm run preview`** (or any server that serves `dist/`), you’re **not** on the dev server. Edits to `src/` won’t show until you run **`npm run build`** again and refresh.

**Fix:** For development, use **`npm run dev`** and open **http://localhost:5174**. Use build+preview only when you want to test the production build.

---

## 2. Wrong folder when running `npm run dev`

If you run `npm run dev` from another folder (e.g. a different clone or copy of the project), the server will serve **that** project, not this one.

**Fix:** Always run from this project root:

```bash
cd "/Users/mdeka/Documents/Kenton Energy GenChat DVS"
npm run dev
```

---

## 3. Browser cache

The browser might be reusing an old JS bundle.

**Fix:**

- Hard refresh: **Mac** `Cmd+Shift+R`, **Windows** `Ctrl+Shift+R`.
- Or: DevTools (F12) → right‑click Refresh → **Empty Cache and Hard Reload**.
- Or try an incognito/private window with the dev server URL.

---

## 4. Old tab or wrong port

You might have several tabs or ports (e.g. 5173 and 5174). One might be an old dev run or a preview server.

**Fix:** Close other tabs for this app. Stop any other running dev/preview/serve processes, then start **one** dev server from this folder and open only the URL it prints.

---

## Quick checklist

1. Stop any running `vite`, `serve`, or `preview` for this project.
2. From this repo: `cd "/Users/mdeka/Documents/Kenton Energy GenChat DVS"` then `npm run dev`.
3. Open the URL shown in the terminal (e.g. http://localhost:5173).
4. Hard refresh (Cmd+Shift+R or Ctrl+Shift+R).

After this, your latest changes (summary button “Sign up for solar”, enrollment page, clickable tariff cards) should appear on localhost.
