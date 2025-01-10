
import '@/App.css'

import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
import { ThemeProvider } from '@/components/theme-provider';
import LandingPage from '@/layouts/HomePage/HomePage';
import { Navbar } from '@/layouts/Navbar/Navbar';
import { Footer } from '@/layouts/Footer/Footer';
import SearchEvents from '@/layouts/SearchEvents/EventSearchPage';
import EventDetailsPage from '@/layouts/EventBookingPage/EventBooking';
import Auth0ProviderWithHistory from './auth/Auth0Provider';
import ProtectedRoute from '@/components/PrivateRoute';
import { LoginButton } from '@/components/LoginButton';
import { LogoutButton } from '@/components/LogoutButton';
import { Profile } from '@/layouts/UserProfile/UserProfile';
import PaymentSuccessPage from './layouts/PaymentFormPage/PaymentSuccessPage';
import { UserBookings } from '@/layouts/UserBookings/UserBookings';
import { NotificationProvider } from '@/context/NotificationContext';
import { NotificationsPage } from './layouts/NotificationsPage/NotificationsPage';
import { UserCalendar } from '@/layouts/EventCalendarPage/EventCalendar';
import { Toaster } from "@/components/ui/toaster"
import PaymentFailedPage from './layouts/PaymentFormPage/PaymentFailedPage';
import { About } from '@/layouts/AboutPage/AboutPage';
import ChatBot from '@/layouts/Chatbot/chatbot';
function App() {
  return (
    <Auth0ProviderWithHistory>
      <NotificationProvider>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          
            <Router>
            <Toaster />
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  {/* Public routes */}
                  <Route path="/login" element={<LoginButton />} />

                  <Route path="/" element={<LandingPage />} />
                  <Route path="/events" element={<SearchEvents />} />
                  <Route path="/event-details/:eventId" element={<EventDetailsPage />} />
                  <Route path="/about" element={<About />} />

                  {/* Private routes */}
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } />

                  <Route path="/calendar" element={
                    <ProtectedRoute>
                      <UserCalendar />
                    </ProtectedRoute>
                  } />

                  <Route path="/user-notifications" element={
                    <ProtectedRoute>
                      <NotificationsPage />
                    </ProtectedRoute>
                  } />

                  <Route path="/payment-success" element={
                    <ProtectedRoute>
                      <PaymentSuccessPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/payment-failed" element={
                    <ProtectedRoute>
                      <PaymentFailedPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/user-bookings" element={
                    <ProtectedRoute>
                      <UserBookings />
                    </ProtectedRoute>
                  } />
                </Routes>
                </main>
                <ChatBot />
              <Footer />
              </div>
            </Router>
          
        </ThemeProvider>
      </NotificationProvider>
    </Auth0ProviderWithHistory>
    
  )
}
export default App
