import { useAuth0 } from '@auth0/auth0-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from 'react'
import axios from 'axios'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, XCircle } from "lucide-react"
export function Profile() {
  const { user, getAccessTokenSilently } = useAuth0()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: user?.email
  })
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const [showErrorAlert, setShowErrorAlert] = useState(false)

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = await getAccessTokenSilently();
        console.log('Token:', token)
        const response = await axios.get(`/api/user/email?email=${user?.email}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        console.log('User details:', response.data)
        if (response.data) {
          setFormData({
            firstName: response.data.firstName || '',
            lastName: response.data.lastName || '',
            phoneNumber: response.data.phoneNumber || '',
            email: response.data.email
          })
        }
      } catch (error) {
        console.log('User details not found')
      }
    }

    if (user?.email) {
      fetchUserDetails()
    }
  }, [user?.email])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await axios.post('/api/user/upsert', formData)
      setShowSuccessAlert(true)
      setShowErrorAlert(false)
      setTimeout(() => setShowSuccessAlert(false), 3000) // Hide after 3 seconds
    } catch (error) {
      setShowErrorAlert(true)
      setShowSuccessAlert(false)
      setTimeout(() => setShowErrorAlert(false), 3000) // Hide after 3 seconds
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-lg">
      {showSuccessAlert && (
          <Alert className="border-green-500 text-green-500">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Profile Details Updated Successfully
            </AlertDescription>
          </Alert>
        )}

        {showErrorAlert && (
          <Alert className="border-red-500 text-red-500">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              Error in updating profile
            </AlertDescription>
          </Alert>
        )}
        <h1 className="text-2xl font-bold text-center">Profile Settings</h1>
        <h4  className="text-md font-medium text-center">Please enter/verify your details to book tickets.</h4>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={user?.email}
              disabled
              className="bg-muted w-full max-w-md"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Enter your first name"
              className="w-full max-w-md"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Enter your last name"
              className="w-full max-w-md"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Enter your phone number"
              className="w-full max-w-md"
            />
          </div>

          <Button type="submit" className="w-full mt-6">
            Save Changes
          </Button>
        </form>
      </div>
    </div>
  )
}

