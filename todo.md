# Momentum AI CRM - Project TODO

## Core CRM Features
- [x] Dashboard with customizable KPI cards and charts
- [x] Kanban Deals Pipeline with drag-and-drop functionality
- [x] Unified Contact Management with detail sheets
- [x] Unified Company Management with detail sheets
- [x] Full CRUD for Contacts
- [x] Full CRUD for Companies
- [x] Full CRUD for Deals
- [x] Full CRUD for ICPs (Ideal Customer Profiles)
- [x] Full CRUD for Leads
- [x] Full CRUD for Articles
- [x] Full CRUD for Activities
- [x] Full CRUD for Tasks
- [x] Full CRUD for Goals
- [x] Task Management with associated deals, contacts, and companies
- [x] Goal & Quota Tracking

## AI & Intelligence Features
- [x] AI Agent Chat interface
- [x] AI-Powered Lead Scoring
- [x] Predictive AI "Momentum Score" for deals
- [x] "Deal Health" status for risk assessment
- [x] Intelligent Notifications & Reminders (stale deals detection)
- [x] Relationship Strength Score for contacts and companies
- [x] Warm Introduction Path finder
- [x] Robust Lead Scoring
- [x] Hot Leads Detection
- [x] AI Revenue Forecasting chart
- [x] AI Sales Collateral Generator (proposals, battle cards, one-pagers)
- [x] Company Website AI Scraping for summaries
- [x] AI Insights Dashboard

## Design Updates
- [x] Redesign UI with sharp angles (no rounded corners)
- [x] Replace purple/cyan with lime green accent color
- [x] Remove gradients and capsule-shaped buttons
- [x] Apply minimalist/neobrutalist aesthetic
- [x] Dark interface with 90-degree angles

## User Experience & Architecture
- [x] Sharp angular design with lime green accents
- [x] Minimalist/neobrutalist aesthetic
- [x] Dark interface
- [x] Command Palette for quick navigation and actions (Ctrl+K)
- [x] Collaborative Deal Commenting
- [x] Admin Knowledge Hub CMS (Articles)
- [x] Reporting Dashboard with analytics charts
- [x] Enhanced Content Hub for sales collateral and messaging
- [x] Email Sequencing Campaigns
- [x] Team Members page
- [x] Full navigation sidebar with all pages

## Email Integration
- [x] Gmail API integration for sending emails
- [x] Resend API integration as alternative email provider
- [x] Email sequence automation engine
- [x] Email templates management
- [x] Email sequence UI with create/manage functionality
- [x] Test email sending capability
- [x] Email activity logging in deals

## Mobile Responsiveness
- [x] Mobile-responsive dashboard with stacked KPI cards
- [x] Mobile-friendly navigation (collapsible sidebar)
- [x] Responsive tables with horizontal scroll
- [x] Mobile-optimized command palette
- [x] Touch-friendly AI chat interface
- [x] Mobile-responsive email sequences page
- [x] Mobile-responsive AI insights and collateral pages
- [x] Responsive breakpoints (sm, md, lg) across all pages

## Real-time Notifications
- [x] WebSocket server setup with Socket.IO
- [x] Notification event types (deal updates, task assignments, AI insights)
- [x] Real-time notification broadcasting
- [x] Notification UI component with bell icon and dropdown
- [x] Notification persistence in database
- [x] Mark as read/unread functionality
- [x] Live notification toasts
- [x] Unread count badge
- [x] WebSocket context provider
- [x] NotificationCenter component in header

## Google Calendar Integration
- [x] Google Calendar API setup
- [x] Calendar service with OAuth support
- [x] Sync meetings from Google Calendar
- [x] Create calendar events from CRM
- [x] Automatically log call activities
- [x] Calendar view component
- [x] Meeting scheduling UI
- [x] Activity auto-logging from calendar events
- [x] Meeting attendees management
- [x] Google Meet link generation
- [x] Calendar page with event list
- [x] Delete calendar events

## AI Prospecting Agent
- [x] Review lead generation knowledge base documents
- [x] ICP-based prospecting system design
- [x] Google Maps API integration for business discovery
- [x] Company website scraping engine with Cheerio
- [x] AI pain point analysis using lead gen guides
- [x] Sales opportunity identification with LLM
- [x] Personalized outreach recommendations
- [x] Detailed company profile generation
- [x] Geoeconomic data enrichment
- [x] "Why they're a good fit" analysis
- [x] Specific talking points generation
- [x] Digital presence scoring (website, SEO, social media)
- [x] Automation opportunity detection
- [x] Recommended service package matching
- [x] Deal value estimation
- [x] Priority scoring (high/medium/low)
- [x] Prospecting agent backend with tRPC router
- [x] Prospecting agent UI with results dashboard
- [x] Batch prospecting from ICPs
- [x] Auto-create company pages in CRM from prospects
- [x] Lead generation knowledge base integration

