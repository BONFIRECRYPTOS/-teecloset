# TEE CLOSET — Premium Fashion Website Master Prompt

You are my senior product designer, creative director, UX strategist, frontend engineer, full-stack engineer, QA engineer and code reviewer.

We are going to build a **world-class website for my Kenyan clothing brand, TEE CLOSET**.

This is NOT a basic clothing website and I do NOT want a generic AI-generated template.

I want Tee Closet to become a **flagship portfolio project** that I can use to:

1. Sell Tee Closet products online.
2. Give customers an extremely easy and attractive shopping experience.
3. Build trust around the Tee Closet brand.
4. Showcase our physical shop and new stock.
5. Drive customers to WhatsApp/TikTok/social media.
6. Eventually support online ordering and other commerce features.
7. Use the website itself as a demonstration when selling professional websites to other businesses.

The final product should feel like something designed by a professional fashion-tech agency.

---

## PHASE 0 — INSPECT THE ENVIRONMENT FIRST

Before writing code:

- Inspect the existing project.
- Inspect all available files.
- Determine the current framework, package manager, architecture and dependencies.
- Check what tools, plugins, MCP servers and skills are available.
- Check whether Superpowers, Frontend Design, UI UX Pro Max, Code Review, Context7 and Feature Dev are available.
- Use the appropriate installed skills/plugins instead of manually duplicating their workflows.
- Do NOT install unnecessary dependencies.
- Do NOT overwrite useful existing work without understanding it first.

If an essential plugin/skill is missing, tell me which one is missing and why it would improve the build. If it can safely be installed through the available plugin system, do so or give me the exact installation approach.

---

## PHASE 1 — BRAINSTORM BEFORE CODING

Use the Superpowers brainstorming workflow before implementation.

Think deeply about:

- Tee Closet's target customer.
- Kenyan fashion-shopping behavior.
- Mobile-first shopping.
- TikTok-driven customers.
- WhatsApp-driven purchasing.
- Second-hand/affordable fashion positioning.
- The physical shop experience.
- How to make customers discover products quickly.
- How to make the site feel premium without making it complicated.
- How to make the website visually impressive enough to become my portfolio example.

Do not immediately start coding.

First create a concise product/design strategy covering:

1. Brand positioning
2. Target audience
3. UX strategy
4. Visual direction
5. Information architecture
6. Homepage structure
7. Product discovery strategy
8. Mobile experience
9. Conversion strategy
10. Future scalability

Then create an implementation plan.

---

## PHASE 2 — DESIGN DIRECTION

Create a distinctive fashion identity for TEE CLOSET.

Avoid:

- Generic SaaS design
- Generic AI gradients
- Overused glassmorphism
- Template-looking cards
- Excessive animations
- Clutter
- Poor typography
- Random colors
- Cheap-looking ecommerce layouts

The design should feel:

- Fashion-forward
- Modern
- Youthful
- Kenyan
- Premium
- Clean
- Confident
- Elegant
- Social-media friendly
- Easy to use

Use the UI UX Pro Max skill if available to generate a proper design system.

Create a design system containing:

- Primary colors
- Secondary colors
- Accent color
- Background colors
- Typography hierarchy
- Font pairing
- Spacing system
- Border radius
- Shadows
- Button styles
- Card styles
- Product image treatment
- Navigation system
- Mobile navigation
- Form styling
- Badges
- Notifications
- Empty states
- Loading states
- Error states

The design must be consistent across the entire application.

---

## PHASE 3 — TEE CLOSET HOMEPAGE

Build a visually powerful homepage.

### Hero section

- Large fashion photography/video area.
- Strong Tee Closet branding.
- Short, memorable headline.
- Clear CTA.
- Secondary CTA.
- Smooth but subtle entrance animation.
- Mobile-first composition.
- Product imagery should dominate the visual experience.

Possible brand direction:

> "WEAR YOUR VIBE."

Or create something stronger after understanding the brand.

### Homepage sections

Potential sections:

1. Hero
2. New Stock
3. Shop by Category
4. Trending Now
5. Shop by Size
6. Featured Wide-Legs
7. Blazers
8. Tops
9. Official Pants
10. Chinos
11. Palazzo Pants
12. Why Tee Closet
13. Physical Store section
14. TikTok/social proof section
15. Customer styling inspiration
16. CTA to WhatsApp
17. Footer

Do NOT necessarily use all sections if the UX becomes excessive.

Prioritize quality over quantity.

---

## PHASE 4 — PRODUCT EXPERIENCE

Create a beautiful product browsing experience.

### Product cards should show:

- Product image
- Category
- Size
- Price
- Availability
- New-stock badge where relevant
- Favorite/wishlist action
- Quick view
- WhatsApp/order CTA where appropriate

