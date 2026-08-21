import os
import sys
import re
import json
import time

# Resolve dependencies from workspace packages directory if running locally
# (Vercel builds packages for its own Linux runtime from requirements.txt, loading local macOS packages will crash the serverless function)
if 'VERCEL' not in os.environ:
    packages_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'packages')
    if os.path.exists(packages_path):
        sys.path.insert(0, packages_path)

import bcrypt
import requests
from flask import Flask, request, jsonify, session, send_from_directory
from dotenv import load_dotenv

# Load env variables from .env file
load_dotenv()

app = Flask(__name__, static_folder='.', static_url_path='')
app.secret_key = os.environ.get('SESSION_SECRET', 'pismun2026_default_secret_99f3b20c1a')

# Cookie security settings
app.config.update(
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE='Lax',
)

SUPABASE_URL = os.environ.get('SUPABASE_URL', '').strip()
SUPABASE_KEY = os.environ.get('SUPABASE_KEY', '').strip()
IS_DEMO_MODE = os.environ.get('FORCE_DEMO_MODE', 'false').lower() == 'true' or not (SUPABASE_URL and SUPABASE_KEY)

MOCK_DB_PATH = 'mock_db.json'

# --- DEFAULT DATASETS ---
DB_DEFAULT_COMMITTEES = {
  "unep": {
    "id": "unep",
    "name": "United Nations Environment Programme (UNEP)",
    "grade": 7,
    "description": "UNEP coordinates the United Nations environmental activities, assisting developing countries in implementing environmentally sound policies and renewable energy adoption.",
    "agenda": "Harnessing Solar Energy for Equitable Access and Clean Air",
    "eb_chair": "Pending", "eb_vice_chair": "Pending", "eb_rapporteur": "Pending",
    "rules": "Standard UN Rules of Procedure (RoP) apply. Formal debate consists of a General Speakers List (GSL), Moderated Caucuses, and Unmoderated Caucuses.",
    "prepare_info": "Examine solar capacity metrics, climate financing systems, and clean energy technology transfer incentives. Draft a 1-page Position Paper.",
    "resources": [{"title": "UNEP Background Guide 2026 (PDF)", "url": "/resources/unep_background_guide.pdf"}],
    "schedule": "Day 1 - Session 1: Opening & GSL Setup (9:00 AM - 12:30 PM) | Day 1 - Session 2: Moderated Caucus (1:30 PM - 4:00 PM) | Day 2 - Session 3: Resolution Drafting (9:00 AM - 12:00 PM) | Day 2 - Session 4: Voting & Closing Ceremony (1:00 PM - 3:30 PM)",
    "capacity": 50, "status": "OPEN"
  },
  "un-women": {
    "id": "un-women",
    "name": "UN Women",
    "grade": 7,
    "description": "UN Women is the UN entity dedicated to gender equality and the empowerment of women. This committee addresses international gender disparities and empowerment programs.",
    "agenda": "Addressing Challenges to Women’s Rights and Empowerment",
    "eb_chair": "Pending", "eb_vice_chair": "Pending", "eb_rapporteur": "Pending",
    "rules": "Standard UN Rules of Procedure (RoP) apply. Respectful, inclusive diplomatic dialogue is strictly enforced.",
    "prepare_info": "Examine national gender parity statistics, human rights conventions, and structural barriers facing women globally.",
    "resources": [{"title": "UN Women Background Guide 2026 (PDF)", "url": "/resources/un_women_background_guide.pdf"}],
    "schedule": "Day 1 - Session 1: Opening & GSL Setup (9:00 AM - 12:30 PM) | Day 1 - Session 2: Moderated Caucus (1:30 PM - 4:00 PM) | Day 2 - Session 3: Resolution Drafting (9:00 AM - 12:00 PM) | Day 2 - Session 4: Voting & Closing Ceremony (1:00 PM - 3:30 PM)",
    "capacity": 50, "status": "OPEN"
  },
  "fao": {
    "id": "fao",
    "name": "Food and Agriculture Organization (FAO)",
    "grade": 8,
    "description": "The FAO leads international efforts to defeat hunger and improve nutrition and food security globally in agrarian and crisis sectors.",
    "agenda": "Addressing the Crisis of Food Insecurity in Conflict Areas",
    "eb_chair": "Pending", "eb_vice_chair": "Pending", "eb_rapporteur": "Pending",
    "rules": "Standard UN Rules of Procedure (RoP) apply. Logistics coordination and agrarian support policies are heavily valued.",
    "prepare_info": "Explore food security metrics, supply disruption logistics, and relief frameworks in target conflict zones.",
    "resources": [{"title": "FAO Background Guide 2026 (PDF)", "url": "/resources/fao_background_guide.pdf"}],
    "schedule": "Day 1 - Session 1: Opening & GSL Setup (9:00 AM - 12:30 PM) | Day 1 - Session 2: Moderated Caucus (1:30 PM - 4:00 PM) | Day 2 - Session 3: Resolution Drafting (9:00 AM - 12:00 PM) | Day 2 - Session 4: Voting & Closing Ceremony (1:00 PM - 3:30 PM)",
    "capacity": 50, "status": "OPEN"
  },
  "unhrc": {
    "id": "unhrc",
    "name": "United Nations Human Rights Council (UNHRC)",
    "grade": 9,
    "description": "The UNHRC promotes and protects human rights globally. This session focuses on civil rights, freedom of speech, and digital rights during conflict operations.",
    "agenda": "Protecting Digital Rights during Conflicts",
    "eb_chair": "Pending", "eb_vice_chair": "Pending", "eb_rapporteur": "Pending",
    "rules": "Standard UN Rules of Procedure (RoP) apply. Debate focuses on international humanitarian law, digital surveillance, and cyber conventions.",
    "prepare_info": "Analyze your state policy on internet shutdowns in conflict areas, cyber surveillance, and digital privacy.",
    "resources": [{"title": "UNHRC Background Guide 2026 (PDF)", "url": "/resources/unhrc_background_guide.pdf"}],
    "schedule": "Day 1 - Session 1: Opening & GSL Setup (9:00 AM - 12:30 PM) | Day 1 - Session 2: Moderated Caucus (1:30 PM - 4:00 PM) | Day 2 - Session 3: Resolution Drafting (9:00 AM - 12:00 PM) | Day 2 - Session 4: Voting & Closing Ceremony (1:00 PM - 3:30 PM)",
    "capacity": 50, "status": "OPEN"
  },
  "unicef": {
    "id": "unicef",
    "name": "United Nations Children's Fund (UNICEF)",
    "grade": 9,
    "description": "UNICEF provides humanitarian and developmental aid to children worldwide, advocating for their safety, education, and health.",
    "agenda": "Impact of Foreign Aid Reductions on Global Child Healthcare",
    "eb_chair": "Pending", "eb_vice_chair": "Pending", "eb_rapporteur": "Pending",
    "rules": "Standard UN Rules of Procedure (RoP) apply. High-stakes negotiation on funding deficits and healthcare infrastructure.",
    "prepare_info": "Examine public healthcare funding, infant mortality trends, and structural consequences of international aid cuts.",
    "resources": [{"title": "UNICEF Background Guide 2026 (PDF)", "url": "/resources/unicef_background_guide.pdf"}],
    "schedule": "Day 1 - Session 1: Opening & GSL Setup (9:00 AM - 12:30 PM) | Day 1 - Session 2: Moderated Caucus (1:30 PM - 4:00 PM) | Day 2 - Session 3: Resolution Drafting (9:00 AM - 12:00 PM) | Day 2 - Session 4: Voting & Closing Ceremony (1:00 PM - 3:30 PM)",
    "capacity": 50, "status": "OPEN"
  },
  "ecosoc": {
    "id": "ecosoc",
    "name": "Economic and Social Council (ECOSOC)",
    "grade": 10,
    "description": "ECOSOC deals with international economic, social, cultural, and development matters. This session addresses food supply chain resilience in digital marketplaces.",
    "agenda": "Food Supply Chains in the Age of Online Commerce",
    "eb_chair": "Pending", "eb_vice_chair": "Pending", "eb_rapporteur": "Pending",
    "rules": "Standard UN Rules of Procedure (RoP) apply. Formal debate consists of GSL, Moderated Caucuses, and Unmoderated Caucuses.",
    "prepare_info": "Research global food logistics, ecommerce trade dynamics, and market pricing transparency.",
    "resources": [{"title": "ECOSOC Background Guide 2026 (PDF)", "url": "/resources/fao_background_guide.pdf"}],
    "schedule": "Day 1 - Session 1: Opening & GSL Setup (9:00 AM - 12:30 PM) | Day 1 - Session 2: Moderated Caucus (1:30 PM - 4:00 PM) | Day 2 - Session 3: Resolution Drafting (9:00 AM - 12:00 PM) | Day 2 - Session 4: Voting & Closing Ceremony (1:00 PM - 3:30 PM)",
    "capacity": 50, "status": "OPEN"
  }
}