## Automated Prospecting Scheduler
- [x] Prospecting schedule database schema
- [x] Cron job system for automated runs with node-cron
- [x] Schedule configuration UI
- [x] ICP-based schedule creation
- [x] Frequency settings (daily/weekly/monthly)
- [x] Schedule history and logs (lastRunAt, nextRunAt)
- [x] Pause/resume schedules
- [x] Auto-create companies from scheduled runs
- [x] Manual trigger for immediate runs
- [x] Scheduler initialization on server startup
- [x] Prospecting Scheduler page with full management UI

## Admin Blog Editor
- [x] Blog posts database schema
- [x] Rich text editor integration with TipTap
- [x] Blog post CRUD operations
- [x] Draft/published status
- [x] SEO metadata fields (title, description)
- [x] Blog post categories/tags
- [x] Blog Editor UI with rich text editing
- [x] Excerpt and featured image support
- [x] Slug generation from titles
- [x] Blog router with public and admin endpoints

## Notion Integration
- [x] Notion MCP integration setup
- [x] Sync contacts to Notion database
- [x] Sync companies to Notion database
- [x] Sync deals to Notion database
- [x] Batch sync functionality
- [x] Notion integration service with MCP CLI
- [x] Notion router with tRPC procedures
- [x] Notion integration settings UI
- [x] Manual sync trigger for all entity types
- [x] Database ID configuration per entity type

## Integrations (Ready for Configuration)
- [x] Resend integration (needs RESEND_API_KEY)
- [x] Google Calendar integration (needs GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN)
- [x] Google Maps API integration (automatic via Manus proxy)
- [x] Notion integration (via MCP - configured in Manus)
- [ ] Gmail OAuth integration (needs GMAIL_CLIENT_ID)

## Infrastructure
- [x] Database schema design and migration (19 tables including schedules and blog posts)
- [x] Backend API with tRPC procedures
- [x] Authentication and authorization
- [x] LLM integration for AI features
- [x] AI router with intelligence procedures
- [x] Email router with sequence management
- [x] Notifications router with real-time support
- [x] Calendar router with Google Calendar API
- [x] Prospecting router with Google Maps integration
- [x] Scheduler router with cron job management
- [x] Blog router with rich content management
- [x] Notion router with MCP integration
- [x] WebSocket server with Socket.IO
- [x] Command palette for quick navigation
- [x] Mobile-responsive design system
- [x] Real-time notification system
- [x] Calendar integration system
- [x] AI prospecting engine with website scraping
- [x] Automated prospecting scheduler with cron
- [x] Rich text editor with TipTap
- [x] Notion sync via MCP

## Completed Milestones
- ✅ Project initialization and architecture setup
- ✅ Database schema with 19 tables
- ✅ Backend API with comprehensive tRPC routers
- ✅ Frontend UI with DashboardLayout and 20+ pages
- ✅ Core CRM functionality (Contacts, Companies, Deals, Tasks, Leads, ICPs, Goals, Activities)
- ✅ AI features (Chat, Insights, Forecasting, Collateral Generator, Momentum Scoring)
- ✅ Email integration and automated sequences
- ✅ Google Calendar integration with meeting sync
- ✅ Real-time notifications with WebSocket
- ✅ AI Prospecting Agent with Google Maps and website scraping
- ✅ Automated Prospecting Scheduler with cron jobs
- ✅ Admin Blog Editor with rich text editing
- ✅ Notion Integration via MCP for data syncing
- ✅ Mobile-responsive design across all pages
- ✅ Sharp angular design with lime green accents (minimalist/neobrutalist)

## Future Enhancements (Optional)
- [ ] Network Mapping visualization (who referred whom)
- [ ] Bulk operations for contacts/deals/leads
- [ ] File attachments for deals and companies
- [ ] Advanced filtering and search
- [ ] Export functionality (CSV, PDF reports)
- [ ] Public blog view pages
- [ ] Bi-directional Notion sync
- [ ] Advanced analytics dashboard with more charts
- [ ] Email tracking and engagement metrics
- [ ] SMS integration
- [ ] Zapier/Make.com integration


## Public Blog Routes
- [x] Create public blog list page at /blog
- [x] Create public blog post page at /blog/:slug
- [x] Add SEO meta tags (title, description, OG tags)
- [x] Add social sharing buttons (Twitter, LinkedIn, Facebook)
- [x] Add category filtering
- [x] Add search functionality
- [x] Mobile-responsive blog layout
- [ ] Add blog post navigation (previous/next)
- [ ] Add RSS feed generation