### Filtering

Support filtering by:

- Category
- Size
- Price
- Color
- Availability
- New stock
- Popularity

### Sorting

Support:

- Newest
- Price low-high
- Price high-low
- Popular

### Product detail page

Include:

- Large product gallery
- Product name
- Price
- Available sizes
- Measurements if available
- Availability status
- Styling suggestion
- "How to wear it"
- WhatsApp CTA
- Share button
- Related products
- Similar items
- Clear return/order information

Because Tee Closet sells fashion where individual pieces can be limited, design the system to handle **one-off or limited-stock products** elegantly.

---

## PHASE 5 — KENYAN CUSTOMER EXPERIENCE

Design the website around how Kenyan customers actually shop.

Prioritize:

- Mobile phones
- WhatsApp
- TikTok
- Instagram
- Simple ordering
- Clear pricing in KSh
- Fast loading
- Low-friction navigation
- Easy location information
- Clear shop directions
- Trust

Include a prominent WhatsApp shopping flow.

Example:

**ORDER ON WHATSAPP**

When clicked, the system should generate a useful WhatsApp message containing:

- Product name
- Product size
- Product price
- Product URL
- Customer's request

Do not make customers create an account just to ask about a product.

---

## PHASE 6 — PHYSICAL SHOP EXPERIENCE

Create a beautiful "Visit Tee Closet" section.

Include:

- Shop location
- Opening hours
- Contact
- Directions
- Landmark information
- CTA for Google Maps if appropriate
- WhatsApp contact
- Shop photos/video area

The website should connect the online experience to the physical Tee Closet store.

---

## PHASE 7 — SOCIAL MEDIA

Tee Closet is heavily driven by social media.

Build a section that makes the website feel connected to TikTok/Instagram.

Possible content:

- "Seen on TikTok"
- "Style it with Tee Closet"
- "New Stock Alert"
- "How would you style this?"

Use social proof and visual storytelling.

Do not embed heavy third-party widgets if they negatively affect performance.

---

## PHASE 8 — ADMIN/CONTENT ARCHITECTURE

Architect the application so that products can eventually be managed without rewriting the frontend.

Separate:

- Product data
- Categories
- Sizes
- Prices
- Images
- Availability
- Featured status
- New stock status

Design the data layer so we can later connect:

- Supabase
- Firebase
- PostgreSQL
- Headless CMS
- Shopify
- Custom admin dashboard

Do not prematurely over-engineer the application.

Use mock/local data initially if no backend has been configured.

---

## PHASE 9 — RESPONSIVE DESIGN

Mobile is the PRIMARY experience.

Test:

- Small Android phones
- Large Android phones
- iPhone-sized screens
- Tablets
- Desktop
- Large desktop

Pay special attention to:

- Touch targets
- Sticky navigation
- Mobile bottom navigation where appropriate
- Image loading
- Product grids
- Horizontal scrolling sections
- WhatsApp CTA
- Typography
- Navigation

The website must look excellent at every breakpoint.

---

## PHASE 10 — PERFORMANCE

Treat performance as a feature.

Implement:

- Image optimization
- Lazy loading
- Responsive images
- Proper caching
- Code splitting where useful
- Minimal JavaScript
- Avoid unnecessary libraries
- Avoid huge dependencies
- Optimize animations
- Avoid layout shifts

Aim for excellent Core Web Vitals.

---

## PHASE 11 — ACCESSIBILITY

Implement professional accessibility standards.

Check:

- Keyboard navigation
- Focus states
- Contrast
- Semantic HTML
- ARIA where necessary
- Image alt text
- Screen-reader usability
- Form labels
- Touch target sizes

---

## PHASE 12 — SEO

Implement professional SEO foundations.

Include:

- Page titles
- Meta descriptions
- Open Graph metadata
- Twitter/X metadata where appropriate
- Structured data where appropriate
- Product schema where appropriate
- Clean URLs
- Sitemap architecture
- Robots configuration
- Canonical URLs
- Semantic headings

Optimize naturally for searches related to:

- Tee Closet Kenya
- wide leg pants Kenya
- women's pants Nairobi
- blazers Kenya
- official pants Kenya
- second hand clothes Kenya
- Other relevant local fashion searches

Do not keyword-stuff.

---

## PHASE 13 — ANIMATIONS

Use animation strategically.

I want:

- Smooth page transitions
- Product hover effects
- Image reveal animations
- Subtle scroll animations
- Elegant menu transitions
- CTA micro-interactions
- Smooth cart/WhatsApp interactions

Avoid:

- Excessive bouncing
- Distracting animations
- Slow page loading
- Animation everywhere

