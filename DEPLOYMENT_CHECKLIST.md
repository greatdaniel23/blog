# Hotel Blog Deployment Checklist
## From Local Development to Cloudflare Production

Complete step-by-step guide using MCP tools: **astro-docs**, **banana**, **stitch**, **jules**

---

## Phase 1: Project Setup

### 1.1 Initialize Astro Project
- [ ] Create Astro blog project
  ```bash
  npm create astro@latest . -- --template blog --yes
  ```
- [ ] Install dependencies
  ```bash
  npm install
  ```

### 1.2 Configure MCP Tools
- [ ] Verify MCP config at `~/.gemini/antigravity/mcp_config.json`
- [ ] Test each MCP server connection:
  - [ ] **astro-docs**: Search Astro documentation
  - [ ] **banana**: Image generation
  - [ ] **stitch**: UI/UX design (requires quota project)
  - [ ] **jules**: Code generation workers

---

## Phase 2: Content Creation

### 2.1 Blog Posts (Markdown)
Use **astro-docs** to verify content collection format:
- [ ] Create `src/content/blog/` directory
- [ ] Add frontmatter schema:
  ```yaml
  ---
  title: "Post Title"
  description: "Description"
  pubDate: "2026-02-01"
  heroImage: "/images/hero.jpg"
  author: "Author Name"
  tags: ["tag1", "tag2"]
  ---
  ```
- [ ] Write blog posts:
  - [ ] `welcome-to-hotel-blog.md`
  - [ ] `luxury-suites-guide.md`
  - [ ] `local-attractions.md`
  - [ ] `seasonal-spa-rituals.md`
  - [ ] `chefs-table-experience.md`

### 2.2 Generate Images
Use **banana** MCP for hero images:
- [ ] Create `public/images/` directory
- [ ] Generate images for each post:
  ```
  mcp_banana_generate_image(
    prompt: "Luxury hotel lobby...",
    output_path: "/path/to/public/images/hotel-lobby.jpg",
    aspect_ratio: "16:9"
  )
  ```
- [ ] Generated images:
  - [ ] `hotel-lobby.jpg`
  - [ ] `luxury-suite.jpg`
  - [ ] `local-attractions.jpg`
  - [ ] `spa-ritual.jpg`
  - [ ] `chefs-table.jpg`

---

## Phase 3: UI/UX Design

### 3.1 Stitch UI Design
Use **stitch** MCP (requires Google Cloud quota project):
- [ ] Create Stitch project
  ```
  mcp_stitch_create_project(title: "Grand Hotel Blog")
  ```
- [ ] Generate screens:
  - [ ] Homepage
  - [ ] Blog listing page
  - [ ] Single post page
  - [ ] Contact page
- [ ] Export designs to Astro components

### 3.2 Manual Alternative (if Stitch unavailable)
- [ ] Create layout components in `src/layouts/`
- [ ] Create UI components in `src/components/`
- [ ] Apply hotel theme (navy, gold, cream colors)

---

## Phase 4: Database Setup

### 4.1 Cloudflare D1 Database
- [ ] Login to Cloudflare
  ```bash
  npx wrangler login
  ```
- [ ] Create D1 database
  ```bash
  npx wrangler d1 create blogdatabase
  ```
- [ ] Note the database ID for `wrangler.toml`

### 4.2 Database Schema
- [ ] Create `schema.sql` with tables:
  - [ ] `posts` - Blog posts
  - [ ] `categories` - Post categories
  - [ ] `tags` - Post tags
  - [ ] `subscribers` - Newsletter
  - [ ] `comments` - Post comments
  - [ ] `contact_submissions` - Contact form
- [ ] Apply schema:
  ```bash
  npx wrangler d1 execute blogdatabase --file=./schema.sql
  ```

### 4.3 API Endpoints
Use **astro-docs** for endpoint patterns:
- [ ] Create `src/pages/api/` directory
- [ ] Implement endpoints:
  - [ ] `GET/POST /api/posts` - List/create posts
  - [ ] `GET/PUT/DELETE /api/posts/[id]` - Single post CRUD
  - [ ] `POST /api/subscribe` - Newsletter signup
  - [ ] `POST /api/contact` - Contact form

---

## Phase 4.5: Admin Dashboard

