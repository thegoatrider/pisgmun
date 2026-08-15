# PMUN Portal — Setup & Integration Guide

This is the official digital portal for **PMUN (Podar International School Model United Nations) 2026**. 

The application is built with **Vanilla HTML5, CSS3, and JavaScript**, ensuring high performance, zero build dependencies, and seamless integration with **Supabase**.

---

## ⚡ Quick Start (Local Run)

The application runs out-of-the-box using the built-in **Local Storage Mock Database** so you can test all features immediately.

1. Open your terminal and navigate to the project directory:
   ```bash
   cd /Users/ananyapandey/.gemini/antigravity/scratch/pmun-portal
   ```
2. Start the local Python development server:
   ```bash
   python3 -m http.server 8000
   ```
3. Open your browser and go to:
   ```
   http://localhost:8000
   ```

---

## 🔑 Default Portal Passwords (Mock Mode)

In Demo/Mock Mode, you can test the three separate access portals with the following passwords:

* **DELEGATE**: `delegate2026`
* **IN-CHARGE**: `staff2026`
* **COORDINATOR**: `admin2026`

---

## ☁️ Connecting to Supabase

To connect this portal to your live Supabase backend database, follow these steps:

### Step 1: Run the Database Schema
1. Open your [Supabase Dashboard](https://supabase.com/) and select your project.
2. Go to the **SQL Editor** tab on the left sidebar.
3. Click **New Query** and copy-paste the complete contents of [schema.sql](file:///Users/ananyapandey/.gemini/antigravity/scratch/pmun-portal/schema.sql).
4. Click **Run** to create all tables (`registrations`, `committees`, `pmun_settings`), enable Row Level Security (RLS) policies, insert initial seed datasets, and define the RPC verification function.

### Step 2: Add API Credentials to Frontend
1. In the Supabase project dashboard, navigate to **Project Settings** (gear icon) → **API**.
2. Retrieve your **Project URL** and the **Anon Public Key**.
3. Open [app.js](file:///Users/ananyapandey/.gemini/antigravity/scratch/pmun-portal/app.js) in your text editor.
4. Replace the credentials variables at the top of the file:
   ```javascript
   const SUPABASE_URL = "YOUR_SUPABASE_PROJECT_URL";
   const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_PUBLIC_KEY";
   ```
5. Save the file and reload your local web server. The yellow **Demo Mode** warning banner at the top of the page will disappear, indicating the portal is now successfully communicating with your live Supabase database!

---

## 🛡️ Security Architecture

To meet institutional security guidelines and protect participant data:
- **Shared Passwords**: Passwords are **never exposed in the frontend source code** nor queried directly by the client.
- **Database Function**: Verification is processed via a PostgreSQL Remote Procedure Call (RPC) function `verify_portal_password(role_name, input_password)` defined with `SECURITY DEFINER`.
- **Row Level Security (RLS)**: Row-level security is enabled on `pmun_settings`. The database passwords table is completely locked down, preventing anonymous clients from reading values. The RPC function bypasses this restriction securely on the database level, returning only a boolean `true`/`false`.
- **Coordinator Panel**: Settings (including passwords and deadlines) can be changed dynamically by the coordinator directly from the dashboard, writing changes back to the database.
