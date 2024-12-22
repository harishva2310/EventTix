import requests

# Constants
url = 'http://localhost:8084/api/sections/createSection'

# Generate section data
section={
    "sectionName": "VIP Admission Standing Section",
    "sectionCapacity": 10000,
    "sectionSeating": "No",
    "sectionWidth": 20,
    "eventId": 4,
    "venueId":3,
    "sectionDetails": {
        "section_description": "VIP Admission Standing section",
        "Accessibility": "Wheeelchair accessible",
        "Amenities": " Food, Bathrooms, Merchandise Stands"
    }
}

response = requests.post(url, json=section)
if response.status_code != 200 :
    print(f"Failed to create ticket {section['sectionName']}")