# Load static 180 countries array
def get_default_countries():
    # Helper to generate the static list of 180 countries
    countries = []
    # UNEP
    for c in ["Germany", "France", "Norway", "Denmark", "Australia", "Japan"]:
        countries.append({"committee_id": "unep", "country_name": c, "category": "Renewable-energy leaders / potential technical donors"})
    for c in ["Kenya", "Nigeria", "Ethiopia", "Tanzania", "Uganda", "Bangladesh"]:
        countries.append({"committee_id": "unep", "country_name": c, "category": "Developing countries seeking greater energy access"})
    for c in ["India", "China", "Brazil", "South Africa", "Indonesia", "Vietnam"]:
        countries.append({"committee_id": "unep", "country_name": c, "category": "Emerging / large stakeholder countries"})
    for c in ["USA", "Saudi Arabia", "Russia", "UAE", "Canada", "Iraq"]:
        countries.append({"committee_id": "unep", "country_name": c, "category": "Fossil-fuel heavy / transition challenge countries"})
    for c in ["Switzerland", "New Zealand", "Singapore", "Costa Rica", "Iceland", "Sweden"]:
        countries.append({"committee_id": "unep", "country_name": c, "category": "Neutral / technology observer countries"})
    # UNICEF
    for c in ["USA", "UK", "Sweden", "Japan", "Norway", "Germany", "France"]:
        countries.append({"committee_id": "unicef", "country_name": c, "category": "Major donor countries"})
    for c in ["India", "Nigeria", "Pakistan", "Ethiopia", "Bangladesh", "Kenya"]:
        countries.append({"committee_id": "unicef", "country_name": c, "category": "Large recipient / implementation countries"})
    for c in ["Yemen", "South Sudan", "Syria", "Afghanistan", "Somalia", "Haiti"]:
        countries.append({"committee_id": "unicef", "country_name": c, "category": "Aid-dependent / highly vulnerable countries"})
    for c in ["South Africa", "Brazil", "Egypt", "Indonesia", "Vietnam", "Ghana"]:
        countries.append({"committee_id": "unicef", "country_name": c, "category": "Developing / transition-risk countries"})
    for c in ["Switzerland", "Singapore", "New Zealand", "Canada", "Australia", "Austria"]:
        countries.append({"committee_id": "unicef", "country_name": c, "category": "Balancing / neutral observers"})
    # FAO
    for c in ["USA", "Canada", "France", "Germany", "Australia", "Netherlands"]:
        countries.append({"committee_id": "fao", "country_name": c, "category": "Major agricultural exporters / aid donors"})
    for c in ["Yemen", "South Sudan", "Syria", "Afghanistan", "Somalia", "Sudan"]:
        countries.append({"committee_id": "fao", "country_name": c, "category": "Conflict-affected / food crisis zones"})
    for c in ["Egypt", "Nigeria", "Pakistan", "Bangladesh", "Ethiopia", "Kenya"]:
        countries.append({"committee_id": "fao", "country_name": c, "category": "Net food-importing developing nations"})
    for c in ["India", "China", "Brazil", "Russia", "Argentina", "Ukraine"]:
        countries.append({"committee_id": "fao", "country_name": c, "category": "Major global producers / supply stakeholders"})
    for c in ["Switzerland", "New Zealand", "Japan", "Singapore", "Norway", "Sweden"]:
        countries.append({"committee_id": "fao", "country_name": c, "category": "Neutral / policy observers"})
    # UNHRC
    for c in ["USA", "UK", "France", "Germany", "Japan", "Canada"]:
        countries.append({"committee_id": "unhrc", "country_name": c, "category": "Western / tech regulation advocates"})
    for c in ["Russia", "China", "Iran", "North Korea", "Syria", "Venezuela"]:
        countries.append({"committee_id": "unhrc", "country_name": c, "category": "State sovereignty / strict digital control advocates"})
    for c in ["Ukraine", "Palestine", "Taiwan", "Yemen", "Myanmar", "Sudan"]:
        countries.append({"committee_id": "unhrc", "country_name": c, "category": "Active conflict / human rights focus zones"})
    for c in ["India", "Brazil", "South Africa", "Nigeria", "Indonesia", "Mexico"]:
        countries.append({"committee_id": "unhrc", "country_name": c, "category": "Global South / balancing voices"})
    for c in ["Switzerland", "Sweden", "Norway", "New Zealand", "Singapore", "Finland"]:
        countries.append({"committee_id": "unhrc", "country_name": c, "category": "Neutral / civil rights advocates"})
    # UN Women
    for c in ["Sweden", "Norway", "Finland", "Denmark", "Canada", "Iceland"]:
        countries.append({"committee_id": "un-women", "country_name": c, "category": "Feminist foreign policy / donor nations"})
    for c in ["Afghanistan", "Yemen", "Somalia", "South Sudan", "Sudan", "DR Congo"]:
        countries.append({"committee_id": "un-women", "country_name": c, "category": "Conflict / high gender disparity zones"})
    for c in ["India", "Nigeria", "Pakistan", "Bangladesh", "Egypt", "Ethiopia"]:
        countries.append({"committee_id": "un-women", "country_name": c, "category": "Developing countries with gender reform agendas"})
    for c in ["Brazil", "South Africa", "Mexico", "Indonesia", "Vietnam", "Ghana"]:
        countries.append({"committee_id": "un-women", "country_name": c, "category": "Emerging / regional policy leaders"})
    for c in ["Switzerland", "New Zealand", "Singapore", "Australia", "Austria", "Ireland"]:
        countries.append({"committee_id": "un-women", "country_name": c, "category": "Neutral / human rights advocates"})
    # ECOSOC
    for c in ["USA", "Germany", "UK", "Japan", "France", "China"]:
        countries.append({"committee_id": "ecosoc", "country_name": c, "category": "Global ecommerce / digital trade giants"})
    for c in ["India", "Brazil", "South Africa", "Nigeria", "Indonesia", "Vietnam"]:
        countries.append({"committee_id": "ecosoc", "country_name": c, "category": "Emerging economies / transition logistics hubs"})
    for c in ["Kenya", "Bangladesh", "Ethiopia", "Ghana", "Peru", "Morocco"]:
        countries.append({"committee_id": "ecosoc", "country_name": c, "category": "Developing nations scaling ecommerce networks"})
    for c in ["Yemen", "South Sudan", "Afghanistan", "Haiti", "Somalia", "Nepal"]:
        countries.append({"committee_id": "ecosoc", "country_name": c, "category": "LDCs facing supply chain exclusion"})
    for c in ["Switzerland", "Singapore", "Norway", "New Zealand", "Denmark", "Austria"]:
        countries.append({"committee_id": "ecosoc", "country_name": c, "category": "Neutral / regulatory standards observers"})
    return countries