Animations should make the website feel expensive.

---

## PHASE 14 — REAL CONTENT

Do not fill the site with meaningless lorem ipsum.

Use realistic Tee Closet content.

The business sells fashion including:

- Wide-leg pants
- Blazers
- Tops
- Official pants
- Chino pants
- Palazzo pants

Sizes currently include:

**26, 28, 30, 32, 34, 36, 38, 40**

Prices may vary depending on the item, so do not hard-code one universal price.

Use realistic Kenyan English and occasional natural Kenyan youth-oriented marketing language where appropriate.

Keep the brand professional.

---

## PHASE 15 — PORTFOLIO QUALITY

Remember:

**THIS WEBSITE IS ALSO MY SALES DEMO.**

Build subtle features that demonstrate professional web-development capability.

For example:

- Excellent responsive design
- Beautiful product filtering
- Smooth transitions
- Fast loading
- Professional product pages
- WhatsApp commerce
- Social proof
- SEO
- Accessibility
- Reusable components
- Clean architecture
- Good error handling
- Loading skeletons
- Empty states
- 404 page
- Mobile navigation
- Scalable product architecture

The website should make another business owner look at it and think:

> "I want a website like this for my business."

---

## PHASE 16 — DEVELOPMENT WORKFLOW

Use a disciplined engineering workflow.

If Superpowers is available:

1. Brainstorm
2. Write implementation plan
3. Break work into independent tasks
4. Use subagents where appropriate
5. Implement
6. Test
7. Review
8. Refactor
9. Verify
10. Final polish

Use parallel agents when tasks are genuinely independent.

Do NOT use parallel agents when tasks depend on shared state.

For major features, use the Feature Dev workflow if available.

For code review, use Code Review if available.

After meaningful implementation, run:

- Tests
- Lint
- Type checking
- Build
- Browser verification

Use `/simplify` where available to review changed code for quality, duplication, efficiency and CLAUDE.md compliance.

---

## PHASE 17 — BROWSER VERIFICATION

**DO NOT assume the website looks good because the code compiles.**

Use browser/Chrome verification if available.

Actually inspect the rendered website.

Check:

- Homepage
- Navigation
- Mobile menu
- Product cards
- Product details
- Filtering
- WhatsApp CTA
- Buttons
- Forms
- Footer
- Responsive layouts
- Images
- Typography
- Animations
- Overflow problems
- Console errors
- Broken links
- Accessibility issues

If something looks mediocre, **FIX IT.**

Do not stop at "it works."

The goal is:

> **"It looks professionally designed."**

---

## PHASE 18 — QUALITY BAR

Before declaring the project complete, perform a final audit.

Act as five different experts:

### 1. Senior frontend engineer

Check architecture, performance, maintainability and bugs.

### 2. UI/UX designer

Check hierarchy, usability, spacing, typography, consistency and mobile experience.

### 3. Fashion brand creative director

Check whether the website feels premium, fashionable, youthful and visually compelling.

### 4. Kenyan ecommerce customer

Ask whether a customer can quickly find a product, understand the price/size and contact Tee Closet.

### 5. Potential client looking to hire me for a website

Ask whether this project demonstrates enough quality that another business owner would want me to build their website.

Ask:

- Would this website make someone want to shop?
- Would it make someone trust Tee Closet?
- Would it make a business owner want me to build their website?
- Would it look good when shown on TikTok?
- Would a customer understand what to do within 5 seconds?
- Would the mobile experience be excellent?
- Would the website feel custom-made rather than AI-generated?

Fix every important issue you discover.

---

# IMPORTANT RULES

- Do not rush.
- Do not generate a generic template.
- Do not blindly follow my instructions if you identify a better professional solution.
- If a requirement conflicts with good UX, explain the tradeoff and choose the better solution.
- Reuse components intelligently.
- Keep code maintainable.
- Keep the design consistent.
- Avoid unnecessary dependencies.
- Never expose secrets or API keys.
- Never claim something is finished without verifying it.
- Never say "looks good" without actually checking it.
- Prefer real evidence from tests/browser inspection.
- Keep me informed at major milestones, not after every tiny change.

---

# START HERE

Start by inspecting the repository and available Claude Code skills/plugins.

Then use the appropriate brainstorming and planning workflow.

**DO NOT start writing the full application immediately.**

First give me:

1. Current project assessment
2. Available relevant skills/plugins
3. Recommended technology/design architecture
4. Tee Closet design direction
5. Site architecture
6. Implementation plan

After that, proceed with the build using the approved professional workflow.

The final result should be something I can proudly show to customers as:

> **TEE CLOSET — Built as a premium digital fashion experience.**
