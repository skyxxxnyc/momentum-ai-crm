# Momentum AI - Autonomous Revenue Platform

A next-generation, AI-powered CRM system designed to transform traditional sales processes with embedded intelligence and autonomous capabilities. Built for 2026 and beyond.

![Momentum AI CRM](https://img.shields.io/badge/Status-Production%20Ready-brightgreen) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue) ![React](https://img.shields.io/badge/React-19-61dafb) ![tRPC](https://img.shields.io/badge/tRPC-11-2596be)

---

## 🚀 Core Features

### **Comprehensive CRM Foundation**
- **Full CRUD Operations** for Contacts, Companies, Deals, Leads, ICPs, Tasks, Goals, Activities, and Articles
- **Visual Pipeline Management** with drag-and-drop Kanban board
- **Customizable Dashboard** with real-time KPI cards and metrics
- **Relationship Management** with contact/company linking and history tracking
- **Task & Goal Tracking** with assignments and progress monitoring

### **AI Intelligence Engine**
- **AI Agent Chat** - Conversational interface powered by LLM for sales assistance
- **Predictive Momentum Scoring** - AI-driven deal probability assessment
- **Deal Health Monitoring** - Automatic risk detection for stale deals
- **Relationship Strength Scoring** - Quantify connection quality with contacts
- **Hot Lead Detection** - AI identifies high-priority opportunities
- **Revenue Forecasting** - Predictive analytics for pipeline projections
- **Sales Collateral Generator** - Auto-create proposals, battle cards, and one-pagers
- **Website Intelligence** - Automatic company enrichment via web scraping

### **Autonomous Prospecting System**
- **AI Prospecting Agent** - Finds businesses via Google Maps based on ICP criteria
- **Automated Discovery** - Scrapes company websites and analyzes digital presence
- **Pain Point Analysis** - Identifies automation opportunities using lead gen methodology
- **Personalized Outreach** - Generates custom talking points and recommendations
- **Auto-Enrichment** - Creates detailed company profiles with sales intelligence
- **Scheduled Prospecting** - Cron-based automation (daily/weekly/monthly runs)

### **Communication & Collaboration**
- **Email Sequences** - Automated campaigns with Resend/Gmail integration
- **Google Calendar Sync** - Two-way meeting synchronization with auto-logging
- **Real-time Notifications** - WebSocket-powered alerts for deal updates and AI insights
- **Command Palette** - Instant navigation with Ctrl+K keyboard shortcut
- **Team Collaboration** - Shared pipeline visibility and activity streams

### **Content & Integration**
- **Blog Editor** - Rich text CMS with TipTap for content marketing
- **Notion Integration** - One-click sync of contacts, companies, and deals via MCP
- **SEO Optimization** - Meta tags, slugs, and structured data for blog posts
- **Mobile Responsive** - Touch-friendly interface optimized for all devices

---

## 🎨 Design Philosophy

**Minimalist Neobrutalism with Lime Green Accents**

The interface deliberately avoids typical AI product aesthetics (purple gradients, rounded capsules) in favor of a sharp, high-contrast design:

- **90-degree angles** on all UI elements
- **Lime green (#84cc16)** as the primary accent color
- **Dark theme** with high contrast for readability
- **Sharp borders** and minimal shadows
- **Brutalist typography** with clear hierarchy

---

## 🛠️ Technology Stack

### **Frontend**
- **React 19** - Latest React with concurrent features
- **TypeScript** - Full type safety across the codebase
- **Tailwind CSS 4** - Utility-first styling with custom design tokens
- **tRPC** - End-to-end typesafe APIs
- **shadcn/ui** - Accessible component library
- **Wouter** - Lightweight routing
- **TipTap** - Rich text editor for blog content
- **Socket.IO Client** - Real-time WebSocket communication

### **Backend**
- **Express 4** - Web server framework
- **tRPC 11** - Type-safe API layer
- **Drizzle ORM** - Type-safe database queries
- **MySQL/TiDB** - Relational database
- **Socket.IO** - WebSocket server for real-time features
- **node-cron** - Scheduled task automation
- **Cheerio** - Web scraping for company enrichment

### **AI & Integrations**
- **LLM Integration** - Built-in AI service for chat and analysis
- **Google Maps API** - Business discovery via Manus proxy
- **Google Calendar API** - Meeting synchronization
- **Resend API** - Transactional email sending
- **Notion MCP** - Database synchronization via Model Context Protocol

---

## 📦 Installation & Setup

### **Prerequisites**
- Node.js 22.x or higher
- pnpm 10.x or higher
- MySQL/TiDB database
- Manus platform account (for deployment)

### **Local Development**

```bash
# Clone the repository
git clone <repository-url>
cd momentum-ai-crm

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Push database schema
pnpm db:push

# Start development server
pnpm dev
```

The application will be available at `http://localhost:3000`

### **Environment Variables**

System environment variables (auto-injected by Manus platform):

```env
DATABASE_URL=mysql://...
JWT_SECRET=...
VITE_APP_ID=...
OAUTH_SERVER_URL=...
VITE_OAUTH_PORTAL_URL=...
OWNER_OPEN_ID=...
OWNER_NAME=...
BUILT_IN_FORGE_API_URL=...
BUILT_IN_FORGE_API_KEY=...
VITE_FRONTEND_FORGE_API_KEY=...
VITE_FRONTEND_FORGE_API_URL=...
VITE_APP_TITLE=Momentum AI
VITE_APP_LOGO=/logo.svg
```

Optional integration secrets (add via Management UI → Settings → Secrets):

```env
# Email Integration
RESEND_API_KEY=re_...

# Google Calendar Integration
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REFRESH_TOKEN=...

# Gmail Integration (optional)
GMAIL_CLIENT_ID=...
```

---

## 🗄️ Database Schema

The platform uses 19 tables to manage all CRM data:

### **Core Entities**
- `users` - Authentication and user profiles
- `contacts` - Individual contacts with relationship data
- `companies` - Business entities with enrichment data
- `deals` - Sales opportunities with pipeline stages
- `leads` - Unqualified prospects
- `tasks` - Action items with assignments
- `goals` - Sales targets and quotas
- `activities` - Interaction history (calls, emails, meetings)

### **Intelligence & Automation**
- `icps` - Ideal Customer Profile definitions
- `prospecting_schedules` - Automated prospecting configurations
- `email_sequences` - Campaign automation
- `email_sequence_steps` - Individual email templates
- `notifications` - Real-time alert storage

### **Content & Knowledge**
- `articles` - Knowledge base content
- `blog_posts` - Published blog articles

### **Relationships**
- `contact_company` - Many-to-many contact-company links
- `deal_contact` - Deal-contact associations
- `deal_company` - Deal-company associations

---

## 🚦 Usage Guide

### **Getting Started**

1. **Login** - Authenticate via Manus OAuth
2. **Create an ICP** - Define your ideal customer profile
3. **Run Prospecting** - Let AI find matching businesses
4. **Review Prospects** - Check enriched company profiles
5. **Create Deals** - Convert prospects to active opportunities
6. **Manage Pipeline** - Use Kanban board to track progress
7. **Automate Outreach** - Set up email sequences
8. **Track Activities** - Log calls, meetings, and interactions

### **AI Prospecting Workflow**

```
1. ICPs Page → Create ICP with criteria
   ↓
2. Prospecting Agent → Run search (or schedule)
   ↓
3. Review Results → AI-generated insights & talking points
   ↓
4. Auto-Create Companies → One-click import to CRM
   ↓
5. Create Deals → Convert to active opportunities
   ↓
6. Email Sequences → Automated outreach campaigns
```

### **Command Palette Shortcuts**

Press `Ctrl+K` (or `Cmd+K` on Mac) to open the command palette:

- Type to search across all pages
- Quick navigation to any feature
- Create new records instantly
- Execute common actions

### **Notion Integration Setup**

1. Create databases in Notion for Contacts, Companies, and Deals
2. Copy database IDs from Notion URLs
3. Navigate to **Notion** page in CRM
4. Paste database IDs
5. Click **Sync All** to push data

---

## 📊 API Documentation

### **tRPC Routers**

The backend exposes the following tRPC routers:

- `auth` - Authentication and session management
- `contacts` - Contact CRUD operations
- `companies` - Company management
- `deals` - Deal pipeline operations
- `leads` - Lead tracking
- `tasks` - Task management
- `goals` - Goal and quota tracking
- `activities` - Activity logging
- `icps` - ICP management
- `articles` - Knowledge base
- `ai` - AI intelligence features (chat, scoring, forecasting)
- `email` - Email sequence automation
- `calendar` - Google Calendar integration
- `notifications` - Real-time notifications
- `prospecting` - AI prospecting agent
- `scheduler` - Automated prospecting schedules
- `blog` - Blog post management
- `notion` - Notion database synchronization

### **WebSocket Events**

Real-time events via Socket.IO:

- `notification` - New notification received
- `deal:updated` - Deal status changed
- `task:assigned` - Task assigned to user
- `lead:hot` - Hot lead detected
- `deal:stale` - Deal requires attention

---

## 🔐 Security

- **OAuth 2.0** - Secure authentication via Manus platform
- **JWT Sessions** - Signed session cookies
- **Row-level Security** - All queries filtered by `ownerId`
- **Input Validation** - Zod schemas on all endpoints
- **SQL Injection Protection** - Parameterized queries via Drizzle ORM
- **XSS Prevention** - React automatic escaping
- **CORS Configuration** - Restricted origins in production

---

## 🧪 Testing

```bash
# Run TypeScript type checking
pnpm tsc --noEmit

# Run linter
pnpm lint

# Run tests (if configured)
pnpm test
```

---

## 📈 Performance

- **Optimistic Updates** - Instant UI feedback for mutations
- **Query Caching** - tRPC automatic query deduplication
- **Code Splitting** - Route-based lazy loading
- **WebSocket Pooling** - Efficient real-time connections
- **Database Indexing** - Optimized queries on foreign keys

---

## 🚀 Deployment

### **Via Manus Platform**

1. Save a checkpoint: `webdev_save_checkpoint`
2. Click **Publish** in Management UI
3. Configure custom domain (optional)
4. Add production secrets in Settings → Secrets

### **Manual Deployment**

```bash
# Build frontend
cd client && pnpm build

# Start production server
NODE_ENV=production node server/_core/index.js
```

---

## 🗺️ Roadmap

### **Completed Features** ✅
- Core CRM functionality
- AI intelligence features
- Autonomous prospecting
- Email automation
- Calendar integration
- Real-time notifications
- Blog CMS
- Notion sync

### **Planned Enhancements** 🔮
- Network visualization graph
- Bulk operations for contacts/deals
- File attachments and document storage
- Advanced analytics dashboard
- SMS integration
- Zapier/Make.com webhooks
- Public blog pages
- Bi-directional Notion sync

---

## 🤝 Contributing

This is a proprietary project built for specific business needs. For questions or support, contact the project owner.

---

## 📄 License

Proprietary - All rights reserved.

---

## 🙏 Acknowledgments

Built with:
- [React](https://react.dev/)
- [tRPC](https://trpc.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [TipTap](https://tiptap.dev/)
- [Socket.IO](https://socket.io/)

Deployed on [Manus Platform](https://manus.im/)

---

## 📞 Support

For technical support or questions about the platform, please contact the project administrator.

**Built with ⚡ by Manus AI**