# Default passwords hashes
DEFAULT_HASHES = {
    "coordinator": os.environ.get('HASH_COORDINATOR', '$2b$12$w.VDxvOi5zhPNLXYn7YY1uHcEePq/A7ZEEtUyBGoEleoGrUZSdQhK'),
    "in_charge_8": os.environ.get('HASH_IN_CHARGE_8', '$2b$12$/ViKaD0luhS1VP8Vjgg7UewRHNGTLkiMLYs5nv/rMyGP40Axtmr1i'),
    "in_charge_9": os.environ.get('HASH_IN_CHARGE_9', '$2b$12$IMYedFHqwK4VABa/RmPzLe700BXkpFO2U5XZqnwaZGta4OjIU/klO'),
    "in_charge_10": os.environ.get('HASH_IN_CHARGE_10', '$2b$12$oH.1Uu3GwZbNRSNfb6IVLOuhWZUK3GJDVyvuHyOvlEYyc6E7aEzXW'),
    "delegate": bcrypt.hashpw(b"delegate2026", bcrypt.gensalt()).decode()
}

# --- SERVER SIDE STATE (FALLBACK DEMO MODE) ---
if IS_DEMO_MODE:
    print("PMUN Portal: Running in server-side Local Demo Mode.")
    if not os.path.exists(MOCK_DB_PATH):
        # Create base mockup JSON
        mock_data = {
            "config": {
                "registration_status": "OPEN",
                "deadline": "2026-09-01T00:00:00Z",
                "allow_switch_committee": False
            },
            "passwords": {},
            "committees": [DB_DEFAULT_COMMITTEES[k] for k in DB_DEFAULT_COMMITTEES],
            "countries": [],
            "registrations": []
        }
        # Populate countries
        default_countries = get_default_countries()
        for idx, c in enumerate(default_countries, 1):
            mock_data["countries"].append({
                "id": idx,
                "committee_id": c["committee_id"],
                "country_name": c["country_name"],
                "category": c["category"],
                "available": True,
                "assigned_to": None,
                "preference_count": 0
            })
        with open(MOCK_DB_PATH, 'w', encoding='utf-8') as f:
            json.dump(mock_data, f, indent=2)

