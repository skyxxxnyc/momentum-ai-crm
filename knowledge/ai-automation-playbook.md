# AiAu PLAYBOOK

Status: Draft

<aside>
📚

This is now a wiki home. Use the sections below and the table of contents to navigate. Edit inline as needed; major changes should be logged in the Change Log.

</aside>

### How to use this wiki

- Start with the Overview and Table of Contents
- Use the Quality Checklist before publishing anything
- Keep page titles concise and in sentence case
- Link related pages at the bottom of each section
- Log notable edits in Change Log

### Quick navigation

- [Overview](#overview)
- [Brand system](#brand-philosophy)
- [Markets and ICP](#primary-target-markets)
- [Messaging](#brand-voice-amp-messaging)
- [Implementation](#implementation-guidelines)
- [Collateral and pages](#use-cases-amp-applications)
- [Proof points](#proof-points)
- [Next steps](#next-steps)
- [Change Log](#change-log)

### Overview

This page serves as the canonical wiki for the AIgency Automata playbook. It consolidates brand, ICP, messaging, implementation patterns, pricing, and sales collateral into one navigable reference. Keep structure stable; iterate inside sections.

### Metadata

- Owner: @Schuyler Whetstone
- Last updated: November 12, 2025
- Status: Draft

### Pages Index

Shortlist of related docs and collateral. Add rows as you create pages.

[Pages Index](AiAu%20PLAYBOOK/Pages%20Index%206659dbee85834cb09d218f8978987bbb.csv)

- Suggested columns: Title, Type, Audience, Status, Owner, Link
- Create saved views later if needed (e.g., Sales, Ops, Web)

---

## Brand Philosophy

AIgency Automata employs a **brutalist design philosophy** that reflects the company's "Brutally Honest Technologist" positioning:

Design Principles

1. **Raw Functionality**: Design stripped to essentials—no decorative elements
2. **Bold Contrast**: Stark black/white with aggressive accent colors for maximum impact
3. **Unapologetic Typography**: Heavy weights, tight tracking, ALL CAPS headlines
4. **Anti-Fluff Ethos**: No gradients, no rounded corners, no softness, no BS

### Brand Positioning

- **Tagline**: "Stop Doing Robot Work"
- **Voice**: Brutally Honest Technologist—direct, technical, anti-marketing speak
- **Value Prop**: Enterprise AI capabilities. Startup agility. No in-house team required.
- **Target**: Mid-sized businesses, solopreneurs, consultants avoiding AI implementation paralysis

---

## Color System

### Primary Palette

**Black** — `#000000` (RGB: 0, 0, 0)

- **Usage**: Primary backgrounds, bold text, maximum contrast elements
- **Associations**: Authority, clarity, no-nonsense approach
- **Applications**: Main backgrounds, primary text, heavy borders

**White** — `#FFFFFF` (RGB: 255, 255, 255)

- **Usage**: Light backgrounds, text on dark, clean negative space
- **Associations**: Clarity, simplicity, breathing room
- **Applications**: Light mode backgrounds, inverse text, spacing

**Lime Green (Acid Green)** — `#CCFF00` (RGB: 204, 255, 0)

- **Usage**: PRIMARY brand accent—CTAs, key highlights, brand marks
- **Associations**: Energy, technology, disruption, visibility
- **Applications**: Buttons, accents, logo, headlines, links, active states

### Secondary Accents

**Orange** — `#FF6B00` (RGB: 255, 107, 0)

- **Usage**: Secondary emphasis, urgency indicators, energy markers
- **Associations**: Action, warmth, urgency
- **Applications**: Secondary CTAs, alerts, highlights, hover states

**Dark Gray** — `#1A1A1A` (RGB: 26, 26, 26)

- **Usage**: Subtle backgrounds when pure black is too harsh
- **Applications**: Card backgrounds, subtle sections

**Light Gray** — `#F3F3F3` (RGB: 243, 243, 243)

- **Usage**: Subtle backgrounds when pure white is too stark
- **Applications**: Alternate row colors, subtle dividers

### Color Usage Rules

✅ **DO:**

- Use lime green (`#CCFF00`) for ALL primary CTAs and brand elements
- Maintain stark black/white contrast for maximum readability
- Use orange (`#FF6B00`) sparingly for secondary emphasis
- Ensure WCAG AAA contrast ratios (7:1 for normal text, 4.5:1 for large text)

❌ **DON'T:**

- Use gradients (hard edges only)
- Add soft shadows or blurs
- Use mid-tone grays as primary colors (only as subtle accents)
- Apply rounded corners or soft shapes

### Accessibility Standards

- Black text on white: ✅ 21:1 ratio (AAA)
- White text on black: ✅ 21:1 ratio (AAA)
- Lime green on black: ✅ 14.8:1 ratio (AAA)
- Lime green on white: ⚠️ 1.4:1 ratio (Use black text instead)

---

## Typography System

### Font Hierarchy

**Display Headlines (32pt+)** — Space Grotesk Bold

- **Weight**: 700-900
- **Case**: ALL CAPS for maximum impact
- **Letter-spacing**: -0.02em to 0 (tight tracking)
- **Line-height**: 1.1-1.2
- **Usage**: Hero headlines, section titles, key statements
- **Example**: "STOP DOING ROBOT WORK"

**Subheadings (18-32pt)** — Inter Bold

- **Weight**: 600-700
- **Case**: Title Case or ALL CAPS (context-dependent)
- **Letter-spacing**: 0 to 0.02em
- **Line-height**: 1.2-1.4
- **Usage**: Section headers, callouts, emphasized text
- **Example**: "Enterprise AI Without Enterprise Overhead"

**Body Text** — Inter Regular

- **Weight**: 400
- **Case**: Sentence case
- **Letter-spacing**: 0
- **Line-height**: 1.5-1.6
- **Usage**: Paragraphs, descriptions, longer content
- **Example**: "We audit workflows, build custom AI agents..."

**Technical/Monospace** — Space Mono

- **Weight**: 400 (Regular), 700 (Bold)
- **Case**: Variable
- **Letter-spacing**: 0
- **Line-height**: 1.4-1.5
- **Usage**: Pricing, data, code snippets, technical specs
- **Example**: "$4,500 — Workflow Audit", "10+ hours/week saved"

### Font Stack (with Fallbacks)

```css
/* Display Headlines */
font-family: 'Space Grotesk', 'Arial Black', 'Helvetica Bold', sans-serif;
font-weight: 700-900;

/* Subheadings */
font-family: 'Inter', 'Arial', 'Helvetica', sans-serif;
font-weight: 600-700;

/* Body Text */
font-family: 'Inter', 'Arial', 'Helvetica', sans-serif;
font-weight: 400;

/* Monospace/Technical */
font-family: 'Space Mono', 'Courier New', 'Consolas', monospace;
font-weight: 400-700;

```

### Typography Rules

✅ **DO:**

- Use Space Grotesk Bold for ALL major headlines
- Apply ALL CAPS to headlines 32pt+ for maximum impact
- Use Inter for readable body copy
- Apply Space Mono to pricing, stats, technical data
- Maintain tight tracking (-0.02em to 0) on headlines

❌ **DON'T:**

- Use serif fonts (except for ironic/contrast purposes)
- Apply script or decorative fonts
- Use light font weights (<400) except in large sizes
- Mix more than 3 font families in a single design
- Use rounded or soft typefaces

### Font Sizing Scale

```
Display: 48pt, 56pt, 64pt, 72pt+
H1: 40pt, 48pt
H2: 32pt, 36pt
H3: 24pt, 28pt
H4: 20pt
Body: 16pt, 18pt
Small: 14pt
Tiny: 12pt

```

---

## Visual Elements & Design Patterns

### Borders & Frames

**Standard Border**

```css
border: 4px solid #000000; /* Minimum thickness */
border-radius: 0; /* Always square corners */

```

**Brand Accent Border**

```css
border: 8px solid #CCFF00; /* Logo, key elements */
border-radius: 0;

```

**Heavy Emphasis Border**

```css
border: 6px solid #000000; /* Section dividers, cards */
border-radius: 0;

```

**Rules:**

- Minimum border: 4px
- Standard border: 6px
- Heavy/brand border: 8px
- Always solid (no dashed, dotted, or gradient borders)
- Always 0 border-radius (hard corners only)

### Shapes & Containers

**Rectangle Blocks**

- All shapes are hard rectangles (border-radius: 0)
- No rounded corners, pills, or circles (except logo which is square)
- Clean, orthogonal layouts only

**Spacing**

- Generous white space between major sections (60-120px)
- Tight clustering within content blocks
- Padding: 16px, 24px, 32px, 48px (multiples of 8px)
- Margins: 24px, 48px, 64px, 96px (multiples of 8px)

### Buttons & CTAs

**Primary Button**

```css
background: #CCFF00;
color: #000000;
border: 4px solid #000000;
padding: 16px 32px;
font-family: 'Space Grotesk', sans-serif;
font-weight: 700;
font-size: 18px;
text-transform: uppercase;
letter-spacing: 0.05em;
border-radius: 0;

```

**Hover State:**

```css
background: #000000;
color: #CCFF00;
border: 4px solid #CCFF00;

```

**Secondary Button**

```css
background: #FFFFFF;
color: #000000;
border: 4px solid #000000;
/* Same other styles */

```

**Hover State:**

```css
background: #FF6B00;
color: #FFFFFF;
border: 4px solid #000000;

```

### Shadows & Depth

❌ **Avoid soft shadows** — No blur, no drop shadows, no gradients

✅ **Use stark offset shadows when needed:**

```css
box-shadow: 8px 8px 0px #000000; /* Solid offset */

```

Or simply use heavy borders and no shadows at all (preferred).

### Dividers & Rules

**Section Divider**

```css
height: 4px;
background: #CCFF00;
width: 100%;
margin: 48px 0;

```

**Subtle Divider**

```css
height: 2px;
background: #1A1A1A;
width: 100%;
margin: 24px 0;

```

---

## Logo System

### Primary Logo (Periodic Table Style)

**Structure:**

```
┌─────────────┐
│  92         │  ← Number (top-left)
│             │
│  AI         │  ← Element symbol (larger, bottom)
└─────────────┘

```

**Specifications:**

- Format: Square (1:1 ratio)
- Border: 8px solid lime green (`#CCFF00`)
- Background: Black (`#000000`)
- Number "92": Smaller, positioned top-left
- Letters "AI": Larger, bold, positioned bottom
- Colors: Lime green text on black background

**Size Variations:**

- Small: 48x48px (minimum)
- Medium: 80x80px
- Large: 112x112px

**Clear Space:**

- Minimum 16px on all sides
- Never place within 16px of other elements

**Incorrect Usage (Don't):**

- ❌ Don't stretch or distort
- ❌ Don't change colors (except approved inversions)
- ❌ Don't add effects, shadows, or gradients
- ❌ Don't rotate or skew
- ❌ Don't place on busy backgrounds without clear space

### Logo Code Example (CSS/HTML)

```html
<div style="
  width: 80px;
  height: 80px;
  border: 8px solid #CCFF00;
  background: #000000;
  padding: 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
">
  <div style="
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 900;
    font-size: 14px;
    color: #CCFF00;
    line-height: 1;
  ">92</div>
  <div style="
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 900;
    font-size: 36px;
    color: #CCFF00;
    line-height: 1;
  ">AI</div>
</div>

```

---

## Brand Voice & Messaging

### Voice Characteristics

**Brutally Honest Technologist**

- Direct, no marketing fluff
- Technical but accessible
- Confident without arrogance
- ROI-focused, quantifiable
- Cuts through industry BS

### Messaging Pillars

1. **Stop Doing Robot Work** (Core Message)
    - Eliminate repetitive tasks
    - Free humans for valuable work
    - Automation that actually works
2. **Enterprise AI Without Enterprise Overhead**
    - No in-house team required
    - Startup agility, enterprise capability
    - See ROI in weeks, not quarters
3. **We Ship, Not Just Strategize**
    - Working automations, not PowerPoints
    - Implementation, not consultation theater
    - Real results, not roadmaps

### Tone Guidelines

✅ **Use:**

- "We build it. You use it."
- "Real automation. Not ChatGPT wrappers."
- "See ROI in 4-6 weeks."
- "Stop wasting time on robot work."

❌ **Avoid:**

- "Synergistic solutions for digital transformation"
- "Leveraging cutting-edge paradigms"
- "Best-in-class enterprise ecosystem"
- Buzzwords, jargon, corporate speak

### Example Copy (Good)

**Headline:** "STOP DOING ROBOT WORK"
**Subhead:** "Automate the repetition. Amplify the human."
**Body:** "You're a coach. A consultant. A creator. Not a data entry clerk. We audit your workflow, build custom AI agents, and integrate with your stack—so you scale faster without hiring an in-house team."
**CTA:** "AUDIT MY WORKFLOW →"

---

## Implementation Guidelines

### For React/JSX Artifacts

```jsx
// Color constants
const BRAND_COLORS = {
  black: '#000000',
  white: '#FFFFFF',
  lime: '#CCFF00',
  orange: '#FF6B00',
  darkGray: '#1A1A1A',
  lightGray: '#F3F3F3'
};

// Typography classes (Tailwind)
const BRAND_TYPE = {
  display: 'font-black text-6xl uppercase tracking-tight',
  h1: 'font-black text-5xl uppercase',
  h2: 'font-bold text-3xl',
  body: 'font-normal text-base',
  mono: 'font-mono'
};

// Example branded button
<button className="
  bg-lime-400
  text-black
  border-4
  border-black
  px-8
  py-4
  font-black
  uppercase
  tracking-wider
  hover:bg-black
  hover:text-lime-400
  transition-all
">
  BOOK YOUR AUDIT
</button>

```

### For HTML/CSS

```html
<!-- Brand stylesheet -->
<style>
  :root {
    --brand-black: #000000;
    --brand-white: #FFFFFF;
    --brand-lime: #CCFF00;
    --brand-orange: #FF6B00;
  }

  .brand-headline {
    font-family: 'Space Grotesk', 'Arial Black', sans-serif;
    font-weight: 900;
    font-size: 64px;
    text-transform: uppercase;
    letter-spacing: -0.02em;
    line-height: 1.1;
    color: var(--brand-black);
  }

  .brand-button {
    background: var(--brand-lime);
    color: var(--brand-black);
    border: 4px solid var(--brand-black);
    padding: 16px 32px;
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 700;
    font-size: 18px;
    text-transform: uppercase;
    border-radius: 0;
    cursor: pointer;
    transition: all 0.2s;
  }

  .brand-button:hover {
    background: var(--brand-black);
    color: var(--brand-lime);
    border-color: var(--brand-lime);
  }
</style>

```

### For PowerPoint/Documents

**Title Slide:**

- Background: Black (`#000000`)
- Title: Space Grotesk Bold, 72pt, ALL CAPS, Lime Green (`#CCFF00`)
- Subtitle: Inter Bold, 24pt, White (`#FFFFFF`)
- Logo: Top-right corner with 32px clear space

**Content Slides:**

- Background: White (`#FFFFFF`)
- Headers: Space Grotesk Bold, 40pt, Black (`#000000`)
- Body: Inter Regular, 18pt, Black (`#000000`)
- Accents: Lime Green borders (8px) around key elements

---

## Use Cases & Applications

### When to Apply This Skill

✅ **Always apply for:**

- Website design and landing pages
- Social media graphics (headers, posts)
- Presentation decks
- Marketing materials (one-pagers, brochures)
- Email templates
- Proposal documents
- Brand assets

✅ **Selectively apply for:**

- Client-facing reports (use if brand reinforcement needed)
- Internal documents (use lighter touch)
- Technical documentation (focus on typography and spacing)

❌ **Don't force for:**

- Client work that requires their brand (obviously)
- Technical diagrams where clarity > brand
- Draft/internal working documents

### Example Applications

**1. Landing Page Hero Section**

```jsx
<section className="min-h-screen bg-black text-white flex items-center px-16">
  <div>
    <h1 className="text-9xl font-black leading-none mb-8">
      STOP<br/>
      DOING<br/>
      ROBOT<br/>
      <span className="text-lime-400">WORK</span>
    </h1>
    <p className="text-2xl font-bold mb-12 border-l-8 border-lime-400 pl-6">
      You're a coach. A consultant. A creator.<br/>
      Not a data entry clerk.
    </p>
    <button className="bg-lime-400 text-black px-12 py-6 text-xl font-black border-4 border-white">
      AUDIT MY WORKFLOW →
    </button>
  </div>
</section>

```

**2. Social Media Header (Twitter/X)**

- Background: Black
- Logo: Left side (112x112px with lime border)
- Text: "AIgency AUTOMATA" in Space Grotesk Bold, split color (white + lime)
- Tagline: "STOP DOING ROBOT WORK" in white, right-aligned

**3. Presentation Title Slide**

- Full black background
- Centered logo (large, 160x160px)
- Title below logo: 72pt, lime green, ALL CAPS
- Subtitle: 24pt, white, Inter Bold
- Footer: Email in Space Mono, small, gray

---

## Quality Checklist

Before finalizing any branded design, verify:

### Color

- [ ]  Using only approved colors (Black, White, Lime, Orange, Grays)
- [ ]  No gradients or soft color transitions
- [ ]  Lime green used for primary CTAs/accents
- [ ]  High contrast maintained (WCAG AAA where possible)

### Typography

- [ ]  Space Grotesk for display headlines (32pt+)
- [ ]  Inter for subheadings and body text
- [ ]  Space Mono for technical/data elements
- [ ]  ALL CAPS applied to major headlines
- [ ]  No serif fonts (unless intentional contrast)

### Visual Elements

- [ ]  All shapes have hard corners (border-radius: 0)
- [ ]  Borders are 4px minimum, solid style
- [ ]  No soft shadows (only stark offsets if any)
- [ ]  Spacing follows 8px grid system
- [ ]  Logo has 16px minimum clear space

### Brand Voice

- [ ]  Copy is direct and anti-fluff
- [ ]  No corporate jargon or buzzwords
- [ ]  ROI/results focused where applicable
- [ ]  Tone is confident but not arrogant
- [ ]  "Stop Doing Robot Work" theme present

---

## Resources & Assets

### Font Downloads

- **Space Grotesk**: [Google Fonts](https://fonts.google.com/specimen/Space+Grotesk)
- **Inter**: [Google Fonts](https://fonts.google.com/specimen/Inter)
- **Space Mono**: [Google Fonts](https://fonts.google.com/specimen/Space+Mono)

### Brand Assets Location

- Notion: See "Brand Assets" pages in AIgencyAutomata workspace
- Project files: `/mnt/project/` directory includes social headers and landing page examples

### Contact for Brand Questions

- **Email**: [schuyler@aigencyautomata.com](mailto:schuyler@aigencyautomata.com)
- **Use case**: When brand guidelines don't cover a specific application

---

## Version History

**v1.0.0** (2025-11-08)

- Initial comprehensive brand guidelines skill
- Brutalist design system established
- Color, typography, and visual element standards defined
- Implementation examples provided

---

## License

© 2025 AIgency Automata. All rights reserved.
These brand guidelines are proprietary and confidential. Do not distribute without authorization.

## Primary Target Markets

**Business Types:**

- Coaches & Consultants
- Solopreneurs
- Small-to-Medium Businesses (SMBs)

**Priority Industries (7 verticals):**

1. Real Estate
2. Healthcare
3. Home Services
4. Non-technical Consultants
5. Law Firms
6. E-commerce
7. Accounting/Bookkeeping

## Key Personas

**1. CEOs/Founders**

- **Pain**: Innovation pressure + budget scrutiny
- **Context**: Burned by past tech failures (failed ERPs, digital transformation theater, shelfware)
- **Need**: ROI-focused automation without hiring expensive in-house teams

**2. Directors of Operations**

- **Pain**: Capacity constraints, bottlenecks
- **Need**: Remove friction, multiply team capacity without headcount

**3. Business Owners**

- **Pain**: Burnout from manual processes
- **Need**: Run a bigger business without living in it

## ICP Characteristics

**Psychographic:**

- Feeling AI implementation paralysis (want to use AI but don't know how)
- Skeptical from past technology disappointments
- Need proof/ROI before investing
- Don't want (or can't afford) in-house AI teams
- Value directness over corporate jargon

**Business Stage:**

- Established enough to have workflow pain points
- Growing but hitting capacity limits
- Revenue sufficient to invest $12K-$120K in automation

**Digital Maturity:**

- Often have poor digital presence (your SDR system targets these gaps)
- Manual processes eating significant time
- Repetitive work preventing scale

### Anti-ICP (Who You're NOT For)

- Large enterprises with existing AI teams
- Brand-new startups with no established workflows
- Businesses wanting strategy docs instead of implementation
- People looking for ChatGPT wrappers or generic solutions

Your positioning ("Enterprise AI capabilities. Startup agility. No in-house team required.") directly addresses the ICP's core tension: wanting enterprise-grade automation without enterprise-grade costs or complexity.

### For SMB Owners

- Headline: Reimagine growth with custom AI agents
- Problem: Endless busywork and flat growth. Off-the-shelf AI is pricey and not built for your business.
- Solution: Deploy AI agents tailored to your workflows. Automate ops and personalize outreach to win back time and revenue.
- Benefits:
    - Streamlined operations and fewer manual tasks
    - More qualified leads and faster conversions
    - Smarter decisions with data-driven automations
    - Proof point: 32% less admin time in 6 weeks (pilot cohort)
- CTA: Discover your AI advantage — start now

### For Directors of Sales

- Headline: Supercharge pipeline with custom AI agents
- Problem: Scaling personalized outreach is hard. Standard tools can’t match your motion.
- Solution: Purpose-built agents for cold outreach and deal flow. Deliver relevant messages, automate follow-ups, and move deals faster.
- Benefits:
    - Higher sales efficiency and pipeline growth
    - Personalization at scale
    - Better conversion with targeted automation
    - Proof point: 2.1x reply rate on targeted sequences
- CTA: Take your sales to the next level — get started

### For Directors of Operations

- Headline: Cut inefficiencies with tailored AI for your ops
- Problem: Manual processes drain capacity. Generic tools miss your real bottlenecks.
- Solution: Integrate AI agents around your goals. Automate repeatables, sync teams, and surface real-time insights.
- Benefits:
    - Fewer manual errors and lower costs
    - Real-time workflow visibility and optimization
    - Teams freed up for strategic work
    - Proof point: 28% cycle time reduction across 3 workflows
- CTA: Optimize operations with custom AI — let’s build your solution

## Elevator pitch

We automate the repetitive work that slows teams down. Instead of hiring an in‑house AI team, you get enterprise‑grade automation built around your actual workflows—audited, integrated with your stack, and adopted by your team. Most clients see ROI in weeks, not quarters.

- **1‑liner:** Enterprise AI without enterprise headcount.
- **20 words:** We audit workflows, build custom AI agents, integrate your stack, and train your team—so you scale faster and see ROI in weeks.
- **50 words:** AIgency Automata designs and ships automation that fits how you already work. We audit, build custom AI agents, integrate with your tools, and train your team for real adoption. You get enterprise‑grade capability without hiring expensive in‑house teams—and you see measurable ROI in 4–6 weeks.

---

### The problem

Leaders feel pressure to “use AI” but face bad options:

- Expensive hires with long ramps
- Off‑the‑shelf tools that don’t fit
- Strategy decks with no implementation
- DIY efforts that derail core work

Result: innovation pressure + budget scrutiny + risk aversion = paralysis

---

### Our solution

**Enterprise AI capabilities. Startup agility. No in‑house team required.** We’re the builders who ship working automations.

**What we do:**

1. Workflow audit and strategy
2. Custom AI agent development
3. Integration and implementation
4. Training and support for adoption
5. Web development that supports automated workflows

---

### Who we serve

- Mid‑sized businesses that don’t want an in‑house AI team
- Startups building scalable processes from day one
- Traditional businesses modernizing operations
- Forward‑thinking enterprises protecting competitive advantage

**Key personas:**

- CEOs: Turn operating costs into advantage
- Directors of Operations: Remove bottlenecks, multiply capacity
- Business Owners: Run a bigger business without living in it

---

### How it works

**01 // Audit**

60‑minute deep dive + 2‑week analysis

→ Roadmap with quantified ROI

**02 // Build**

Custom agents that fit your process

→ Real automation, not templates

**03 // Integrate**

Connect your existing stack

→ Works with your tools, not against them

**04 // Train & optimize**

Team adoption + continuous refinement

→ Automations that actually get used

Timeline: See results in 4–6 weeks, not 4–6 months

---

### Pricing

**Phase 1: Discovery (low risk)**

- $4,500 — Workflow Audit + Blueprint
- 100% credited to implementation
- You own the roadmap even if you walk

**Phase 2: Implementation (choose your path)**

- Quick Win: $12K–$25K
    
    → 1–2 high‑impact automations, 30‑day guarantee, ROI in 4–6 weeks
    
- Full Transformation: $45K–$120K
    
    → 5–10 custom agents, complete workflow overhaul, 90‑day optimization
    
- Retainer: $8K–$20K/month
    
    → Ongoing development and continuous optimization, 6‑month minimum
    

**Phase 3: Scale (optional)**

- $2,500–$5,000/month — Monthly optimization
    
    → Keep automations current and expand use cases
    

---

### Proof points

- **15 hrs/week saved — Executive Coach**
    
    “Went from drowning in admin to actually coaching. Got my weekends back.”
    
- **3× faster proposals — Marketing Consultant**
    
    “Days to hours. Close rate up because I respond while leads are hot.”
    
- **200% ROI in month 1 — Fractional CFO**
    
    “Best investment. I take on more clients without hiring.”
    

---

### Tech stack

Anthropic • OpenAI • Google • Zapier • Make • Lindy • n8n • Supabase • Notion • Airtable • Perplexity • Lovable • Bolt • Replit • Webflow

// The right tool for the job. Every time.

---

### Why AIgency Automata

- We’ve automated our own agency
- Custom solutions, not cookie‑cutter templates
- Real implementation, not just strategy docs
- Humans who code, not salespeople
- Clear pricing. No scope creep. No surprises.

**Differentiation:** We don’t hand you a roadmap—we ship working automations.

---

### Next steps

<aside>
⚡

<strong>Book a free workflow audit</strong> — 60‑minute deep dive to find where you’re losing hours. No pitch. Just insights.

</aside>

<aside>
✅

<strong>Get your custom blueprint</strong> — Clear scope, real timeline, honest budget.

</aside>

<aside>
🚀

<strong>Start automating</strong> — From audit to working automation in 4–6 weeks. Prove ROI, then scale what works.

</aside>

---

### Contact

**Schuyler Whetstone, Founder**

📧 [schuyler@aigencyautomata.com](mailto:schuyler@aigencyautomata.com)

🌐 [aigencyautomata.com](http://aigencyautomata.com)

---

**Tagline**

**Stop Doing Robot Work**

*Automation that actually works. For businesses that actually matter.*

- © 2025 AIgency Automata // Enterprise AI Without Enterprise Overhead

---

### Change Log

Track notable edits to this wiki. Use one row per change.

[Change Log](AiAu%20PLAYBOOK/Change%20Log%20bf52a331688e4f16b416d7cd8ca1d18b.csv)

- Suggested columns: Date, Change Summary, Section, Author, Link
- First entry (suggested): 2025-11-12 — Converted page into wiki home, added Pages Index and nav — Author: Schuyler — Link: this page

## CEO

**Core Message:** Transform operational costs into competitive advantage

**Key Props:**

- **"Your competitors are hiring AI teams. You're getting better results without the headcount."** - Access enterprise-grade AI capabilities at a fraction of in-house costs
- **"See the ROI before you scale."** - Start with audits that quantify exactly where automation delivers returns, then expand what works
- **"Strategic advantage, not just efficiency."** - Custom AI agents that execute your unique processes faster than competitors can copy them
- **"Board-ready transformation without the risk."** - Phased implementation with clear metrics, not a gamble on untested technology

**Pain Point Addressed:** Pressure to innovate + budget scrutiny + risk aversion

---

## Director of Operations

**Core Message:** Eliminate bottlenecks, multiply capacity without multiplying headcount

**Key Props:**

- **"We find the 20% of tasks eating 80% of your team's time—then automate them."** - Data-driven workflow audits that identify high-impact automation opportunities
- **"Your processes, optimized. Not replaced."** - Custom integrations that work with your existing stack, not against it
- **"Scale delivery without scaling chaos."** - Repeatable, automated workflows that maintain quality as volume increases
- **"Your team focuses on exceptions, not repetition."** - AI handles the predictable work; humans handle what actually needs judgment

**Pain Point Addressed:** Team capacity constraints + process inefficiencies + implementation burden

---

## Business Owner

**Core Message:** Run a bigger business without living in it

**Key Props:**

- **"Get your weekends back. Keep your margins."** - Automation that handles growth without proportional cost increases
- **"Start with what's bleeding time today. Scale to what's possible tomorrow."** - Flexible engagement from quick-win audits to full transformation
- **"Your business runs whether you're in it or not."** - Systems that execute consistently without constant oversight
- **"Modern capabilities without modern complexity."** - We handle the technical heavy lifting; you get simple, working solutions with training your team actually uses

**Pain Point Addressed:** Owner burnout + growth limitations + technical overwhelm + talent constraints

---

## Positioning Angle Across All Three:

**"Enterprise AI capabilities. Startup agility. No in-house team required."**