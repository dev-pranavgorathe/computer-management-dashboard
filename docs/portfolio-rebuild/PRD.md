# PRD.md — Product Requirements Document

## 1. Product Overview
Rebuild Pranav Gorathe's personal website into a modern, performant portfolio with blog support to improve personal branding, recruiter confidence, and inbound leads.

## 2. Problem Statement
Current site (WordPress/Elementor) is visually functional but heavy and slower than desired. Content updates are less structured and blog growth is limited.

## 3. Goals
- Showcase expertise and projects clearly
- Enable easy publishing of technical/blog content
- Increase contact conversion
- Improve technical quality (SEO, speed, accessibility)

## 4. Success Metrics
- Time to Interactive reduction vs old site
- Lighthouse improvements (Perf/SEO/Accessibility)
- Increase in contact form submissions
- Blog publishing consistency (at least 2 posts/month)

## 5. Target Users
1. Recruiters/Hiring Managers
2. Potential freelance clients
3. Developers/peers reading technical content

## 6. User Stories
- As a recruiter, I can quickly understand skills, experience, and projects.
- As a client, I can view proof of work and contact Pranav easily.
- As a reader, I can browse blog posts by topic and read full articles.
- As site owner, I can update content and publish posts with low effort.

## 7. Functional Requirements

### 7.1 Home
- Hero with clear value proposition
- Skills, experience, projects, testimonials, and CTA
- Navigation anchors/sections

### 7.2 Projects
- Featured projects cards with:
  - title, summary, stack, role, outcomes, links

### 7.3 Blog
- Blog listing with cards (title/excerpt/category/date/read-time)
- Individual blog page with rich content
- Tag/category display

### 7.4 Contact
- Contact form with validation
- Alternative direct links (email, LinkedIn, GitHub)

### 7.5 SEO
- Meta title/description per route
- OpenGraph + Twitter cards
- Sitemap + robots
- Canonical URLs

## 8. Non-Functional Requirements
- Responsive across mobile/tablet/desktop
- WCAG-minded semantics and contrast
- Optimized assets and lazy-loading
- Stable deployment with rollback support

## 9. Content Requirements
- Updated personal intro and bio
- 6 initial blog posts
- 4–8 featured projects with measurable outcomes
- 3–5 testimonials
- Certifications and education details

## 10. Dependencies
- Finalized copy/content from Pranav
- Project links and screenshots
- Resume PDF and social links

## 11. Release Plan
- Phase 1: MVP launch
- Phase 2: CMS integration + analytics dashboard + newsletter

## 12. Open Questions
- Blog source: MDX or headless CMS?
- Contact flow: email service vs server route?
- Domain strategy and redirect from old site?