def read_mock():
    if not os.path.exists(MOCK_DB_PATH):
        return {}
    with open(MOCK_DB_PATH, 'r', encoding='utf-8') as f:
        return json.load(f)

def write_mock(data):
    with open(MOCK_DB_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)


# --- RATE LIMITING MIDDLEWARE ---
IP_LIMITS = {}
def is_rate_limited():
    ip = request.remote_addr
    # Bypasses rate limits for local development and loopback requests
    if ip in ('127.0.0.1', 'localhost', '::1'):
        return False
        
    now = time.time()
    if ip not in IP_LIMITS:
        IP_LIMITS[ip] = []
    
    # Keep request history for last 60 seconds
    IP_LIMITS[ip] = [t for t in IP_LIMITS[ip] if now - t < 60]
    
    if len(IP_LIMITS[ip]) >= 300:  # Allow up to 300 requests per minute for other clients
        return True
    
    IP_LIMITS[ip].append(now)
    return False

@app.before_request
def check_limits():
    if is_rate_limited():
        return jsonify({"error": "Too many requests. Please try again later."}), 429


# --- SUPABASE DATABASE WRAPPERS ---
def get_supabase_headers():
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }

def db_get_config():
    if IS_DEMO_MODE:
        return read_mock().get("config", {})
    else:
        url = f"{SUPABASE_URL}/rest/v1/config?key=eq.global_settings"
        res = requests.get(url, headers=get_supabase_headers())
        if res.status_code == 200 and res.json():
            return res.json()[0].get("value", {})
        # Seed default
        default_val = {"registration_status": "OPEN", "deadline": "2026-09-01T00:00:00Z", "allow_switch_committee": False}
        db_save_config(default_val)
        return default_val

