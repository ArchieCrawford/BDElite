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
