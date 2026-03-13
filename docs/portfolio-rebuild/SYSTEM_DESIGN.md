# SYSTEM_DESIGN.md — Portfolio Rebuild

## 1. Architecture
- **Frontend:** Next.js (App Router)
- **Styling:** Tailwind CSS + small custom utility layer
- **Content:**
  - Static typed config for homepage sections
  - MDX or markdown collection for blog posts
- **Deployment:** Vercel

## 2. High-Level Diagram
1. Browser requests page
2. Next.js serves SSR/SSG output
3. Blog content loaded from filesystem (MVP) or CMS (future)
4. Contact submission hits API route
5. API route sends email / stores message

## 3. Route Design
- `/` -> Home sections
- `/projects` -> Project listing/details anchors
- `/blog` -> Blog index
- `/blog/[slug]` -> Blog article
- `/contact` -> Contact page/form
- Optional: `/api/contact`

## 4. Component Design
- `Navbar`
- `HeroSection`
- `ClientsSection`
- `AboutSection`
- `ExperienceSection`
- `SkillsSection`
- `ProjectsSection`
- `TestimonialsSection`
- `CertificationsSection`
- `ContactSection`
- `Footer`
- `BlogCard`, `BlogLayout`, `TableOfContents` (optional)

## 5. Data Models

### 5.1 Project
```ts
{
  slug: string
  title: string
  summary: string
  problem: string
  solution: string
  stack: string[]
  outcome: string
  liveUrl?: string
  repoUrl?: string
  image: string
  featured: boolean
}
```

### 5.2 BlogPost
```ts
{
  slug: string
  title: string
  excerpt: string
  content: string
  category: string
  tags: string[]
  publishedAt: string
  readTime: string
  coverImage?: string
  seoTitle?: string
  seoDescription?: string
}
```

## 6. Rendering Strategy
- Home: SSG (fast, mostly static)
- Blog index/details: SSG with revalidate if needed
- Contact API: server route

## 7. Performance Design
- `next/image` for optimized images
- Font optimization via `next/font`
- Avoid heavy runtime animation libs in MVP
- Code split section-level components
- Minimize third-party scripts

## 8. SEO Design
- `generateMetadata` per route
- JSON-LD:
  - Person schema on home
  - Article schema on blog posts
- `sitemap.ts`, `robots.ts`

## 9. Security & Reliability
- Input validation on contact endpoint
- Basic anti-spam protection (honeypot/rate limit)
- Error boundaries + fallback UI
- Secrets via environment variables

## 10. Observability
- Vercel Analytics (optional)
- Error logging via console + optional Sentry
- Simple uptime checks (optional)

## 11. Future Enhancements
- Headless CMS migration
- Search over blog content
- Newsletter integration
- A/B testing for CTA sections

## 12. Deployment Workflow
1. Feature branch
2. PR checks + preview deploy
3. Merge to main
4. Production deployment
5. Smoke test critical pages