def db_save_config(config_val):
    if IS_DEMO_MODE:
        data = read_mock()
        data["config"] = config_val
        write_mock(data)
        return True
    else:
        url = f"{SUPABASE_URL}/rest/v1/config?key=eq.global_settings"
        payload = {"key": "global_settings", "value": config_val, "updated_at": "now()"}
        res = requests.post(url, headers=get_supabase_headers(), json=payload)
        return res.status_code in (200, 201)

def db_get_passwords():
    if IS_DEMO_MODE:
        return read_mock().get("passwords", {})
    else:
        url = f"{SUPABASE_URL}/rest/v1/config?key=eq.passwords"
        res = requests.get(url, headers=get_supabase_headers())
        if res.status_code == 200 and res.json():
            return res.json()[0].get("value", {})
        return {}

def db_save_passwords(passwords_val):
    if IS_DEMO_MODE:
        data = read_mock()
        data["passwords"] = passwords_val
        write_mock(data)
        return True
    else:
        url = f"{SUPABASE_URL}/rest/v1/config?key=eq.passwords"
        payload = {"key": "passwords", "value": passwords_val, "updated_at": "now()"}
        res = requests.post(url, headers=get_supabase_headers(), json=payload)
        return res.status_code in (200, 201)

def db_get_committees():
    if IS_DEMO_MODE:
        return read_mock().get("committees", [])
    else:
        url = f"{SUPABASE_URL}/rest/v1/committees"
        res = requests.get(url, headers=get_supabase_headers())
        if res.status_code == 200 and res.json():
            return res.json()
        # Seed default committees
        seed = [DB_DEFAULT_COMMITTEES[k] for k in DB_DEFAULT_COMMITTEES]
        requests.post(url, headers=get_supabase_headers(), json=seed)
        return seed

def db_update_committee(comm_id, update_data):
    if IS_DEMO_MODE:
        data = read_mock()
        idx = next((i for i, c in enumerate(data["committees"]) if c["id"] == comm_id), -1)
        if idx != -1:
            data["committees"][idx].update(update_data)
            write_mock(data)
            return True
        return False
    else:
        url = f"{SUPABASE_URL}/rest/v1/committees?id=eq.{comm_id}"
        res = requests.patch(url, headers=get_supabase_headers(), json=update_data)
        return res.status_code in (200, 204)

def db_get_countries():
    # 1. Fetch countries
    if IS_DEMO_MODE:
        countries = read_mock().get("countries", [])
    else:
        url = f"{SUPABASE_URL}/rest/v1/countries"
        res = requests.get(url, headers=get_supabase_headers())
        if res.status_code == 200 and res.json():
            countries = res.json()
        else:
            # Seed countries
            seed = get_default_countries()
            formatted = [{
                "committee_id": c["committee_id"],
                "country_name": c["country_name"],
                "category": c["category"],
                "available": True,
                "assigned_to": None,
                "preference_count": 0
            } for c in seed]
            requests.post(url, headers=get_supabase_headers(), json=formatted)
            # Fetch again
            res = requests.get(url, headers=get_supabase_headers())
            countries = res.json() if res.status_code == 200 else []

    # 2. Fetch all registrations to dynamically calculate availability
    if IS_DEMO_MODE:
        registrations = read_mock().get("registrations", [])
    else:
        url_regs = f"{SUPABASE_URL}/rest/v1/registrations"
        res_regs = requests.get(url_regs, headers=get_supabase_headers())
        registrations = res_regs.json() if res_regs.status_code == 200 and isinstance(res_regs.json(), list) else []

    # 3. Filter active registrations (ignoring REJECTED ones)
    active_regs = [r for r in registrations if r.get("status") != "REJECTED"]

    # 4. Map taken countries: key=(committee_id.lower(), country_name.lower()) -> registration_id
    taken_countries = {}
    for r in active_regs:
        reg_id = r.get("id")
        assigned_c = r.get("assigned_country")
        assigned_comm = r.get("committee")

        if assigned_c and assigned_c != "NOT ASSIGNED":
            comm = assigned_comm or r.get("preferred_committee", "")
            if comm:
                taken_countries[(comm.lower(), assigned_c.lower())] = reg_id
        else:
            prefs = r.get("country_preferences", [])
            pref_comm = r.get("preferred_committee", "")
            if prefs and pref_comm:
                pref_c = prefs[0]
                taken_countries[(pref_comm.lower(), pref_c.lower())] = reg_id

    # 5. Dynamically calculate availability for each country
    for c in countries:
        comm_id = c.get("committee_id", "").lower()
        c_name = c.get("country_name", "").lower()
        if (comm_id, c_name) in taken_countries:
            c["available"] = False
            c["assigned_to"] = taken_countries[(comm_id, c_name)]
        else:
            c["available"] = True
            c["assigned_to"] = None

    return countries

def db_update_country(country_id, update_data):
    if IS_DEMO_MODE:
        data = read_mock()
        idx = next((i for i, c in enumerate(data["countries"]) if c["id"] == int(country_id)), -1)
        if idx != -1:
            data["countries"][idx].update(update_data)
            write_mock(data)
            return True
        return False
    else:
        url = f"{SUPABASE_URL}/rest/v1/countries?id=eq.{country_id}"
        res = requests.patch(url, headers=get_supabase_headers(), json=update_data)
        return res.status_code in (200, 204)

