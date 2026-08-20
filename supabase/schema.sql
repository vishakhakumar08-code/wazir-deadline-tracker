-- ==============================================================================
-- WAZIR - The Strategy & Consulting Club
-- Real-Time Deadline Tracker Database Schema & Seed Data
-- ==============================================================================

-- 1. Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    vertical TEXT NOT NULL CHECK (vertical IN ('Editorial', 'Public Relations', 'Events', 'Casebook', 'Apex', 'External Relations')),
    assignees TEXT[] NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'Backlog' CHECK (status IN ('Backlog', 'In Progress', 'Review', 'Completed')),
    priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Urgent', 'High', 'Medium', 'Low')),
    deadline TIMESTAMPTZ NOT NULL,
    subtasks JSONB NOT NULL DEFAULT '[]'::jsonb,
    resources TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Attach trigger to tasks table
DROP TRIGGER IF EXISTS set_tasks_updated_at ON public.tasks;
CREATE TRIGGER set_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- 5. Create policy to allow all operations for club members using anon key
DROP POLICY IF EXISTS "Public access to tasks for Wazir members" ON public.tasks;
CREATE POLICY "Public access to tasks for Wazir members"
    ON public.tasks
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

-- 6. Enable Realtime publication for the tasks table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'tasks'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
    END IF;
END $$;

-- 7. Add performance indexes
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_vertical ON public.tasks(vertical);
CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON public.tasks(deadline);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON public.tasks(created_at DESC);

-- 8. Seed Initial Data for Wazir Club (Replace or supplement as needed)
INSERT INTO public.tasks (title, description, vertical, assignees, status, priority, deadline, subtasks, resources)
VALUES
(
    'Independence Day Special Newsletter Release',
    'Finalize the editorial layout, lead editorial piece, and club President address for the national edition.',
    'Editorial',
    ARRAY['Avi', 'Ishika', 'Vishakha'],
    'Review',
    'Urgent',
    NOW() + INTERVAL '4 hours',
    '[
        {"id": "sub-1", "title": "Proofread draft articles & op-eds", "completed": true},
        {"id": "sub-2", "title": "Design Figma graphics & banner", "completed": true},
        {"id": "sub-3", "title": "Mailchimp template test blast", "completed": false}
    ]'::jsonb,
    ARRAY['https://figma.com/wazir-editorial', 'https://docs.google.com/document/d/wazir-newsletter']
),
(
    'Casebook 2026 - FinTech & Payments Market Deck',
    'Comprehensive market sizing, unit economics, and Porter 5 Forces analysis for digital banking sector deep dive.',
    'Casebook',
    ARRAY['Nandini', 'Harshvardhan', 'Somansha'],
    'In Progress',
    'High',
    NOW() + INTERVAL '18 hours',
    '[
        {"id": "sub-4", "title": "Compile secondary research on UPI 2.0", "completed": true},
        {"id": "sub-5", "title": "Build valuation & market size exhibits", "completed": false},
        {"id": "sub-6", "title": "Draft 3 case interview practice scenarios", "completed": false}
    ]'::jsonb,
    ARRAY['https://docs.google.com/presentation/d/casebook-fintech']
),
(
    'Apex Strategy Case Competition Rulebook & Case Release',
    'Draft problem statement with consulting partner firm and publish evaluation rubric on Unstop / D2C.',
    'Apex',
    ARRAY['Simar', 'Animesh', 'Akruti'],
    'In Progress',
    'Urgent',
    NOW() + INTERVAL '22 hours',
    '[
        {"id": "sub-7", "title": "Finalize problem statement with knowledge partner", "completed": true},
        {"id": "sub-8", "title": "Configure submission portal & deadlines", "completed": false},
        {"id": "sub-9", "title": "Send judge briefing invites", "completed": false}
    ]'::jsonb,
    ARRAY['https://unstop.com/wazir-apex-2026']
),
(
    'LinkedIn Campaign: "Consultant of the Month" Spotlight',
    'Design carousel post highlighting alumni placement at MBB and boutique consulting practices.',
    'Public Relations',
    ARRAY['Devanshi', 'Akruti'],
    'Backlog',
    'Medium',
    NOW() + INTERVAL '3 days',
    '[
        {"id": "sub-10", "title": "Collect alumni quote and bio", "completed": false},
        {"id": "sub-11", "title": "Canva layout adhering to club brand guide", "completed": false},
        {"id": "sub-12", "title": "Draft caption and hashtag strategy", "completed": false}
    ]'::jsonb,
    ARRAY['https://linkedin.com/company/wazir-consulting']
),
(
    'Tier-1 Corporate Sponsorship Pitch Deck for Annual Conclave',
    'Outreach deck targeting strategy consulting firms, venture funds, and FMCG corporate strategy teams.',
    'External Relations',
    ARRAY['Avi', 'Harshvardhan', 'Animesh'],
    'In Progress',
    'High',
    NOW() + INTERVAL '4 days',
    '[
        {"id": "sub-13", "title": "Update past footprint & reach statistics", "completed": true},
        {"id": "sub-14", "title": "Structure tiered sponsorship packages", "completed": true},
        {"id": "sub-15", "title": "Cold outreach list of 40 VP/Director contacts", "completed": false}
    ]'::jsonb,
    ARRAY['https://docs.google.com/spreadsheets/d/wazir-er-leads']
),
(
    'Consulting Workshop: Guesstimates & Market Sizing 101',
    'Speaker invitation and campus amphitheatre booking for the upcoming junior cohort boot camp.',
    'Events',
    ARRAY['Ishika', 'Simar', 'Devanshi'],
    'Completed',
    'Medium',
    NOW() - INTERVAL '1 day',
    '[
        {"id": "sub-16", "title": "Book Auditorium B with Admin", "completed": true},
        {"id": "sub-17", "title": "Print practice workbook sheets", "completed": true},
        {"id": "sub-18", "title": "Confirm Senior Consultant speaker travel", "completed": true}
    ]'::jsonb,
    ARRAY[]::TEXT[]
),
(
    'M&A Valuation Case Study Archive Curation',
    'Collate and sanitize real-world restructuring and buyout case notes from senior club alumni.',
    'Casebook',
    ARRAY['Vishakha', 'Somansha', 'Nandini'],
    'Backlog',
    'Low',
    NOW() + INTERVAL '7 days',
    '[
        {"id": "sub-19", "title": "Review 5 candidate case submissions", "completed": false},
        {"id": "sub-20", "title": "Format financial exhibits & appendices", "completed": false}
    ]'::jsonb,
    ARRAY[]::TEXT[]
);
