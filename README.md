# Agentic Social Share

Generate polished, platform-ready social media copy from any blog post in seconds. Drop a URL or paste key points and receive tailored posts for X (Twitter), LinkedIn, Facebook, and Instagram—complete with summaries, keywords, and call-to-action guidance.

## Features

- **Automatic article extraction** – fetches the title and body of public blog posts.
- **Heuristic content engine** – distills summaries, keywords, and reading time without external APIs.
- **Multi-platform copy** – adapts tone, hashtags, and structure per social network.
- **Tone & CTA controls** – switch between professional, casual, playful, and more.
- **Clipboard-ready output** – copy posts instantly with one click.

## Tech Stack

- [Next.js 14 (App Router)](https://nextjs.org/) with TypeScript
- Lightweight content parsing via [`jsdom`](https://github.com/jsdom/jsdom) and [`@mozilla/readability`](https://github.com/mozilla/readability)
- Request validation with [`zod`](https://github.com/colinhacks/zod)

## Local Development

```bash
cd webapp
npm install
npm run dev
```

Visit `http://localhost:3000` to use the generator.

### Quality Checks

```bash
npm run lint
npm run build
```

## Deployment

The project is configured for Vercel. After validating locally:

```bash
vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-a96be3f4
```

Once deployed, verify the production URL:

```bash
curl https://agentic-a96be3f4.vercel.app
```

## Environment Notes

- External fetching relies on public access to the provided blog URL. If a site blocks the request, paste a summary manually.
- Clipboard actions require a secure context (HTTPS or localhost).

---

Built autonomously to streamline social amplification for content teams.
