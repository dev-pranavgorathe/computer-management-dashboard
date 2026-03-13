# BLOG_PLAN.md — Detailed Blog Strategy & Publishing Plan

## 1) Blog Goals

1. Improve SEO discoverability
2. Build authority through practical posts
3. Generate inbound leads from useful content
4. Create reusable content for LinkedIn/social posts

---

## 2) Blog Information Architecture

## 2.1 Routes
- `/blog` — listing page
- `/blog/[slug]` — post details
- Optional later:
  - `/blog/category/[slug]`
  - `/blog/tag/[slug]`

## 2.2 Categories
1. Web Development
2. WordPress
3. Performance Optimization
4. Case Studies
5. Career & Learning

## 2.3 Tags
- `nextjs`, `react`, `wordpress`, `elementor`, `dashboard`, `seo`, `performance`, `vercel`, `uiux`, `deployment`

---

## 3) Blog Post Template (Standard)

1. **Title**
2. **Intro hook** (2–4 lines)
3. **Problem statement**
4. **Context/background**
5. **Step-by-step solution**
6. **Code/snippets/screenshots** (if technical)
7. **Common mistakes**
8. **Key takeaways**
9. **CTA** (contact, project link, related article)

---

## 4) Editorial Rules

- Use simple, practical language
- Prefer examples over theory
- Keep paragraphs short
- Use subheadings every ~120–180 words
- Include at least 1 internal link to:
  - project page
  - another blog post
  - contact page

### Length targets
- Quick tutorial: 800–1200 words
- Deep dive/case study: 1400–2200 words

---

## 5) SEO Requirements Per Post

- Unique SEO title (50–60 chars)
- Meta description (140–160 chars)
- Clean slug (short, readable)
- One H1, logical H2/H3 hierarchy
- OG image (1200x630)
- `Article` schema
- Canonical URL

---

## 6) 20 Ready Blog Topics

### Web Development
1. How I rebuilt my portfolio for speed and clarity
2. 7 practical UI rules I follow in every dashboard
3. React vs WordPress: how I choose for client projects
4. Building reusable section components in Next.js

### WordPress
5. Elementor performance mistakes and how to fix them
6. WordPress speed optimization checklist (real-world)
7. How to migrate from WordPress to Next.js safely
8. When to keep WordPress and when to rebuild

### Performance
9. My Core Web Vitals optimization workflow
10. Image optimization strategy for portfolio websites
11. Reducing JS bloat in modern frontend apps
12. Practical caching tips for Vercel deployments

### Case Studies
13. Case study: computer management dashboard rebuild
14. Case study: improving a slow portfolio site
15. Case study: designing a status-tracking workflow UI
16. How I structured multi-module CRUD dashboards

### Career/Learning
17. My roadmap to becoming a stronger full-stack developer
18. Git workflow habits that reduced my production mistakes
19. Lessons from shipping real client projects
20. How I scope MVPs to avoid overbuilding

---

## 7) 8-Week Publishing Plan

## Week 1
- Post 1: Portfolio rebuild case
- Post 2: Elementor performance fixes

## Week 2
- Post 3: Dashboard UI rules
- Post 4: Core Web Vitals workflow

## Week 3
- Post 5: React vs WordPress decision framework
- Post 6: Image optimization in practice

## Week 4
- Post 7: Dashboard case study
- Post 8: Git habits for fewer deployment errors

## Week 5
- Post 9: WordPress to Next.js migration approach
- Post 10: Reusable component architecture

## Week 6
- Post 11: Caching on Vercel
- Post 12: Scope MVP without overbuilding

## Week 7
- Post 13: Multi-module CRUD architecture
- Post 14: UI mistakes to avoid

## Week 8
- Post 15: Lessons from client projects
- Post 16: Future improvements roadmap

(You can continue remaining 4 topics after this cycle.)

---

## 8) Blog Data Model (for implementation)

```ts
export type BlogPost = {
  slug: string
  title: string
  excerpt: string
  content: string
  category: 'Web Development' | 'WordPress' | 'Performance Optimization' | 'Case Studies' | 'Career & Learning'
  tags: string[]
  publishedAt: string
  updatedAt?: string
  readTime: string
  coverImage?: string
  seoTitle?: string
  seoDescription?: string
  featured?: boolean
}
```

---

## 9) Distribution Plan (after publish)

For each post:
1. Publish on website
2. Share summary on LinkedIn
3. Share key tip as short post/thread
4. Link back to full article
5. Add internal links from related older posts

---

## 10) Quality Checklist (before publish)

- [ ] Title is clear and specific
- [ ] Problem and solution both present
- [ ] Screenshots/snippets included where useful
- [ ] SEO metadata set
- [ ] Internal links added
- [ ] CTA included
- [ ] Grammar and formatting reviewed

---

## 11) Post-MVP Enhancements

- Search for blog posts
- Category and tag pages
- Newsletter capture block
- Related posts section
- Reading progress bar
- Content analytics dashboard
