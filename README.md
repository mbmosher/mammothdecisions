# Mammoth — Deployment Checklist

This document explains exactly what to do any time you change `index.html` and need those changes to go live. Read the full thing once so you understand the flow, then use it as a reference checklist going forward.

---

## How the stack fits together

| Service | Role | How often you touch it |
|---|---|---|
| **GitHub** | Stores your code. Source of truth. | Every change |
| **Cloudflare Pages** | Builds and serves the app to users | Automatic — triggered by GitHub |
| **Supabase** | Stores user data and handles auth (sign-up, sign-in, password reset, email change) | Only when data structure or auth settings change |
| **Brevo** | Sends all transactional emails (account confirmation, password reset, email change) via SMTP | Only when SMTP credentials or sender domain changes |
| **Gandi** | Owns your domain name (`mammothdecisions.org`) | Almost never |

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

### Brevo
- [ ] No action required

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
- [ ] Confirm that no real keys or credentials appear anywhere in `index.html` or `build.mjs` — only the placeholders `%%SUPABASE_URL%%` and `%%SUPABASE_KEY%%`
- [ ] Never commit real credentials to the repo under any circumstances

### Supabase
- [ ] If you rotated your anon key, confirm the old key has been invalidated in the Supabase dashboard under **Settings > API**

### Gandi
- [ ] No action required

---

## If email delivery stops working or you need to change SMTP settings

This applies if Brevo credentials change, you rotate the SMTP key, or transactional emails (confirmation, password reset, email change) stop arriving.

### Brevo
- [ ] Log into brevo.com and go to your account name (top right) → **SMTP & API**
- [ ] If rotating the SMTP key: generate a new key, copy it immediately (it's only shown once)
- [ ] Confirm your sender domain (`mammothdecisions.org`) still shows as verified under **Senders & IP > Domains**
- [ ] Confirm DKIM and DMARC are both green — if not, re-add the DNS records from Brevo into Cloudflare DNS
- [ ] Check **Transactional > Email > Logs** to see whether emails are being sent, bounced, or blocked

### Supabase
- [ ] Go to **Auth > Settings** (or **Auth > Configuration > SMTP**)
- [ ] Update the SMTP password field with the new Brevo SMTP key
- [ ] Confirm the sender email is set to an address at `mammothdecisions.org` (not a freemail address)
- [ ] Send a test password reset email to verify delivery end to end

### Cloudflare DNS (if DKIM/DMARC records need updating)
- [ ] Add or update the TXT record provided by Brevo for DKIM (name: `mail._domainkey`, value: starts with `v=DKIM1`)
- [ ] Confirm the DMARC record exists: name `_dmarc`, value `v=DMARC1; p=none; ...`
- [ ] DNS changes on Cloudflare typically propagate within a few minutes

### GitHub
- [ ] No action required

---

## If your domain stops working or something breaks at the URL level

### Gandi
- [ ] Log into Gandi and confirm your DNS records are still pointing at Cloudflare correctly — the nameservers or CNAME record should not have changed
- [ ] If you recently renewed your domain, check that renewal did not reset any DNS settings

### Cloudflare Pages
- [ ] Confirm your custom domain is still listed and active under **Settings > Custom Domains** in your Cloudflare Pages project
- [ ] Check that your SSL certificate is active — Cloudflare provisions this automatically but occasionally needs a manual refresh

### Supabase
- [ ] Confirm **Auth > URL Configuration > Site URL** is still set to `https://mammothdecisions.org`
- [ ] Confirm **Auth > URL Configuration > Redirect URLs** still includes `https://mammothdecisions.org` — this is required for password reset and email change links to work

### GitHub
- [ ] No action required

---

## Quick reference — what triggers a Cloudflare rebuild

Cloudflare Pages rebuilds and redeploys your app automatically when:
- You push any commit to the `main` branch on GitHub

Cloudflare Pages does **not** rebuild automatically when:
- You change environment variables in the Cloudflare dashboard — you must trigger a manual redeploy
- You change anything in Supabase
- You change DNS settings in Gandi or Cloudflare DNS
- You change SMTP settings in Brevo or Supabase

---

## Files in this repository

| File | Purpose |
|---|---|
| `index.html` | The entire app — HTML, CSS, and JavaScript in one file |
| `build.mjs` | Build script that injects Supabase credentials and copies static assets at deploy time |
| `manifest.json` | PWA manifest — app name, theme colour, icon reference for "Add to Home Screen" |
| `icon.svg` | App icon (mammoth emoji on sage-green background) — used for Android/Chrome home screen |
| `schema.sql` | Record of the current Supabase database structure |
| `.gitignore` | Tells GitHub to ignore the `dist/` folder |
| `CNAME` | Domain configuration file |
| `README.md` | This file |

---

## Things that should never be in this repository

- Your real Supabase URL or anon key (use `%%SUPABASE_URL%%` and `%%SUPABASE_KEY%%` as placeholders)
- Brevo SMTP keys or any other service credentials
- The `dist/` folder (this is the built output — Cloudflare generates it, it does not belong in source control)
- Any passwords, tokens, or credentials of any kind

---

## Supabase auth settings reference

These settings live in **Supabase > Auth** and should be checked if auth behaviour changes unexpectedly.

| Setting | Location | Current value |
|---|---|---|
| Email provider enabled | Auth > Providers > Email | On |
| Email confirmations | Auth > Providers > Email | On (new users must confirm before signing in) |
| Magic links | Auth > Providers > Email | Off (password auth is used instead) |
| Site URL | Auth > URL Configuration | `https://mammothdecisions.org` |
| Redirect URLs | Auth > URL Configuration | `https://mammothdecisions.org` |
| Custom SMTP | Auth > Settings > SMTP | On — uses Brevo |
| SMTP host | Auth > Settings > SMTP | `smtp-relay.brevo.com` port `587` |
| Sender email | Auth > Settings > SMTP | `[your address]@mammothdecisions.org` |

---

*Last updated: June 2026*
