-- =========================================================================
-- PODAR INTERNATIONAL SCHOOL MUN (PMUN 2026-27) - COMPLETE SUPABASE DATABASE SETUP SCRIPT
-- Copy and paste this entire script into the Supabase SQL Editor to build/reset your database backend.
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create pmun_settings Table (stores role passwords & global config)
CREATE TABLE IF NOT EXISTS pmun_settings (
    key text PRIMARY KEY,
    value jsonb NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create committees Table (stores MUN committees details & grade categories)
CREATE TABLE IF NOT EXISTS committees (
    id text PRIMARY KEY, -- 'unep', 'un-women', 'fao', 'unhrc', 'unicef', 'ecosoc'
    name text NOT NULL,
    grade integer NOT NULL, -- Primary grade category
    description text,
    agenda text,
    eb_chair text,
    eb_vice_chair text,
    eb_rapporteur text,
    rules text,
    prepare_info text,
    resources jsonb DEFAULT '[]'::jsonb,
    schedule text,
    capacity integer DEFAULT 50 NOT NULL,
    status text DEFAULT 'OPEN' NOT NULL -- 'OPEN', 'CLOSING SOON', 'CLOSED'
);

-- 3. Create registrations Table (stores delegate registrations)
CREATE TABLE IF NOT EXISTS registrations (
    id text PRIMARY KEY,
    name text NOT NULL,
    grade integer NOT NULL, -- 7, 8, 9, 10
    section text NOT NULL, -- 'A', 'B', 'C', 'D', 'E'
    email text NOT NULL,
    phone text NOT NULL,
    school text NOT NULL,
    preferred_committee text NOT NULL,
    committee text DEFAULT 'NOT ASSIGNED' NOT NULL,
    assigned_country text DEFAULT 'NOT ASSIGNED' NOT NULL,
    status text DEFAULT 'NOT ASSIGNED' NOT NULL, -- 'NOT ASSIGNED', 'APPROVED', 'REJECTED'
    country_preferences jsonb,
    portfolio_preference text,
    mun_experience text,
    additional_info text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create countries Table (stores country allocation matrix per committee)
CREATE TABLE IF NOT EXISTS countries (
    id serial PRIMARY KEY,
    committee_id text NOT NULL,
    country_name text NOT NULL,
    category text NOT NULL, -- 'P5', 'G20', 'UN Member'
    available boolean DEFAULT true NOT NULL,
    assigned_to text,
    preference_count integer DEFAULT 0 NOT NULL,
    CONSTRAINT unique_committee_country UNIQUE (committee_id, country_name)
);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================
ALTER TABLE pmun_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE committees ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies if re-running
DROP POLICY IF EXISTS "Allow public read committees" ON committees;
DROP POLICY IF EXISTS "Allow coordinator update committees" ON committees;
DROP POLICY IF EXISTS "Allow public insert registrations" ON registrations;
DROP POLICY IF EXISTS "Allow select registrations" ON registrations;
DROP POLICY IF EXISTS "Allow coordinator modifications registrations" ON registrations;
DROP POLICY IF EXISTS "Allow coordinator select settings" ON pmun_settings;
DROP POLICY IF EXISTS "Allow coordinator update settings" ON pmun_settings;
DROP POLICY IF EXISTS "Allow public select countries" ON countries;
DROP POLICY IF EXISTS "Allow coordinator modifications countries" ON countries;

-- Create RLS Policies
CREATE POLICY "Allow public read committees" ON committees FOR SELECT USING (true);
CREATE POLICY "Allow coordinator update committees" ON committees FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public insert registrations" ON registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow select registrations" ON registrations FOR SELECT USING (true);
CREATE POLICY "Allow coordinator modifications registrations" ON registrations FOR ALL USING (true);

CREATE POLICY "Allow coordinator select settings" ON pmun_settings FOR SELECT USING (true);
CREATE POLICY "Allow coordinator update settings" ON pmun_settings FOR ALL USING (true);

CREATE POLICY "Allow public select countries" ON countries FOR SELECT USING (true);
CREATE POLICY "Allow coordinator modifications countries" ON countries FOR ALL USING (true);

-- =========================================================================
-- SECURE PASSWORD VERIFICATION FUNCTION (SECURITY DEFINER)
-- =========================================================================
CREATE OR REPLACE FUNCTION verify_portal_password(role_name text, input_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  stored_password text;
BEGIN
  SELECT (value->>role_name) INTO stored_password
  FROM pmun_settings
  WHERE key = 'passwords';

  IF stored_password IS NULL THEN
    IF role_name = 'delegate' AND input_password = 'delegate2026' THEN
      RETURN TRUE;
    ELSIF role_name = 'in_charge' AND input_password = 'staff2026' THEN
      RETURN TRUE;
    ELSIF role_name = 'coordinator' AND input_password = 'admin2026' THEN
      RETURN TRUE;
    ELSE
      RETURN FALSE;
    END IF;
  END IF;

  RETURN stored_password = input_password;
END;
$$;

-- =========================================================================
-- SEED DATA (PASSWORDS, SETTINGS & 6 COMMITTEES WITH GRADE RULES)
-- =========================================================================

-- Seed Passwords & Global Config
INSERT INTO pmun_settings (key, value) VALUES
('passwords', '{"delegate": "delegate2026", "in_charge": "staff2026", "coordinator": "admin2026"}'::jsonb),
('global_config', '{"allow_switch_committee": true, "registration_status": "OPEN", "deadline": "2026-10-31T23:59:59.000Z"}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Seed 6 Official Committees (UNEP, UN Women, FAO for Grades 7&8; UNHRC, UNICEF, ECOSOC for Grades 9&10)
INSERT INTO committees (id, name, grade, description, agenda, eb_chair, eb_vice_chair, eb_rapporteur, rules, prepare_info, resources, schedule, capacity, status) VALUES
(
  'unep',
  'United Nations Environment Programme (UNEP)',
  7,
  'UNEP coordinates the United Nations environmental activities, assisting developing countries in implementing environmentally sound policies and renewable energy adoption.',
  'Harnessing Solar Energy for Equitable Access and Clean Air',
  'Vihaan Patel',
  'Diya Mehta',
  'Arjun Rao',
  'Standard UN Rules of Procedure (RoP) apply. Formal debate consists of a General Speakers List (GSL), Moderated Caucuses, and Unmoderated Caucuses.',
  'Examine solar capacity metrics, climate financing systems, and clean energy technology transfer incentives. Draft a 1-page Position Paper.',
  '[{"title": "UNEP Background Guide 2026 (PDF)", "url": "/resources/unep_background_guide.pdf"}]'::jsonb,
  'Day 1 - Session 1: Opening & GSL Setup (9:00 AM - 12:30 PM) | Day 1 - Session 2: Moderated Caucus (1:30 PM - 4:00 PM) | Day 2 - Session 3: Resolution Drafting (9:00 AM - 12:00 PM) | Day 2 - Session 4: Voting & Closing Ceremony (1:00 PM - 3:30 PM)',
  50,
  'OPEN'
),
(
  'un-women',
  'UN Women',
  7,
  'UN Women is the UN entity dedicated to gender equality and the empowerment of women. This committee addresses international gender disparities and empowerment programs.',
  'Addressing Challenges to Women’s Rights and Empowerment',
  'Kiara Sen',
  'Rohan Joshi',
  'Aditya Patel',
  'Standard UN Rules of Procedure (RoP) apply. Respectful, inclusive diplomatic dialogue is strictly enforced.',
  'Examine national gender parity statistics, human rights conventions, and structural barriers facing women globally.',
  '[{"title": "UN Women Background Guide 2026 (PDF)", "url": "/resources/un_women_background_guide.pdf"}]'::jsonb,
  'Day 1 - Session 1: Opening & GSL Setup (9:00 AM - 12:30 PM) | Day 1 - Session 2: Moderated Caucus (1:30 PM - 4:00 PM) | Day 2 - Session 3: Resolution Drafting (9:00 AM - 12:00 PM) | Day 2 - Session 4: Voting & Closing Ceremony (1:00 PM - 3:30 PM)',
  50,
  'OPEN'
),
(
  'fao',
  'Food and Agriculture Organization (FAO)',
  8,
  'The FAO leads international efforts to defeat hunger and improve nutrition and food security globally in agrarian and crisis sectors.',
  'Addressing the Crisis of Food Insecurity in Conflict Areas',
  'Aarav Patel',
  'Sanya Gupta',
  'Rohan Sen',
  'Standard UN Rules of Procedure (RoP) apply. Logistics coordination and agrarian support policies are heavily valued.',
  'Explore food security metrics, supply disruption logistics, and relief frameworks in target conflict zones.',
  '[{"title": "FAO Background Guide 2026 (PDF)", "url": "/resources/fao_background_guide.pdf"}]'::jsonb,
  'Day 1 - Session 1: Opening & GSL Setup (9:00 AM - 12:30 PM) | Day 1 - Session 2: Moderated Caucus (1:30 PM - 4:00 PM) | Day 2 - Session 3: Resolution Drafting (9:00 AM - 12:00 PM) | Day 2 - Session 4: Voting & Closing Ceremony (1:00 PM - 3:30 PM)',
  50,
  'OPEN'
),
(
  'unhrc',
  'United Nations Human Rights Council (UNHRC)',
  9,
  'The UNHRC promotes and protects human rights globally. This session focuses on civil rights, freedom of speech, and digital rights during conflict operations.',
  'Protecting Digital Rights during Conflicts',
  'Dev Shah',
  'Rhea Kapoor',
  'Arjun Nair',
  'Standard UN Rules of Procedure (RoP) apply. Debate focuses on international humanitarian law, digital surveillance, and cyber conventions.',
  'Analyze your state policy on internet shutdowns in conflict areas, cyber sovereignty, and digital privacy.',
  '[{"title": "UNHRC Background Guide 2026 (PDF)", "url": "/resources/unhrc_background_guide.pdf"}]'::jsonb,
  'Day 1 - Session 1: Opening & GSL Setup (9:00 AM - 12:30 PM) | Day 1 - Session 2: Moderated Caucus (1:30 PM - 4:00 PM) | Day 2 - Session 3: Resolution Drafting (9:00 AM - 12:00 PM) | Day 2 - Session 4: Voting & Closing Ceremony (1:00 PM - 3:30 PM)',
  50,
  'OPEN'
),
(
  'unicef',
  'United Nations Children''s Fund (UNICEF)',
  9,
  'UNICEF provides humanitarian and developmental aid to children worldwide, advocating for their safety, education, and health.',
  'Impact of Foreign Aid Reductions on Global Child Healthcare',
  'Kabir Roy',
  'Isha Joshi',
  'Aanya Patel',
  'Standard UN Rules of Procedure (RoP) apply. High-stakes negotiation on funding deficits and healthcare infrastructure.',
  'Examine public healthcare funding, infant mortality trends, and structural consequences of international aid cuts.',
  '[{"title": "UNICEF Background Guide 2026 (PDF)", "url": "/resources/unicef_background_guide.pdf"}]'::jsonb,
  'Day 1 - Session 1: Opening & GSL Setup (9:00 AM - 12:30 PM) | Day 1 - Session 2: Moderated Caucus (1:30 PM - 4:00 PM) | Day 2 - Session 3: Resolution Drafting (9:00 AM - 12:00 PM) | Day 2 - Session 4: Voting & Closing Ceremony (1:00 PM - 3:30 PM)',
  50,
  'OPEN'
),
(
  'ecosoc',
  'Economic and Social Council (ECOSOC)',
  10,
  'ECOSOC deals with international economic, social, cultural, and development matters. This session addresses food supply chain resilience in digital marketplaces.',
  'Food Supply Chains in the Age of Online Commerce',
  'Aanya Sharma',
  'Kabir Mehta',
  'Sneha Iyer',
  'Standard UN Rules of Procedure (RoP) apply. Formal debate consists of GSL, Moderated Caucuses, and Unmoderated Caucuses.',
  'Research global food logistics, ecommerce trade dynamics, and market pricing transparency.',
  '[{"title": "ECOSOC Background Guide 2026 (PDF)", "url": "/resources/fao_background_guide.pdf"}]'::jsonb,
  'Day 1 - Session 1: Opening & GSL Setup (9:00 AM - 12:30 PM) | Day 1 - Session 2: Moderated Caucus (1:30 PM - 4:00 PM) | Day 2 - Session 3: Resolution Drafting (9:00 AM - 12:00 PM) | Day 2 - Session 4: Voting & Closing Ceremony (1:00 PM - 3:30 PM)',
  50,
  'OPEN'
)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  grade = EXCLUDED.grade,
  description = EXCLUDED.description,
  agenda = EXCLUDED.agenda,
  eb_chair = EXCLUDED.eb_chair,
  eb_vice_chair = EXCLUDED.eb_vice_chair,
  eb_rapporteur = EXCLUDED.eb_rapporteur,
  rules = EXCLUDED.rules,
  prepare_info = EXCLUDED.prepare_info,
  resources = EXCLUDED.resources,
  schedule = EXCLUDED.schedule,
  capacity = EXCLUDED.capacity,
  status = EXCLUDED.status;

-- Seed Sample Country Portfolios for all Committees
INSERT INTO countries (committee_id, country_name, category, available) VALUES
('unep', 'United States of America', 'P5', true),
('unep', 'United Kingdom', 'P5', true),
('unep', 'France', 'P5', true),
('unep', 'China', 'P5', true),
('unep', 'Russian Federation', 'P5', true),
('unep', 'India', 'G20', true),
('unep', 'Germany', 'G20', true),
('unep', 'Japan', 'G20', true),
('unep', 'Brazil', 'G20', true),
('unep', 'South Africa', 'G20', true),

('un-women', 'United States of America', 'P5', true),
('un-women', 'United Kingdom', 'P5', true),
('un-women', 'France', 'P5', true),
('un-women', 'India', 'G20', true),
('un-women', 'Germany', 'G20', true),

('fao', 'United States of America', 'P5', true),
('fao', 'India', 'G20', true),
('fao', 'Brazil', 'G20', true),
('fao', 'Canada', 'G20', true),

('unhrc', 'United States of America', 'P5', true),
('unhrc', 'United Kingdom', 'P5', true),
('unhrc', 'France', 'P5', true),
('unhrc', 'Germany', 'G20', true),
('unhrc', 'India', 'G20', true),

('unicef', 'United States of America', 'P5', true),
('unicef', 'United Kingdom', 'P5', true),
('unicef', 'India', 'G20', true),
('unicef', 'Japan', 'G20', true),

('ecosoc', 'United States of America', 'P5', true),
('ecosoc', 'China', 'P5', true),
('ecosoc', 'India', 'G20', true),
('ecosoc', 'Germany', 'G20', true)
ON CONFLICT (committee_id, country_name) DO NOTHING;