### 4.5.1 Admin Pages
- [ ] Create `src/layouts/AdminLayout.astro`
- [ ] Create admin pages:
  - [ ] `/admin/` - Dashboard with stats
  - [ ] `/admin/posts` - Posts list
  - [ ] `/admin/posts/new` - Create new post
  - [ ] `/admin/posts/edit/[id]` - Edit existing post

### 4.5.2 Database Tables for Admin
- [ ] `admin_users` - Admin accounts (email, password_hash, name, role)
- [ ] `sessions` - Auth sessions (id, user_id, expires_at)

### 4.5.3 Admin Features
- [ ] Post CRUD (Create, Read, Update, Delete)
- [ ] Draft/Publish status toggle
- [ ] View count tracking
- [ ] Categories and tags management
- [ ] Newsletter subscribers list
- [ ] Contact form submissions

---

## Phase 5: Cloudflare Integration

### 5.1 Install Cloudflare Adapter
- [ ] Install adapter
  ```bash
  npm install @astrojs/cloudflare
  ```
- [ ] Update `astro.config.mjs`:
  ```javascript
  import cloudflare from '@astrojs/cloudflare';
  export default defineConfig({
    adapter: cloudflare(),
  });
  ```

### 5.2 Wrangler Configuration
- [ ] Create `wrangler.toml`:
  ```toml
  name = "blogtemplate"
  compatibility_date = "2025-01-01"

  [[d1_databases]]
  binding = "DB"
  database_name = "blogdatabase"
  database_id = "YOUR_DATABASE_ID"
  ```

### 5.3 Create Pages Project
- [ ] Via Cloudflare Dashboard or:
  ```bash
  npx wrangler pages project create blogtemplate
  ```

---

## Phase 6: Code Generation (Optional)

### 6.1 Jules Workers
Use **jules** MCP for code tasks:
- [ ] Generate complex components
  ```
  mcp_jules_jules_generate_code(
    prompt: "Create newsletter component",
    source: "sources/github/owner/repo",
    language: "typescript"
  )
  ```
- [ ] Review and fix code
- [ ] Estimate work complexity

---

## Phase 7: Build & Deploy

### 7.1 Local Testing
- [ ] Build project
  ```bash
  npm run build
  ```
- [ ] Preview locally
  ```bash
  npm run preview
  ```
- [ ] Test all pages and API endpoints

### 7.2 Deploy to Cloudflare
- [ ] Deploy to Pages
  ```bash
  npx wrangler pages deploy ./dist
  ```
- [ ] Verify deployment at `https://blogtemplate.pages.dev`

### 7.3 Custom Domain (Optional)
- [ ] Add custom domain in Cloudflare Dashboard
- [ ] Configure DNS records
- [ ] Enable SSL/TLS

---

## Phase 8: Verification

### 8.1 Functional Tests
- [ ] Homepage loads correctly
- [ ] Blog posts display with images
- [ ] Newsletter form works
- [ ] Contact form submits
- [ ] API endpoints respond

### 8.2 Performance
- [ ] Run Lighthouse audit
- [ ] Check Core Web Vitals
- [ ] Optimize images if needed

---

## Quick Reference: MCP Commands

| MCP | Command | Purpose |
|-----|---------|---------|
| **astro-docs** | `mcp_astro-docs_search_astro_docs` | Search documentation |
| **banana** | `mcp_banana_generate_image` | Generate images |
| **stitch** | `mcp_stitch_create_project` | Create UI project |
| **stitch** | `mcp_stitch_generate_screen_from_text` | Generate UI screens |
| **jules** | `mcp_jules_jules_create_worker` | Create code worker |
| **jules** | `mcp_jules_jules_generate_code` | Generate code |

---

## Files Created

```
blog/
├── astro.config.mjs
├── wrangler.toml
├── schema.sql
├── public/
│   └── images/
│       ├── hotel-lobby.jpg
│       ├── luxury-suite.jpg
│       └── ...
├── src/
│   ├── content/
│   │   └── blog/
│   │       ├── welcome-to-hotel-blog.md
│   │       └── ...
│   └── pages/
│       └── api/
│           ├── posts.ts
│           ├── subscribe.ts
│           └── contact.ts
└── package.json
```

---

**Status:** Ready for deployment ✅