def db_get_registrations():
    if IS_DEMO_MODE:
        return read_mock().get("registrations", [])
    else:
        url = f"{SUPABASE_URL}/rest/v1/registrations"
        res = requests.get(url, headers=get_supabase_headers())
        return res.json() if res.status_code == 200 else []

def db_submit_registration(reg_data):
    preferred_committee = reg_data.get("preferred_committee", "")
    country_prefs = reg_data.get("country_preferences", [])
    reg_id = reg_data.get("id")
    if not reg_id:
        import random
        reg_id = f"PIS-2026-{random.randint(1000, 9999)}"
        reg_data["id"] = reg_id
    
    preferred_country = country_prefs[0] if country_prefs else None
        
    if IS_DEMO_MODE:
        data = read_mock()
        data["registrations"].append(reg_data)
        
        # Mark preferred country as taken/registered
        if preferred_country and preferred_committee:
            for c in data.get("countries", []):
                if c.get("committee_id", "").lower() == preferred_committee.lower() and c.get("country_name", "").lower() == preferred_country.lower():
                    c["assigned_to"] = reg_id
                    c["available"] = False
                    
        write_mock(data)
        return reg_data
    else:
        url = f"{SUPABASE_URL}/rest/v1/registrations"
        res = requests.post(url, headers=get_supabase_headers(), json=reg_data)
        if res.status_code in (200, 201):
            # Mark preferred country as taken/registered in Supabase countries table
            if preferred_country and preferred_committee:
                try:
                    c_url = f"{SUPABASE_URL}/rest/v1/countries"
                    params = {
                        "committee_id": f"eq.{preferred_committee.lower()}",
                        "country_name": f"eq.{preferred_country}"
                    }
                    requests.patch(
                        c_url, 
                        headers=get_supabase_headers(), 
                        params=params,
                        json={"assigned_to": reg_id, "available": False}
                    )
                except Exception as ex:
                    print(f"Exception updating country in Supabase: {ex}")
            return res.json()[0] if res.json() else reg_data
        print(f"Supabase insertion failed with status {res.status_code}: {res.text}")
        raise Exception(f"Failed to insert registration (status {res.status_code}): {res.text}")

def db_update_registration(reg_id, update_data):
    if IS_DEMO_MODE:
        data = read_mock()
        idx = next((i for i, r in enumerate(data["registrations"]) if r["id"] == reg_id), -1)
        if idx != -1:
            data["registrations"][idx].update(update_data)
            write_mock(data)
            return True
        return False
    else:
        url = f"{SUPABASE_URL}/rest/v1/registrations?id=eq.{reg_id}"
        res = requests.patch(url, headers=get_supabase_headers(), json=update_data)
        return res.status_code in (200, 204)


# --- API ACCESS ROUTING DECORATORS ---
def require_auth(roles):
    def decorator(f):
        def wrapper(*args, **kwargs):
            session_role = session.get('role')
            if not session_role:
                return jsonify({"error": "Unauthenticated"}), 401
            if session_role != 'coordinator' and session_role not in roles:
                return jsonify({"error": "Unauthorized"}), 403
            return f(*args, **kwargs)
        wrapper.__name__ = f.__name__
        return wrapper
    return decorator


# --- API ENDPOINTS ---

@app.route('/api/auth/login', methods=['POST'])
def api_login():
    session.clear()
    payload = request.json or {}
    role = payload.get('role')
    password = payload.get('password')

    if not role:
        return jsonify({"error": "Role must be specified."}), 400

    # For delegate (no password required)
    if role == 'delegate':
        reg_id = payload.get('registration_id')
        if not reg_id:
            return jsonify({"error": "Registration ID is required for delegates."}), 400
        
        # Verify delegate ID exists in registrations (case-insensitive check)
        regs = db_get_registrations()
        matched = next((r for r in regs if r.get("id", "").strip().upper() == reg_id.strip().upper()), None)
        if not matched:
            return jsonify({"error": "Invalid credentials."}), 401
        
        # Keep the feature of blocking rejected applications
        if matched.get('status') == 'REJECTED':
            return jsonify({"error": "Your registration has been rejected. Access denied."}), 403
        
        # Store canonical ID in session
        canonical_id = matched["id"]
        session['role'] = 'delegate'
        session['registration_id'] = canonical_id
        return jsonify({"success": True, "role": "delegate", "registration_id": canonical_id})

    # Coordinator / Incharge credentials checks
    if not password:
        return jsonify({"error": "Password required."}), 400

    # Fetch stored passwords config
    saved_passwords = db_get_passwords()
    stored_hash = saved_passwords.get(role) or DEFAULT_HASHES.get(role)

    if not stored_hash:
        return jsonify({"error": "Invalid credentials."}), 401

    # Verify bcrypt
    if bcrypt.checkpw(password.encode('utf-8'), stored_hash.encode('utf-8')):
        session['role'] = role
        session.pop('registration_id', None)
        return jsonify({"success": True, "role": role})

    return jsonify({"error": "Invalid credentials."}), 401

