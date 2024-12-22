import { Card } from "@/components/ui/card"
import { useNavigate } from "react-router-dom"
import { useVenueStore } from '@/stores/VenueStore'
import { useUserStore } from '@/stores/UserStore'
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { VenueModel } from "@/models/VenueModel";

export function AdminDashboard() {
  const navigate = useNavigate();
  const { venues, setVenues } = useVenueStore();
    const { setUser } = useUserStore();
    const { getAccessTokenSilently, user } = useAuth0();
    const [loading, setLoading] = useState(false)

    useEffect(() => {
      if (user) {
          setUser(user)
      }
  }, [user, setUser])

  useEffect(() => {
      const fetchVenues = async () => {
          try {
              const token = await getAccessTokenSilently()
              const { data } = await axios.get<VenueModel[]>(
                  `/api/venueOwner/getVenuebyOwnerEmail`,
                  {
                      params: { email: user?.email },
                      headers: {
                          Authorization: `Bearer ${token}`,
                      },
                  }
              )
              setVenues(Array.isArray(data) ? data : [])
          } catch (error) {
              console.error('Error fetching venues:', error)
              setVenues([])
          } finally {
              setLoading(false)
          }
      }

      if (user?.email) {
          fetchVenues()
      }
  }, [user?.email, getAccessTokenSilently, setVenues])

  if (loading) {
      return <div>Loading venues...</div>
  }

  const adminOptions = [
    {
      title: "Manage Venues",
      description: "Add, edit, and remove venue listings",
      path: "/venues",
      icon: "🏢"
    },
    {
      title: "Manage Events",
      description: "Create and modify event schedules",
      path: "/events",
      icon: "🎪"
    },
    {
      title: "Manage Tickets",
      description: "Configure ticket types and pricing",
      path: "/tickets",
      icon: "🎟️"
    },
    {
      title: "Manage Bookings",
      description: "View and validate bookings for the event",
      path: "/validate-booking",
      icon: "📅"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {adminOptions.map((option) => (
            <Card 
              key={option.title}
              className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(option.path)}
            >
              <div className="text-4xl mb-4">{option.icon}</div>
              <h2 className="text-xl font-semibold mb-2">{option.title}</h2>
              <p className="text-gray-600">{option.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard