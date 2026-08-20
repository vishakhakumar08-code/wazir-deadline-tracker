# ♟️ Wazir - Real-Time Deadline Tracker

> **The Strategy & Consulting Club**  
> An executive-grade, real-time deliverable & deadline tracking web application engineered for Wazir leadership and consultants. Built with **Next.js (App Router)**, **Tailwind CSS**, **Lucide Icons**, and **Supabase Real-Time**. Ready for instant **Vercel** deployment.

---

## ✨ Features & Capabilities

- ⚡ **Supabase Real-Time Live Sync**: Live Postgres changes channel automatically propagates task creation, status advancement, edits, and deletions across all active devices and browser tabs with zero page reload.
- 📋 **Kanban Workflow Board**: Interactive columns (`Backlog`, `In Progress`, `Review`, `Completed`) with column metrics, direct status advancement, and quick task creation.
- 👥 **Member Matrix View**: Individual deliverable matrices and workload balance radar across all 10 club leaders and consultants, with 1-click deliverable assignment.
- 🎨 **Color-Coded Deadline Engine**:
  - 🔴 **Overdue**: Crimson flashing pulse badge with elapsed time (`Overdue by 4h`).
  - 🟡 **Due in < 24 Hours**: Amber warning badge with real-time countdown (`Due in 5h 30m`).
  - 🟢 **Later Deadlines**: Emerald green badge with formatted date.
  - ⚪ **Completed**: Muted slate/emerald badge.
- 🔍 **Multi-Dimensional Filters**: Filter by Vertical, Assignee, Priority, Urgency, and instant live search.
- 📝 **Quick Deliverable Modal**: Multi-assignee chips, vertical dropdown, date-time picker with quick presets (e.g. *In 6h*, *In 24h*, *In 3 days*), checklist subtasks builder, and resource URLs.
- 📊 **Club Minutes of Meeting (MoM) & CSV Export**: 1-click Markdown MoM generator and CSV/JSON downloads for team reviews.
- 🛠️ **Integrated SQL Setup Drawer**: Full PostgreSQL schema script viewable and copyable with 1-click directly inside the UI.

---

## 🏛️ Core Club Data & Configuration

### Verticals
1. **Editorial** (Newsletters, op-eds, research articles)
2. **Public Relations** (Social media, LinkedIn campaigns, branding)
3. **Events** (Workshops, guest speakers, campus boot camps)
4. **Casebook** (Annual casebook curation, sector deep dives)
5. **Apex** (Flagship national strategy case competition)
6. **External Relations** (Corporate partnerships, sponsors, alumni)

### Assignees (Core Team)
- **Avi** (President / Lead)
- **Ishika** (Vice President)
- **Nandini** (Head of Casebook)
- **Simar** (Head of Events)
- **Harshvardhan** (Head of ER)
- **Animesh** (Apex Convenor)
- **Vishakha** (Head of Editorial)
- **Devanshi** (Head of PR)
- **Somansha** (Strategy Associate)
- **Akruti** (Consulting Analyst)

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
\`\`\`bash
npm install
# or
yarn install
# or
pnpm install
\`\`\`

### 2. Configure Environment Variables
Create a \`.env.local\` file in the root directory:
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key-here
\`\`\`
*(Note: If no Supabase credentials are provided, the app will run seamlessly in Local Sandbox mode with local storage persistence and full UI capabilities.)*

### 3. Run Development Server
\`\`\`bash
npm run dev
\`\`\`
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ Supabase Database Setup

1. Log in to [supabase.com](https://supabase.com) and create a new project.
2. Go to the **SQL Editor** tab.
3. Paste the contents of [\`supabase/schema.sql\`](./supabase/schema.sql) (or copy it from the in-app **SQL Schema** modal) and click **Run**.
4. Retrieve your **Project URL** and **Anon Public Key** from **Project Settings > API**.

---

## 🌐 Deploy to Vercel

1. Push this repository to GitHub / GitLab.
2. Import the repository into **[Vercel](https://vercel.com)**.
3. In Vercel's **Environment Variables** section, add:
   - \`NEXT_PUBLIC_SUPABASE_URL\`
   - \`NEXT_PUBLIC_SUPABASE_ANON_KEY\`
4. Click **Deploy**! 🚀

---

## 📂 Project Structure

\`\`\`
Wazir/
├── supabase/
│   └── schema.sql              # Supabase PostgreSQL schema, triggers & seed data
├── src/
│   ├── app/
│   │   ├── globals.css         # Executive dark theme styles & custom scrollbars
│   │   ├── layout.tsx          # Root layout & TaskProvider wrapper
│   │   └── page.tsx            # Main application container
│   ├── components/
│   │   ├── Header.tsx          # Club header, realtime badge & view switcher
│   │   ├── StatsOverview.tsx   # Overdue, 24h, active & completion KPI cards
│   │   ├── FilterBar.tsx       # Search, vertical badges & assignee filters
│   │   ├── KanbanBoard.tsx     # 4-column workflow board
│   │   ├── KanbanColumn.tsx    # Drag-and-drop column container
│   │   ├── TaskCard.tsx        # Deliverable card with color-coded deadline pill
│   │   ├── MemberMatrix.tsx    # Team deliverable grid for all 10 members
│   │   ├── TaskModal.tsx       # Quick task creation & assignment modal
│   │   ├── TaskDetailModal.tsx # Task inspector, checklist & status advance
│   │   ├── SqlSetupModal.tsx   # 1-click copyable SQL & setup guide
│   │   └── ExportModal.tsx     # Meeting MoM & CSV/JSON export
│   ├── context/
│   │   └── TaskContext.tsx     # Real-time state management & Supabase listeners
│   ├── lib/
│   │   ├── constants.ts        # Verticals, Assignees, Statuses, Priorities
│   │   ├── deadlineUtils.ts    # Color coding & real-time countdown calculations
│   │   ├── initialData.ts      # Seed deliverables for Wazir
│   │   └── supabase.ts         # Supabase client & real-time channel subscription
│   └── types/
│       └── task.ts             # TypeScript definitions
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
\`\`\`