## File Attachments
- [x] Add attachments table to database schema
- [x] Create file upload API with S3 integration
- [x] Add file attachment UI to deal detail pages
- [x] Add file attachment UI to company detail pages
- [x] Support multiple file types (PDF, DOCX, images)
- [x] Add file preview/download functionality
- [x] Add file deletion with S3 cleanup
- [x] Display file metadata (name, size, upload date)
- [x] Create DealDetail and CompanyDetail pages


## Bulk Operations
- [x] Create bulk email API endpoint
- [x] Create bulk status update API endpoint
- [x] Create bulk tag assignment API endpoint
- [x] Create bulk delete API endpoint
- [x] Add multi-select checkboxes to Contacts table
- [x] Add bulk action toolbar with email, update, tag, delete buttons
- [x] Implement select all / deselect all functionality
- [x] Add confirmation dialogs for bulk operations
- [ ] Add multi-select checkboxes to Deals table
- [ ] Add multi-select checkboxes to Leads table

## Contact Detail Pages
- [x] Create ContactDetail page at /contacts/:id
- [x] Display full contact information
- [x] Show relationship history with companies
- [x] Display activity timeline
- [x] Add file attachments support for contacts
- [x] Link to related deals and companies
- [x] Mobile-responsive contact detail layout
- [ ] Add edit contact functionality


## In-App Editing
- [ ] Add inline edit mode to ContactDetail page
- [ ] Add inline edit mode to DealDetail page
- [x] Add inline edit mode to CompanyDetail page
- [x] Add save/cancel buttons for edit mode
- [x] Implement optimistic updates for instant feedback
- [ ] Add validation for required fields

## Enhanced Company Detail Page
- [x] Display comprehensive company information
- [x] Show AI-generated pain points and opportunities
- [x] Display relationship strength and momentum score
- [x] Show related deals and contacts
- [x] Add activity timeline
- [x] Display website scraping results
- [x] Show tech stack

## AI Functionality Verification
- [x] Test AI Chat with streaming responses
- [x] Verify prospecting agent with Google Maps integration
- [x] Test website scraping and analysis
- [x] Verify momentum scoring calculation
- [x] Test deal health assessment
- [x] Verify AI collateral generation
- [x] Test revenue forecasting

## ICP (Ideal Customer Profile) Management
- [x] Enhance ICP page with full CRUD functionality
- [x] Add ICP creation form with all fields
- [x] Add ICP edit functionality
- [x] Add ICP delete with confirmation
- [x] Display ICP details in table
- [x] Link ICPs to prospecting agent with Run button
- [ ] Add ICP filtering and search
- [ ] Show active/inactive status for ICPs


## Knowledge Hub Integration
- [x] Review and store AI Automation Playbook in knowledge hub
- [x] Create knowledge base table in database
- [x] Build knowledge hub UI page for browsing playbooks
- [x] Add search and filtering for knowledge articles
- [x] Create categories for different playbook types
- [ ] Connect AI Chat to reference knowledge hub content
- [ ] Connect AI agents to use playbook guidance
- [ ] Add ability to upload and manage knowledge articles


## AI Knowledge Hub Integration
- [x] Update AI Chat to search and reference knowledge hub
- [x] Connect Collateral Generator to use playbook guidelines
- [x] Connect Prospecting Agent to use brand voice and messaging
- [x] Implement automatic context injection for AI prompts
- [x] Build admin upload interface for knowledge articles
- [x] Add file upload support (markdown, PDF, text)
- [x] Add knowledge article management (edit, delete, publish)
- [x] Create knowledge article preview and versioning
- [x] Add brand guidelines extraction for AI context
- [x] Implement smart context selection based on AI task type


## Sidebar Navigation Consolidation
- [x] Group related items into collapsible sections
- [x] Create "CRM" section (Contacts, Companies, Deals, Pipeline, Leads)
- [x] Create "Productivity" section (Tasks, Goals, Activities, Calendar)
- [x] Create "AI Tools" section (AI Chat, AI Insights, Collateral, Prospecting, ICPs, Scheduler)
- [x] Create "Marketing" section (Email Sequences, Articles, Blog)
- [x] Create "Settings" section (Knowledge Hub, Notion Sync, Team)
- [x] Reduce total visible items in sidebar
- [x] Add expand/collapse functionality for groups


## Branding Update
- [ ] Change app title from "Momentum AI" to "siaCRM"
- [ ] Update logo/branding with "sia" in lighter weight, "CRM" in bold
- [ ] Update all references in code and UI

