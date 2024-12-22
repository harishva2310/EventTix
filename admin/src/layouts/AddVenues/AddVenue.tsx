import { useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import axios from 'axios'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Toast } from '@/components/ui/toast'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from "@/components/ui/toaster"
import { Plus, X } from 'lucide-react'

// Add this new interface
interface CustomAttribute {
    key: string
    value: string | string[]
    isArray: boolean
  }

export function AddVenuePage() {
  const { getAccessTokenSilently, user } = useAuth0()
  const { toast } = useToast()

  const [customAttributes, setCustomAttributes] = useState<CustomAttribute[]>([])

  const addCustomAttribute = () => {
    setCustomAttributes([...customAttributes, { key: '', value: '', isArray: false }])
  }

  const removeCustomAttribute = (index: number) => {
    setCustomAttributes(customAttributes.filter((_, i) => i !== index))
  }

  const updateCustomAttribute = (index: number, field: 'key' | 'value', newValue: string) => {
    const updated = [...customAttributes]
    updated[index] = { ...updated[index], [field]: newValue }
    setCustomAttributes(updated)
  }

  const toggleArrayType = (index: number) => {
    const updated = [...customAttributes]
    updated[index] = {
      ...updated[index],
      isArray: !updated[index].isArray,
      value: updated[index].isArray ? '' : []
    }
    setCustomAttributes(updated)
  }

  const addArrayValue = (index: number) => {
    const updated = [...customAttributes]
    const currentValue = updated[index].value as string[]
    updated[index].value = [...currentValue, '']
    setCustomAttributes(updated)
  }

  const updateArrayValue = (attrIndex: number, valueIndex: number, newValue: string) => {
    const updated = [...customAttributes]
    const values = updated[attrIndex].value as string[]
    values[valueIndex] = newValue
    setCustomAttributes(updated)
  }

  
  const [formData, setFormData] = useState({
    venueName: '',
    venueAddress: '',
    venueCity: '',
    venueState: '',
    venueCountry: '',
    venueCapacity: '',
    venueType: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Convert customAttributes to venueDetails object
    const venueDetails = customAttributes.reduce((acc, attr) => ({
        ...acc,
        [attr.key]: attr.value
      }), {})
    
    try {
      const token = await getAccessTokenSilently()
      
      // First create the venue
      const venueResponse = await axios.post(
        '/api/venue/create',
        {
          ...formData,
          venueCapacity: parseInt(formData.venueCapacity),
          venueDetails
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
  
      // Get the venueId from response and assign to owner
      const { venueId } = venueResponse.data
      await axios.post(
        `/api/venueOwner/addVenueToOwner`,
        null,
        {
          params: {
            venueId,
            email: user?.email
          },
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
  
      toast({
        title: "Success",
        description: "Venue created and assigned successfully",
      })
      
      // Reset form
      setFormData({
        venueName: '',
        venueAddress: '',
        venueCity: '',
        venueState: '',
        venueCountry: '',
        venueCapacity: '',
        venueType: ''
      })
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create and assign venue",
        variant: "destructive"
      })
    }
  }

  return (
    <>
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="bg-slate-50">
        <CardTitle className="text-2xl font-bold text-slate-800">
          Add New Venue
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="venueName">Venue Name</Label>
              <Input
                id="venueName"
                name="venueName"
                value={formData.venueName}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="venueAddress">Address</Label>
              <Input
                id="venueAddress"
                name="venueAddress"
                value={formData.venueAddress}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="venueCity">City</Label>
                <Input
                  id="venueCity"
                  name="venueCity"
                  value={formData.venueCity}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="venueState">State</Label>
                <Input
                  id="venueState"
                  name="venueState"
                  value={formData.venueState}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="venueCountry">Country</Label>
              <Input
                id="venueCountry"
                name="venueCountry"
                value={formData.venueCountry}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="venueCapacity">Capacity</Label>
                <Input
                  id="venueCapacity"
                  name="venueCapacity"
                  type="number"
                  value={formData.venueCapacity}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="venueType">Venue Type</Label>
                <Input
                  id="venueType"
                  name="venueType"
                  value={formData.venueType}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Custom Attributes</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addCustomAttribute}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Attribute
              </Button>
            </div>

            {customAttributes.map((attr, index) => (
              <div key={index} className="space-y-2 p-4 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Attribute name"
                    value={attr.key}
                    onChange={(e) => updateCustomAttribute(index, 'key', e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => toggleArrayType(index)}
                  >
                    {attr.isArray ? 'Array' : 'Single'}
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeCustomAttribute(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {attr.isArray ? (
                  <div className="space-y-2">
                    {(attr.value as string[]).map((val, valueIndex) => (
                      <Input
                        key={valueIndex}
                        value={val}
                        onChange={(e) => updateArrayValue(index, valueIndex, e.target.value)}
                        placeholder={`Value ${valueIndex + 1}`}
                      />
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addArrayValue(index)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Value
                    </Button>
                  </div>
                ) : (
                  <Input
                    value={attr.value as string}
                    onChange={(e) => updateCustomAttribute(index, 'value', e.target.value)}
                    placeholder="Value"
                  />
                )}
              </div>
            ))}
          </div>

          <Button type="submit" className="w-full">
            Create Venue
          </Button>
        </form>
      </CardContent>
    </Card>
    <Toaster />
    </>
  )
}
