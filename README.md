# Mammoth — Deployment Checklist

This document explains exactly what to do any time you change `index.html` and need those changes to go live. Read the full thing once so you understand the flow, then use it as a reference checklist going forward.

---

## How the stack fits together

| Service | Role | How often you touch it |
|---|---|---|
| **GitHub** | Stores your code. Source of truth. | Every change |
| **Cloudflare Pages** | Builds and serves the app to users | Automatic — triggered by GitHub |
| **Supabase** | Stores user data and handles auth | Only when data structure changes |
| **Gandi** | Owns your domain name | Almost never |

---

## The normal case — you changed index.html and nothing else

This is the most common situation. You fixed something, updated copy, or adjusted the UI. No database changes, no new environment variables.

### GitHub
- [ ] Save your changes to `index.html` locally
- [ ] Commit the change with a clear message describing what you changed (e.g. `fix: correct grounding save logic`)
- [ ] Push to the `main` branch on GitHub

### Cloudflare Pages
- [ ] Cloudflare detects the push automatically and starts a new build — no action required
- [ ] Go to your Cloudflare Pages dashboard and confirm the build completes without errors (builds usually take under a minute)
- [ ] Open your live domain in a browser and verify the change looks correct
- [ ] If the build fails, click into the build log in Cloudflare Pages — it will show you exactly which step failed

### Supabase
- [ ] No action required for UI-only changes

### Gandi
- [ ] No action required

---

## If you changed how data is stored — new fields, new tables, or changed structure

This applies if you added a new question, changed what gets saved, or altered the shape of any user data.

### GitHub
- [ ] Save your changes to `index.html` locally
- [ ] If the SQL schema changed, update a file called `schema.sql` in the repo to reflect the current state (keep this as a record)
- [ ] Commit both files with a clear message (e.g. `feat: add reflections table`)
- [ ] Push to `main`

### Supabase
- [ ] Log into your Supabase project at supabase.com
- [ ] Go to **SQL Editor** in the left sidebar
- [ ] Run only the new or changed SQL — do not re-run the full schema, as this will cause errors on tables that already exist
- [ ] Go to **Table Editor** and confirm the new structure looks correct
- [ ] If you added a new table, confirm its Row Level Security policy is enabled — check under **Authentication > Policies**
- [ ] Test that an existing user account can still log in and see their data correctly

### Cloudflare Pages
- [ ] Confirm the build triggered by your GitHub push completes without errors
- [ ] Test the changed functionality end to end in a real browser session — log in, perform the action, log out, log back in and confirm data persisted

### Gandi
- [ ] No action required

---

## If you added or changed an environment variable (e.g. new Supabase key)

This applies if you rotated your Supabase keys, added a new service, or changed the placeholder values in `index.html`.

### Cloudflare Pages
- [ ] Go to your Cloudflare Pages project dashboard
- [ ] Click **Settings > Environment Variables**
- [ ] Add or update the relevant variable (e.g. `SUPABASE_URL`, `SUPABASE_KEY`)
- [ ] Trigger a manual redeploy — go to **Deployments** and click **Retry deployment** on the latest build, or push a trivial commit to GitHub to trigger a fresh build
- [ ] Confirm the new build completes and the app works correctly with the updated variable

### GitHub
- [ ] Confirm that no real keys or credentials appear anywhere in `index.html` or `build.js` — only the placeholders `%%SUPABASE_URL%%` and `%%SUPABASE_KEY%%`
- [ ] Never commit real credentials to the repo under any circumstances

### Supabase
- [ ] If you rotated your anon key, confirm the old key has been invalidated in the Supabase dashboard under **Settings > API**

### Gandi
- [ ] No action required

---

## If your domain stops working or something breaks at the URL level

### Gandi
- [ ] Log into Gandi and confirm your DNS records are still pointing at Cloudflare correctly — the nameservers or CNAME record should not have changed
- [ ] If you recently renewed your domain, check that renewal did not reset any DNS settings

### Cloudflare Pages
- [ ] Confirm your custom domain is still listed and active under **Settings > Custom Domains** in your Cloudflare Pages project
- [ ] Check that your SSL certificate is active — Cloudflare provisions this automatically but occasionally needs a manual refresh

### GitHub
- [ ] No action required

### Supabase
- [ ] No action required

---

## Quick reference — what triggers a Cloudflare rebuild

Cloudflare Pages rebuilds and redeploys your app automatically when:
- You push any commit to the `main` branch on GitHub

Cloudflare Pages does **not** rebuild automatically when:
- You change environment variables in the Cloudflare dashboard — you must trigger a manual redeploy
- You change anything in Supabase
- You change DNS settings in Gandi

---

## Files in this repository

| File | Purpose |
|---|---|
| `index.html` | The entire app — HTML, CSS, and JavaScript in one file |
| `build.js` | Build script that injects Supabase credentials at deploy time |
| `schema.sql` | Record of the current Supabase database structure |
| `.gitignore` | Tells GitHub to ignore the `dist/` folder |
| `README.md` | This file |

---

## Things that should never be in this repository

- Your real Supabase URL or anon key (use `%%SUPABASE_URL%%` and `%%SUPABASE_KEY%%` as placeholders)
- The `dist/` folder (this is the built output — Cloudflare generates it, it does not belong in source control)
- Any passwords, tokens, or credentials of any kind

---

*Last updated: May 2026*