## Sidebar Search
- [ ] Add search input at top of sidebar
- [ ] Implement fuzzy search across all menu items
- [ ] Show filtered results as user types
- [ ] Highlight matching items and auto-expand groups
- [ ] Add keyboard navigation (arrow keys, Enter to navigate)

## Onboarding Tour
- [ ] Create tour system with step-by-step walkthrough
- [ ] Add tour steps for key features (ICPs, Prospecting, AI Chat, Deals)
- [ ] Build tour UI with tooltips and highlights
- [ ] Add "Skip Tour" and "Next" buttons
- [ ] Store tour completion status in user preferences
- [ ] Add "Restart Tour" option in settings

## Recent Items Widget
- [ ] Track recently viewed contacts, companies, and deals
- [ ] Store recent items in localStorage or database
- [ ] Add "Recent" section to sidebar or dashboard
- [ ] Show last 5 accessed items with icons and timestamps
- [ ] Add quick navigation to recent items
- [ ] Clear recent items functionality

## Branding & UX Improvements
- [x] Rebrand from "Momentum AI" to "siaCRM" with styled font weights
- [x] Add sidebar search for quick page filtering
- [x] Create onboarding tour for new users with react-joyride
- [x] Add Recently Viewed widget for quick navigation to recent contacts/companies/deals
- [x] Track recently viewed items in ContactDetail, CompanyDetail, and DealDetail pages
- [x] Display Recently Viewed widget on Dashboard

## Consolidated Navigation
- [x] Consolidate sidebar from 21 items to 6 collapsible groups
- [x] Implement expand/collapse functionality for navigation groups
- [x] Group items by category (Overview, CRM, Productivity, AI Tools, Marketing, Settings)

## Sidebar Improvements
- [x] Reduce sidebar default width
- [x] Add icon-only collapse mode for sidebar
- [x] Show tooltips on hover when sidebar is collapsed
- [x] Persist collapse state in localStorage

## Activity Feed Widget
- [x] Create activity feed database schema
- [x] Build activity logging system for CRM actions
- [x] Create ActivityFeed component with real-time updates
- [x] Display recent actions (deals updated, contacts added, AI insights)
- [x] Show timestamps and user attribution
- [x] Add to Dashboard layout

## Keyboard Shortcuts Panel
- [x] Create keyboard shortcuts help modal
- [x] Trigger with "?" key press
- [x] Document all available shortcuts (Ctrl+K, navigation, etc.)
- [x] Add visual keyboard key representations
- [x] Make accessible from header or footer

## Account-Based CRM Detail Pages
- [x] Enhance activity logging for companies and deals
- [x] Build comprehensive company detail page
  - [x] Show company information card
  - [x] Display linked contacts list
  - [x] Display linked deals list
  - [x] Show activity history for company and related entities
- [x] Enhance contact detail page
  - [x] Show contact information card
  - [x] Display linked company information
  - [x] Show contact-specific activity history
  - [x] Show company activity context
- [x] Build deal detail page
  - [x] Show deal information card
  - [x] Display linked company and contact
  - [x] Show deal-specific activity history
  - [x] Show related entity activity
- [x] Ensure activity logs show across all related entities

## Critical Bug Fixes
- [x] Register detail page routes in App.tsx (company, contact, deal detail pages)
- [x] Fix admin role assignment for project owner
- [x] Verify detail pages open when clicking entities
- [x] Verify admin privileges work correctly

## 1. Inline Editing on Detail Pages
- [x] Add inline edit mode for company fields (name, industry, website, etc.)
- [x] Add inline edit mode for contact fields (name, email, phone, title, etc.)
- [x] Add inline edit mode for deal fields (title, value, stage, probability, etc.)
- [x] Implement auto-save on blur or Enter key
- [x] Show loading state during save
- [x] Display success/error feedback
- [x] Support ESC key to cancel editing

## 2. Notes & Comments System
- [x] Create notes database table with user, entity, timestamp
- [x] Build NotesList component for detail pages
- [x] Implement rich text editor for notes (markdown support)
- [x] Add @mentions functionality for users
- [ ] Show notes in activity timeline
- [x] Support editing and deleting own notes
- [x] Add notes tab to company/contact/deal detail pages

## 3. Task & Reminder System
- [x] Create tasks database table with due dates, assignments, status
- [x] Build task creation modal with date picker
- [x] Link tasks to companies, contacts, or deals
- [ ] Implement task list view with filtering (all, mine, overdue)
- [ ] Add task status updates (pending, completed, cancelled)
- [ ] Create notification system for due tasks
- [ ] Show upcoming tasks on Dashboard
- [ ] Add tasks section to detail pages

