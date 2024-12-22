import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Auth0ProviderWithHistory from '@/auth/Auth0Provider'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
import Page from '@/app/dashboard/page'
import { LoginButton } from '@/components/LoginButton'
import ProtectedRoute from '@/components/ProtectedRoute'
import { AdminDashboard } from '@/layouts/AdminLandingPage/AdminLandingPage'
import { Footer } from '@/layouts/Footer/Footer'
import { Navbar } from '@/layouts/Navbar/Navbar'
import { Unauthorized } from '@/components/UnauthorisedRoute'
import { VenuesList } from '@/layouts/VenuePage/VenuePage'
import { AddVenuePage } from '@/layouts/AddVenues/AddVenue'
import { EventsPage } from '@/layouts/EventsPage/EventsPage'
import { EventDetailsPage } from '@/layouts/EventDetailsPage/EventDetails'
import { AddEventPage } from '@/layouts/AddEvents/AddEvents'
import { TicketDetailsPage } from '@/layouts/TicketPage/ManageTicketPage'
import { AddTickets } from '@/layouts/AddTickets/AddTickets'
import QRScanner from './layouts/ScanBookingQRCode/ValidateBooking'


function App() {
  return (
    <Auth0ProviderWithHistory>
      <Router basename="/admin">
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="/login" element={<LoginButton />} />
              <Route path="/" element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/venues" element={
                <ProtectedRoute requireAdmin={true}>
                  <VenuesList />
                </ProtectedRoute>
              } />
              <Route path="/addVenue" element={
                <ProtectedRoute requireAdmin={true}>
                  <AddVenuePage />
                </ProtectedRoute>
              } />
              <Route path="/events" element={
                <ProtectedRoute requireAdmin={true}>
                  <EventsPage />
                </ProtectedRoute>
              } />
              <Route path="/addEvent" element={
                <ProtectedRoute requireAdmin={true}>
                  <AddEventPage />
                </ProtectedRoute>
              } />
              <Route path="/event-details/:eventId" element={
                <ProtectedRoute requireAdmin={true}>
                  <EventDetailsPage />
                </ProtectedRoute>
              } />
              <Route path="/manage-tickets/:eventId" element={
                <ProtectedRoute requireAdmin={true}>
                  <TicketDetailsPage />
                </ProtectedRoute>
              } />
              <Route path="/create-tickets/:eventId" element={
                <ProtectedRoute requireAdmin={true}>
                  <AddTickets />
                </ProtectedRoute>
              } />
              <Route path="/validate-booking" element={
                <ProtectedRoute requireAdmin={true}>
                  <QRScanner />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </Auth0ProviderWithHistory>
  )
}

export default App
