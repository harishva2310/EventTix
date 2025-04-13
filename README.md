# EventTix

An event ticketing system serving small to medium business-owners in the US to create and manage local music events with ticketing and bookings. Ideal for music bars, hotels, community halls, amphitheaters and small artists to be discovered outside the local community. 

Successfully used for 2 actual events with 100+ bookings with QR code verifications for each ticket booking.

Visit here: [EventTix](https://eventix.website)

To know more about the tech stack used, [click here](https://eventix.website/about)

## Features

* Create and manage events by organisers with secure ticketing and booking processes, preventing frauds and increasing paying customers
* Book tickets to events and manage bookings as a customer with secure QR codes for checking in the events
* No third-party advertisements and selling personal data of users
* Booking limits and rate limits to prevent scalpers from hoarding tickets to ensure fair pricing for customers and organisers
* User-friendly interface with secure backend processing to ensure best customer and event organiser's experience
* Stripe payments for ticket booking with upcoming feature to enable/disable online payments depending upon organisers request.
* Use a conversational AI chatbot to quickly search for events

## System Design

![system design](https://github.com/harishva2310/EventTix/blob/06eed590642a79d77223ff6dd6868c34e9d88f3d/System%20design.drawio.png)

## Screenshots
![home page](Screenshots/eventix.website_.png)

## Environment Variables

These are the environment variables used in the project. If you are using a single VM to host the project, you can add these variables in the /etc/environment file in the system or use it as Docker secrets. If hosting on Kubernetes, you can use the Kubernetes secrets.

DB_USERNAME="<db_username>"
DB_PASSWORD="<db_password"
AUTH0_DOMAIN_URL="<auth0 domain url from auth0 for backend service>"
MINIO_ROOT_USER="<minio_username>"
MINIO_ROOT_PASSWORD="<minio_password>"
STRIPE_API_KEY_PRIVATE="<stripe_private_key>"
STRIPE_API_KEY_PUBLIC="<stripe_public_key>"
MJ_APIKEY_PUBLIC="<mailjet_pubilc_key>"
MJ_APIKEY_PRIVATE="<mailjet_private_key>"
QR_SECRET_KEY="<create own key to encrypt bookings>"
VITE_AUTH0_CLIENT_ID="<Auth0 client ID for frontend>"
VITE_APP_LINK="<domain link like https://localhost or https://eventix.website>"
VITE_AUTH0_DOMAIN="<Auth0 domain for admin service>"
VITE_AUTH0_CLIENT_ID_TICKETAPP="<Auth0 domain for admin service>"
MINIO_ACCESS_KEY="<Minio access key to access image bucket>"
MINIO_SECRET_KEY="<Minio secret key to access image bucket>"

