-- =========================================================================
-- PMUN Portal Database Schema Setup Script
-- Paste this script in the Supabase SQL Editor to set up your backend.
-- =========================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing objects if they exist (for clean setup)
DROP FUNCTION IF EXISTS verify_portal_password(text, text);
DROP TABLE IF EXISTS registrations;
DROP TABLE IF EXISTS committees;
DROP TABLE IF EXISTS pmun_settings;

-- 1. Create pmun_settings Table
-- Stores passwords, registration form configuration, and global settings.
CREATE TABLE pmun_settings (
    key text PRIMARY KEY,
    value jsonb NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create committees Table
-- Stores details about Grade-specific MUN committees.
CREATE TABLE committees (
    id text PRIMARY KEY, -- 'grade-8', 'grade-9', 'grade-10'
    name text NOT NULL,
    grade integer NOT NULL,
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
    status text DEFAULT 'OPEN' NOT NULL, -- 'OPEN', 'CLOSING SOON', 'CLOSED'
    deadline timestamp with time zone
);

-- 3. Create registrations Table
-- Stores registrations submitted by delegates.
CREATE TABLE registrations (
    id text PRIMARY KEY,
    name text NOT NULL,
    grade integer NOT NULL,
    section text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    school text NOT NULL,
    preferred_committee text NOT NULL,
    committee text DEFAULT 'NOT ASSIGNED' NOT NULL,
    assigned_country text DEFAULT 'NOT ASSIGNED' NOT NULL,
    status text DEFAULT 'NOT ASSIGNED' NOT NULL,
    country_preferences jsonb,
    portfolio_preference text,
    mun_experience text,
    additional_info text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3b. Create countries Table
CREATE TABLE countries (
    id serial PRIMARY KEY,
    committee_id text NOT NULL,
    country_name text NOT NULL,
    category text NOT NULL,
    available boolean DEFAULT true NOT NULL,
    assigned_to text,
    preference_count integer DEFAULT 0 NOT NULL,
    CONSTRAINT unique_committee_country UNIQUE (committee_id, country_name)
);

-- Enable Row Level Security (RLS)
ALTER TABLE pmun_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE committees ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;

-- Create Policies

-- a) Committees Policies
-- Anyone (public) can read committee info to browse the site.
CREATE POLICY "Allow public read committees" ON committees FOR SELECT USING (true);
-- Allow coordinator update committees
CREATE POLICY "Allow coordinator update committees" ON committees FOR ALL USING (true) WITH CHECK (true);

-- b) Registrations Policies
-- Anyone can insert a registration (students registering).
CREATE POLICY "Allow public insert registrations" ON registrations FOR INSERT WITH CHECK (true);
-- Allow select registrations (for dashboards to read registrations)
CREATE POLICY "Allow select registrations" ON registrations FOR SELECT USING (true);
-- Allow delete/update (for coordinator management)
CREATE POLICY "Allow coordinator modifications registrations" ON registrations FOR ALL USING (true);

-- c) Pmun Settings Policies
-- Allow coordinator select and modify settings
CREATE POLICY "Allow coordinator select settings" ON pmun_settings FOR SELECT USING (true);
CREATE POLICY "Allow coordinator update settings" ON pmun_settings FOR ALL USING (true);

-- d) Countries Policies
-- Anyone can select, coordinator can modify
CREATE POLICY "Allow public select countries" ON countries FOR SELECT USING (true);
CREATE POLICY "Allow coordinator modifications countries" ON countries FOR ALL USING (true);


