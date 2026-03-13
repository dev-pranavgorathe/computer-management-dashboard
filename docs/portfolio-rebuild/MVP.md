# MVP.md — Portfolio Rebuild MVP

## Objective
Launch a high-performance portfolio website that clearly communicates profile, work, credibility, and contact options, including a basic blog.

## In Scope (MVP)

### Core Pages
- Home (`/`)
- Blog listing (`/blog`)
- Blog details (`/blog/[slug]`)
- Contact (`/contact`)

### Home Sections
1. Hero
2. Client/organization logos
3. About
4. Experience
5. Skills
6. Featured Projects
7. Certifications
8. Testimonials
9. Education
10. Services
11. Contact CTA
12. Footer

### Blog MVP
- 6 starter posts
- Category + tags + read time + publish date
- SEO title/description per post
- OG image fallback

### Non-Functional
- Mobile-first responsive design
- Lighthouse targets:
  - Performance >= 85
  - Accessibility >= 90
  - Best Practices >= 90
  - SEO >= 90
- Core Web Vitals friendly

## Out of Scope (Post-MVP)
- Multi-language support
- Auth/admin dashboard
- Comments system
- Newsletter automation
- Headless CMS integration

## Acceptance Criteria
- All pages render and route correctly
- Contact form submits successfully (or fallback mailto flow)
- Blog pages are indexable and listed in sitemap
- Page load is visibly faster than current WordPress build
- No broken links/images on primary pages

## MVP Timeline (Suggested)
- Day 1: Content finalization + design system
- Day 2–3: Home sections implementation
- Day 4: Blog implementation + SEO
- Day 5: QA + deployment + fixes

## Risks
- Content delays (project details, testimonials)
- Asset quality/size impacting performance
- Scope creep from non-MVP requests

## Mitigation
- Freeze MVP scope before build
- Use compressed image assets + next/image
- Track post-MVP items separately
