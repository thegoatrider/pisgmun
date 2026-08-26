import os
import requests
from dotenv import load_dotenv

load_dotenv()
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}"
}

# Fetch countries in UN-Women
url = f"{SUPABASE_URL}/rest/v1/countries?committee_id=eq.un-women"
res = requests.get(url, headers=headers)
if res.status_code == 200:
    countries = res.json()
    available = [c for c in countries if not c.get("assigned_to") and c.get("available") != False]
    print(f"Total countries in UN-Women: {len(countries)}")
    print(f"Available/unassigned countries in UN-Women ({len(available)}):")
    for c in sorted(available, key=lambda x: x['country_name']):
        print(f"- {c['country_name']} (ID: {c['id']})")
else:
    print(f"Failed to fetch countries: {res.status_code} {res.text}")