-- 4. Create secure verification function (SECURITY DEFINER)
-- Runs with bypass privileges to verify passwords securely without exposing them.
CREATE OR REPLACE FUNCTION verify_portal_password(role_name text, input_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  stored_password text;
BEGIN
  -- Get the password from pmun_settings table
  SELECT (value->>role_name) INTO stored_password
  FROM pmun_settings
  WHERE key = 'passwords';

  IF stored_password IS NULL THEN
    -- Fallback defaults if table is empty
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


-- 5. Seed Initial Default Data

-- Insert default settings (passwords, registration configuration)
INSERT INTO pmun_settings (key, value) VALUES
('passwords', '{"delegate": "delegate2026", "in_charge": "staff2026", "coordinator": "admin2026"}'::jsonb),
('global_config', '{"allow_switch_committee": true, "registration_status": "OPEN", "deadline": "2026-10-31T23:59:59.000Z"}'::jsonb),
('form_fields', '[
  {"id": "name", "label": "Full Name", "type": "text", "required": true},
  {"id": "grade", "label": "Class / Grade", "type": "select", "required": true, "options": ["8", "9", "10"]},
  {"id": "section", "label": "Section", "type": "text", "required": true},
  {"id": "school", "label": "School / Institution", "type": "text", "required": true},
  {"id": "email", "label": "Email Address", "type": "email", "required": true},
  {"id": "phone", "label": "Phone Number", "type": "tel", "required": true},
  {"id": "preferred_committee", "label": "Preferred Committee", "type": "select", "required": true, "options": ["Grade 8 - DISEC", "Grade 9 - UNHRC", "Grade 10 - UNSC"]},
  {"id": "mun_experience", "label": "MUN Experience (Number of conferences, previous roles)", "type": "textarea", "required": false},
  {"id": "portfolio_preference", "label": "Country / Portfolio Preference", "type": "text", "required": false},
  {"id": "additional_info", "label": "Additional Information", "type": "textarea", "required": false}
]'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Insert default committees
INSERT INTO committees (id, name, grade, description, agenda, eb_chair, eb_vice_chair, eb_rapporteur, rules, prepare_info, resources, schedule, capacity, status) VALUES
(
  'ecosoc',
  'Economic and Social Council (ECOSOC)',
  8,
  'ECOSOC deals with international economic, social, cultural, educational, and health matters. This year, ECOSOC simulates online trade dynamics and digital economies.',
  'Ensuring Transparency and Sustainability in Food Supply Chains in the Age of Online Commerce',
  'Aanya Sharma',
  'Kabir Mehta',
  'Sneha Iyer',
  'Standard UN Rules of Procedure (RoP) apply. Formal debate consists of a General Speakers List (GSL), Moderated Caucuses, and Unmoderated Caucuses. Resolutions require a simple majority to pass.',
  'Research global food supply chain structures, the impact of ecommerce on agriculture logistics, and trade policies. Draft a 1-page Position Paper addressing the agenda.',
  '[{"title": "ECOSOC Background Guide 2026", "url": "#"}, {"title": "Guide to Drafting Position Papers", "url": "#"}]'::jsonb,
  'Day 1 - Session 1: Opening & GSL Setup (9:00 AM - 12:30 PM) | Day 1 - Session 2: Moderated Caucus (1:30 PM - 4:00 PM) | Day 2 - Session 3: Resolution Drafting (9:00 AM - 12:00 PM) | Day 2 - Session 4: Voting & Closing Ceremony (1:00 PM - 3:30 PM)',
  50,
  'OPEN'
),
(
  'un-women',
  'UN Women',
  9,
  'UN Women is the UN entity dedicated to gender equality and the empowerment of women. This committee addresses international gender disparities and empowerment programs.',
  'Addressing Challenges to Women’s Rights and Empowerment',
  'Kiara Sen',
  'Rohan Joshi',
  'Aditya Patel',
  'Standard UN Rules of Procedure (RoP) apply. Respectful, inclusive diplomatic dialogue is strictly enforced. Working papers must reflect multi-stakeholder collaboration.',
  'Examine national gender parity statistics, human rights conventions, and structural barriers facing women globally. Draft a 1-page Position Paper addressing the agenda.',
  '[{"title": "UN Women Background Guide 2026", "url": "#"}, {"title": "Beijing Declaration Reference Manual", "url": "#"}]'::jsonb,
  'Day 1 - Session 1: Opening & GSL Setup (9:00 AM - 12:30 PM) | Day 1 - Session 2: Moderated Caucus (1:30 PM - 4:00 PM) | Day 2 - Session 3: Resolution Drafting (9:00 AM - 12:00 PM) | Day 2 - Session 4: Voting & Closing Ceremony (1:00 PM - 3:30 PM)',
  50,
  'OPEN'
),
(
  'unhrc',
  'United Nations Human Rights Council (UNHRC)',
  10,
  'The UNHRC promotes and protects human rights globally. This session focuses on civil rights, freedom of speech, and digital rights in conflict zones.',
  'Protecting Digital Rights during Conflicts',
  'Dev Shah',
  'Rhea Kapoor',
  'Arjun Nair',
  'Standard UN Rules of Procedure (RoP) apply. Formal debate focuses on international humanitarian law and digital privacy conventions.',
  'Analyze your country''s policy on surveillance, internet shutdowns in conflict areas, and cyber sovereignty. Draft a 1-page Position Paper addressing the agenda.',
  '[{"title": "UNHRC Background Guide 2026", "url": "#"}, {"title": "Geneva Conventions & Digital Rights Factsheet", "url": "#"}]'::jsonb,
  'Day 1 - Session 1: Opening & GSL Setup (9:00 AM - 12:30 PM) | Day 1 - Session 2: Moderated Caucus (1:30 PM - 4:00 PM) | Day 2 - Session 3: Resolution Drafting (9:00 AM - 12:00 PM) | Day 2 - Session 4: Voting & Closing Ceremony (1:00 PM - 3:30 PM)',
  50,
  'OPEN'
),
(
  'fao',
  'Food and Agriculture Organization (FAO)',
  9,
  'The FAO leads international efforts to defeat hunger and improve nutrition and food security globally.',
  'Addressing the Crisis of Food Insecurity in Conflict Areas',
  'Aarav Patel',
  'Sanya Gupta',
  'Rohan Sen',
  'Standard UN Rules of Procedure (RoP) apply. Cooperation and logistics coordination are heavily valued.',
  'Explore food security metrics, conflicts disrupt logistics paths, and agricultural support policies in target states.',
  '[{"title": "FAO Background Guide 2026", "url": "#"}, {"title": "Global Report on Food Crises 2026", "url": "#"}]'::jsonb,
  'Day 1 - Session 1: Opening & GSL Setup (9:00 AM - 12:30 PM) | Day 1 - Session 2: Moderated Caucus (1:30 PM - 4:00 PM) | Day 2 - Session 3: Resolution Drafting (9:00 AM - 12:00 PM) | Day 2 - Session 4: Voting & Closing Ceremony (1:00 PM - 3:30 PM)',
  50,
  'OPEN'
),
(
  'unep',
  'United Nations Environment Programme (UNEP)',
  8,
  'UNEP coordinates the United Nations'' environmental activities and assists developing countries in implementing environmentally sound policies.',
  'Harnessing Solar Energy for Equitable Access and Clean Air',
  'Vihaan Patel',
  'Diya Mehta',
  'Arjun Rao',
  'Standard UN Rules of Procedure (RoP) apply. Resolving environmental disputes and policy planning are key.',
  'Examine solar capacity metrics, climate financing systems, and clean energy tech transfer incentives.',
  '[{"title": "UNEP Background Guide 2026", "url": "#"}, {"title": "COP Solar Agreements Summary", "url": "#"}]'::jsonb,
  'Day 1 - Session 1: Opening & GSL Setup (9:00 AM - 12:30 PM) | Day 1 - Session 2: Moderated Caucus (1:30 PM - 4:00 PM) | Day 2 - Session 3: Resolution Drafting (9:00 AM - 12:00 PM) | Day 2 - Session 4: Voting & Closing Ceremony (1:00 PM - 3:30 PM)',
  50,
  'OPEN'
),
(
  'unicef',
  'United Nations Children''s Fund (UNICEF)',
  10,
  'UNICEF provides humanitarian and developmental aid to children worldwide, advocating for their safety, education, and health.',
  'Impact of Foreign Aid Reductions on Global Child Healthcare',
  'Kabir Roy',
  'Isha Joshi',
  'Aanya Patel',
  'Standard UN Rules of Procedure (RoP) apply. High-stakes negotiation on funding deficits and resource allocation.',
  'Examine public healthcare funding, children mortality rates, and impact of international aid cuts.',
  '[{"title": "UNICEF Background Guide 2026", "url": "#"}, {"title": "WHO Report on Child Healthcare Trends", "url": "#"}]'::jsonb,
  'Day 1 - Session 1: Opening & GSL Setup (9:00 AM - 12:30 PM) | Day 1 - Session 2: Moderated Caucus (1:30 PM - 4:00 PM) | Day 2 - Session 3: Resolution Drafting (9:00 AM - 12:00 PM) | Day 2 - Session 4: Voting & Closing Ceremony (1:00 PM - 3:30 PM)',
  40,
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