@app.route('/api/auth/logout', methods=['POST'])
def api_logout():
    session.clear()
    return jsonify({"success": True})

@app.route('/api/auth/session', methods=['GET'])
def api_session():
    return jsonify({
        "role": session.get('role'),
        "registration_id": session.get('registration_id')
    })

@app.route('/api/auth/passwords/update', methods=['POST'])
@require_auth(['coordinator'])
def api_update_passwords():
    payload = request.json or {}
    new_passwords = payload.get('passwords', {})

    if not new_passwords:
        return jsonify({"error": "Passwords cannot be blank."}), 400

    # BCrypt hash all passwords
    hashed_dict = {}
    for role, pw in new_passwords.items():
        if pw:
            hashed_dict[role] = bcrypt.hashpw(pw.encode('utf-8'), bcrypt.gensalt()).decode()

    # Save to db
    success = db_save_passwords(hashed_dict)
    if success:
        return jsonify({"success": True})
    return jsonify({"error": "Failed to update security passwords."}), 500

@app.route('/api/config', methods=['GET', 'POST'])
def api_config():
    if request.method == 'GET':
        return jsonify(db_get_config())
    else:
        # Require coordinator access to save config
        if session.get('role') != 'coordinator':
            return jsonify({"error": "Unauthorized"}), 403
        payload = request.json or {}
        if db_save_config(payload):
            return jsonify({"success": True})
        return jsonify({"error": "Failed to save settings."}), 500

@app.route('/api/committees', methods=['GET'])
def api_committees():
    return jsonify(db_get_committees())

@app.route('/api/committees/<comm_id>', methods=['PATCH'])
@require_auth(['coordinator'])
def api_update_committee(comm_id):
    payload = request.json or {}
    if db_update_committee(comm_id, payload):
        return jsonify({"success": True})
    return jsonify({"error": "Failed to save committee."}), 500

@app.route('/api/countries', methods=['GET'])
def api_countries():
    role = session.get('role')
    countries = db_get_countries()

    if not role:
        # Guest mode (unauthenticated committees view): hide category labels
        for c in countries:
            c.pop('category', None)
        return jsonify(countries)

    if role == 'coordinator':
        return jsonify(countries)

    if role.startswith('in_charge'):
        # Restrict countries to grade level committees
        grade = int(role.split('_')[-1])
        grade_comms = [c["id"] for c in db_get_committees() if c["grade"] == grade]
        filtered = [c for c in countries if c["committee_id"].lower() in grade_comms]
        return jsonify(filtered)

    if role == 'delegate':
        # Delegates cannot see internal classifications (category)
        for c in countries:
            c.pop('category', None)
        return jsonify(countries)

    return jsonify({"error": "Unauthorized"}), 403

@app.route('/api/countries/<country_id>', methods=['PATCH'])
@require_auth(['coordinator'])
def api_update_country(country_id):
    payload = request.json or {}
    # Validate payload parameters
    safe_data = {
        "available": payload.get("available", True),
        "assigned_to": payload.get("assigned_to")
    }
    if db_update_country(country_id, safe_data):
        return jsonify({"success": True})
    return jsonify({"error": "Failed to update country."}), 500

@app.route('/api/registrations', methods=['GET'])
def api_registrations():
    role = session.get('role')
    regs = db_get_registrations()

    if not role:
        # Unauthenticated guests get stripped records for dynamic counters
        # Strip ID to prevent Registration ID credential leakage
        stripped = [{
            "preferred_committee": r.get("preferred_committee"),
            "status": r.get("status")
        } for r in regs]
        return jsonify(stripped)

    if role == 'coordinator':
        return jsonify(regs)

    if role.startswith('in_charge'):
        grade = int(role.split('_')[-1])
        filtered = [r for r in regs if r["grade"] == grade]
        return jsonify(filtered)

    if role == 'delegate':
        reg_id = session.get('registration_id')
        # Return full details for the logged-in delegate's own registration,
        # but stripped/anonymous details for all other registrations so they can calculate counts.
        # Strip other delegates' IDs to prevent credential leakage
        result = []
        for r in regs:
            if r.get("id") == reg_id:
                result.append(r)
            else:
                result.append({
                    "preferred_committee": r.get("preferred_committee"),
                    "status": r.get("status")
                })
        return jsonify(result)

    return jsonify({"error": "Unauthorized"}), 403

