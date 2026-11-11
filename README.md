# BD Elite — 7v7 Football Program

Website for **BD Elite**, a 7v7 football program coming in 2027 (8U · 10U · 15U). Building Different. Developing Elite.

Static site — no build step. `index.html` is the landing page (Three.js animated hero, program overview, teams, pillars, tryout-alert form); `thanks/` is the form's success page.

## Deploying (Netlify)

`netlify.toml` is included. In Netlify: **Add new site → Import an existing project → GitHub → this repo → Deploy**. Then attach the domain under **Domain management** (www.bdel1te.com).

The tryout-alert form uses Netlify Forms (form name `bdelite-tryouts`). Enable Forms on the site and add an email notification under **Project configuration → Notifications**.

## Customizing

- Theme colors and fonts: variables at the top of `bdelite.css`
- 3D hero (football + embers): `hero3d.js`
- Flyer and logo: `assets/`

## Roster admin (bdel1te.com/admin/)

Rosters are stored in Supabase (the TAYP project, tables `bdelite_teams`, `bdelite_players`, `bdelite_editors`) and the roster pages read them live via `js/roster.js`. The admin page at `/admin/` lets approved editors add, edit, and remove players and manage the editor list. Editors sign in with a TAYP account; only emails in `bdelite_editors` can write (enforced by row-level security). Connection details live in `js/supabase-config.js` (the anon key is public by design).

For "email me a sign-in link" and password resets to land back on the admin page, `https://bdel1te.com/admin/` must be listed under Authentication → URL Configuration → Redirect URLs in the Supabase project.
