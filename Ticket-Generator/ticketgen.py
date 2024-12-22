import requests

# Constants
url = 'http://localhost:8084/api/tickets/v2/create-bulk?secretKey=MetallicaEastRutherfordJan152025'

# Generate ticket data
tickets = []
for seat_number in range(1, 1001):  # A1 to A100
    ticket = {
        'eventId': 1,
        'venueId': 2,
        #"seatNumber":f'A{seat_number}',
        'seatNumber': 'NA',
        "sectionId":3,
        "ticketSectionSeating":"NO",
        'ticketStatus': 'AVAILABLE',
        'ticketPrice': 100.00,
        'ticketDetails': {
            'section': 'VIP Admission Standing Section',
            'specialRequirements': 'Wheelchair accessible',
        },
    }
    tickets.append(ticket)

# Send POST requests

response = requests.post(url, json=tickets)
if response.status_code != 200 :
    print(f"Failed to create ticket {ticket['ticketDetails']}")
    
        
