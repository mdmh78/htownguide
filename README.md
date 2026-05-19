# htownguide.com

An independent, locally-edited guide to Houston, Texas.

Built with [Astro](https://astro.build/) + [Tailwind CSS v4](https://tailwindcss.com/). Deployed on [Cloudflare Pages](https://pages.cloudflare.com/).

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:4321](http://localhost:4321).

## Build

```bash
npm run build
```

Output goes to `./dist/`.

## Project structure

```
src/
  layouts/
    BaseLayout.astro   - Shared layout (header, footer, SEO meta)
  pages/
    index.astro        - Homepage
    neighborhoods/     - Neighborhood guides
    hotels/            - Hotel recommendations by area
    restaurants/       - Restaurant guide by genre
    things-to-do/      - Attractions and activities
    world-cup-2026.astro
    plan.astro         - AI itinerary tool (in progress)
    about.astro
    contact.astro
    disclosure.astro
  styles/
    global.css         - Tailwind v4 theme + base styles
public/
  favicon.svg
  robots.txt
```