@app.route('/api/register', methods=['POST'])
def api_register():
    payload = request.json or {}
    
    # Server-side input validation schema
    name = payload.get('name', '').strip()
    grade = payload.get('grade')
    section = payload.get('section', '').strip()
    school = payload.get('school', '').strip()
    email = payload.get('email', '').strip()
    phone = payload.get('phone', '').strip()
    pref_pos = payload.get('portfolio_preference', '')
    mun_exp = payload.get('mun_experience', 'First time delegate').strip()
    add_info = payload.get('additional_info', '').strip()
    preferred_committee = payload.get('preferred_committee', '').strip()
    country_prefs = payload.get('country_preferences', [])

    if not (name and grade and section and school and email and phone and pref_pos and preferred_committee and country_prefs):
        return jsonify({"error": "Validation failed. Missing required fields."}), 400

    if len(name) > 100 or len(email) > 100 or len(phone) > 20 or len(section) > 5 or len(preferred_committee) > 20:
        return jsonify({"error": "Input length limit exceeded."}), 400

    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return jsonify({"error": "Invalid email address format."}), 400

    # Validate that country preferences are exactly 1 unique entry
    if not isinstance(country_prefs, list) or len(country_prefs) != 1:
        return jsonify({"error": "Exactly one country preference is required."}), 400

    # Validate that selected countries belong to preferred committee's pool
    all_countries = db_get_countries()
    valid_countries = [c["country_name"].lower() for c in all_countries if c["committee_id"].lower() == preferred_committee.lower()]
    for c in country_prefs:
        if c.lower() not in valid_countries:
            return jsonify({"error": f"Invalid country preference '{c}' for committee '{preferred_committee}'."}), 400

    # Check if selected country is already taken by another delegate
    pref_c_obj = next((c for c in all_countries if c["committee_id"].lower() == preferred_committee.lower() and c["country_name"].lower() == country_prefs[0].lower()), None)
    if pref_c_obj and (pref_c_obj.get("assigned_to") or not pref_c_obj.get("available", True)):
        return jsonify({"error": f"The country '{country_prefs[0]}' in '{preferred_committee.upper()}' has already been taken by another delegate. Please select a different country."}), 400

    # Construct clean payload to prevent mass assignment exploits
    unique_num = int(time.time() * 1000) % 10000
    reg_id = f"PIS-2026-{unique_num:04d}"
    
    sanitized_reg = {
        "id": reg_id,
        "name": name,
        "grade": int(grade),
        "section": section,
        "school": school,
        "email": email,
        "phone": phone,
        "portfolio_preference": pref_pos,
        "mun_experience": mun_exp,
        "additional_info": add_info,
        "preferred_committee": preferred_committee.lower(),
        "country_preferences": list(country_prefs)[:5],
        "committee": "NOT ASSIGNED",
        "assigned_country": "NOT ASSIGNED",
        "status": "NOT ASSIGNED",
        "created_at": time.strftime('%Y-%m-%dT%H:%M:%SZ')
    }

    try:
        saved = db_submit_registration(sanitized_reg)
        session['role'] = 'delegate'
        session['registration_id'] = reg_id
        return jsonify(saved)
    except Exception as e:
        import traceback
        print("EXCEPTION IN API_REGISTER:")
        traceback.print_exc()
        return jsonify({"error": f"Failed to record registration: {str(e)}"}), 500

@app.route('/api/registrations/<reg_id>', methods=['PATCH', 'DELETE'])
@require_auth(['coordinator'])
def api_modify_registration(reg_id):
    if request.method == 'DELETE':
        # Soft delete simulation on mock / delete query on database
        if IS_DEMO_MODE:
            data = read_mock()
            data["registrations"] = [r for r in data["registrations"] if r["id"] != reg_id]
            write_mock(data)
            return jsonify({"success": True})
        else:
            url = f"{SUPABASE_URL}/rest/v1/registrations?id=eq.{reg_id}"
            res = requests.delete(url, headers=get_supabase_headers())
            return jsonify({"success": res.status_code in (200, 204)})
    else:
        # Patch registrations
        payload = request.json or {}
        # Protect against mass assignment (only allow coordinator to edit matches/status)
        safe_data = {}
        if "committee" in payload:
            safe_data["committee"] = payload["committee"]
        if "assigned_country" in payload:
            safe_data["assigned_country"] = payload["assigned_country"]
        if "status" in payload:
            safe_data["status"] = payload["status"]

        if db_update_registration(reg_id, safe_data):
            return jsonify({"success": True})
        return jsonify({"error": "Failed to update registration."}), 500


# --- SECURITY HEADERS INJECTION ---
@app.after_request
def add_security_headers(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    response.headers['Content-Security-Policy'] = (
        "default-src 'self' https://cdn.jsdelivr.net; "
        "script-src 'self' https://cdn.jsdelivr.net; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com; "
        "img-src 'self' data:; "
        "frame-ancestors 'none';"
    )
    # Serve caching headers based on static vs dynamic content
    path = request.path.lower()
    if path.endswith(('.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.pdf')):
        response.headers['Cache-Control'] = 'public, max-age=31536000, immutable'
    else:
        response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '0'
    return response


# --- SERVING STATIC FILES ---
@app.route('/')
def route_index():
    return app.send_static_file('index.html')

@app.route('/<path:path>')
def route_static(path):
    return send_from_directory('.', path)


if __name__ == '__main__':
    port = 8080
    app.run(host='0.0.0.0', port=port)