## 4. Bulk CSV Import
- [ ] Create CSV upload component with drag-and-drop
- [ ] Build field mapping interface (CSV columns → CRM fields)
- [ ] Implement CSV parsing and validation
- [ ] Add duplicate detection (by email for contacts, domain for companies)
- [ ] Show import preview before committing
- [ ] Create bulk insert procedures in backend
- [ ] Display import results (success, skipped, errors)
- [ ] Add import history tracking

## 5. Email Integration
- [ ] Create email_threads and email_messages tables
- [ ] Build email tracking widget for contact detail pages
- [ ] Implement email template system (create, edit, delete)
- [ ] Add email sequence builder with steps and delays
- [ ] Create email composer with template selection
- [ ] Track email opens and clicks (if possible)
- [ ] Link emails to contacts and deals
- [ ] Show email history in activity timeline

## 6. Advanced Pipeline Management
- [ ] Implement drag-and-drop in Kanban view for deal stages
- [ ] Add stage transition animations
- [ ] Create win/loss reason capture on deal close
- [ ] Build pipeline analytics (conversion rates, avg time per stage)
- [ ] Add deal forecasting based on probability
- [ ] Implement automated stage transitions based on actions
- [ ] Create pipeline velocity metrics
- [ ] Add filters for deal owner, date range, value range

## Email Integration
- [x] Create email database schema (templates, threads, messages)
- [x] Build email templates management system with CRUD
- [x] Create email composer component with template selection
- [x] Implement email tracking (sent, delivered, opened, clicked)
- [x] Add email history widget to contact detail pages
- [x] Create Email Templates management page
- [ ] Build email sequence automation with step delays
- [ ] Add email sequence enrollment for contacts
- [ ] Create email analytics dashboard

## Email Sequence Automation
- [x] Create email sequences router with CRUD operations
- [x] Build visual sequence builder with drag-and-drop steps
- [x] Implement step management (add, edit, delete, reorder)
- [x] Create enrollment management system
- [ ] Add automatic enrollment triggers
- [x] Build analytics dashboard with sequence metrics
- [x] Show open rates, click rates, and conversion stats
- [x] Display sequence performance charts
- [x] Add contact enrollment status tracking

## Sequence Template Library
- [x] Create sequence_templates database table
- [x] Build template save functionality from existing sequences
- [x] Create template library page with browse/search
- [x] Implement template preview with step details
- [x] Add clone template to create new sequence
- [x] Track template usage count
- [x] Add template categories/tags
- [ ] Show template performance metrics

## Marketing Landing Page
- [x] Design hero section with value proposition
- [x] Add features section highlighting key capabilities
- [x] Create pricing section with subscription tiers
- [x] Add testimonials/social proof section
- [x] Build CTA buttons linking to signup/login
- [x] Add footer with links and company info
- [x] Make landing page the default route (/)
- [x] Ensure responsive design for mobile

## Stripe Payment Integration
- [ ] Add Stripe feature to project using webdev_add_feature
- [ ] Create subscription plans (Starter, Professional, Enterprise)
- [ ] Build pricing page with plan comparison
- [ ] Implement checkout flow with Stripe
- [ ] Add subscription management in user settings
- [ ] Handle webhook events for subscription updates
- [ ] Show current plan and billing info in dashboard
- [ ] Implement upgrade/downgrade functionality

## In-App Notification System
- [ ] Create notifications database table
- [ ] Build notifications router with CRUD operations
- [ ] Add notification bell icon to header with unread count
- [ ] Create notification dropdown panel
- [ ] Implement mark as read/unread functionality
- [ ] Add notification types (mentions, tasks, deals, activity)
- [ ] Show real-time notification updates
- [ ] Add notification preferences/settings

## Push Notification System
- [ ] Request browser notification permissions
- [ ] Implement service worker for push notifications
- [ ] Send browser notifications for important events
- [ ] Handle notification click to navigate to relevant page
- [ ] Add push notification toggle in settings
- [ ] Test notifications across browsers

## Bug Fixes
- [x] Fix infinite re-render error in CompanyDetail component

## Landing Page Redesign
- [x] Apply neobrutalist design style (bold colors, thick borders, shadows)
- [x] Update hero section with neobrutalist aesthetic
- [x] Redesign feature cards with geometric shapes and bold styling
- [x] Update pricing section with neobrutalist card design
- [x] Ensure landing page is accessible without authentication

## Onboarding Tour Fix
- [x] Disable onboarding tour on landing page
- [x] Only show onboarding tour after user logs in (on dashboard)
