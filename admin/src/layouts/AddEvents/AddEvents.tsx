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
import { useVenueStore } from '@/stores/VenueStore'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Upload } from 'lucide-react'

// Add this new interface
interface CustomAttribute {
    key: string
    value: string | string[]
    isArray: boolean
}

export function AddEventPage() {
    const { getAccessTokenSilently, user } = useAuth0()
    const { toast } = useToast()
    const venues = useVenueStore(state => state.venues)
    const [selectedVenueId, setSelectedVenueId] = useState<string>('')
    const selectedVenue = venues.find(v => v.venueId === Number(selectedVenueId))

    const [customAttributes, setCustomAttributes] = useState<CustomAttribute[]>([])

    const minio_access_key = import.meta.env.VITE_MINIO_ACCESS_KEY
    const minio_secret_key = import.meta.env.VITE_MINIO_SECRET_KEY

    const handleDetailChange = (key: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            eventDetails: {
                ...prev.eventDetails,
                [key]: value
            }
        }))
    }

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
        eventName: '',
        venueId: 0,
        eventStatus: '',
        eventStartTime: '',
        eventEndTime: '',
        eventDescription: '',
        eventType: '',
        eventDetails: {
            amenities: [],
            headliner: '',
            eventImages: [],
            supportingActs: [],
            cover_picture_path: [],

        }
    })

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const file = e.target.files?.[0]
        if (!file) return

        const uploadData = new FormData()
        uploadData.append('file', file)

        try {
            const response = await axios.post('/img-upload-service/upload', uploadData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })

            const imagePath = response.data.path
            const newImages = [...(formData.eventDetails?.eventImages || [])] as string[]
            newImages[index] = imagePath
            handleDetailChange('eventImages', newImages)

            toast({
                title: "Success",
                description: "Image uploaded successfully",
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to upload image",
                variant: "destructive"
            })
        }
    }





    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Convert customAttributes to eventDetails object
        const customAttributesObj = customAttributes.reduce((acc, attr) => ({
            ...acc,
            [attr.key]: attr.value
        }), {})

        try {
            const token = await getAccessTokenSilently()
            console.log(formData);
            console.log(customAttributes);
            // First create the event
            const eventResponse = await axios.post(
                '/api/events/create',
                {
                    ...formData,
                    eventDetails: {
                        ...formData.eventDetails,
                        ...customAttributesObj
                    }
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            toast({
                title: "Success",
                description: "Event created successfully",
            })

            // Reset form
            setFormData({
                eventName: '',
                eventDescription: '',
                eventStartTime: '',
                eventEndTime: '',
                eventStatus: '',
                eventType: '',
                venueId: 0,
                eventDetails: {
                    amenities: [],
                    headliner: '',
                    eventImages: [],
                    supportingActs: [],
                    cover_picture_path: []
                }
            })

        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to create event",
                variant: "destructive"
            })
        }
    }
    const handleVenueChange = (value: string) => {
        setSelectedVenueId(value)
        setFormData(prev => ({
            ...prev,
            venueId: Number(value)
        }))
    }

    return (
        <>
            <Card className="w-full max-w-2xl mx-auto">
                <CardHeader className="bg-slate-50">
                    <CardTitle className="text-2xl font-bold text-slate-800">
                        Create Event
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="eventName">Event Name</Label>
                                <Input
                                    id="eventName"
                                    name="eventName"
                                    value={formData.eventName}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="eventStatus">Event Status</Label>
                                <Select onValueChange={(value) => handleInputChange({ target: { name: 'eventStatus', value } } as any)} value={formData.eventStatus}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="UPCOMING">UPCOMING</SelectItem>
                                        <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="eventType">Event Type</Label>
                                <Input
                                    id="eventType"
                                    name="eventType"
                                    value={formData.eventType}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="eventStartTime">Event Start Time</Label>
                                    <Input
                                        type="datetime-local"
                                        id="eventStartTime"
                                        name="eventStartTime"
                                        value={formData.eventStartTime}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="eventEndTime">Event End Time</Label>
                                    <Input
                                        type="datetime-local"
                                        id="eventEndTime"
                                        name="eventEndTime"
                                        value={formData.eventEndTime}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="eventDescription">Event Description</Label>
                                <Input
                                    id="eventDescription"
                                    name="eventDescription"
                                    value={formData.eventDescription}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="eventDescription">Venue</Label>
                                <Select onValueChange={handleVenueChange} value={selectedVenueId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a venue" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {venues.map((venue) => (
                                            <SelectItem key={venue.venueId} value={venue.venueId.toString()}>
                                                {venue.venueName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {selectedVenueId && (
                                    <div className="text-sm text-gray-600 mt-1">
                                        Selected Venue: {venues.find(v => v.venueId === Number(selectedVenueId))?.venueName}
                                    </div>
                                )}
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

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Headliner</Label>
                                    <Input
                                        value={formData.eventDetails?.headliner || ''}
                                        onChange={(e) => handleDetailChange('headliner', e.target.value)}
                                        placeholder="Main performing artist"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Supporting Acts</Label>
                                    {(formData.eventDetails?.supportingActs || []).map((act, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <Input
                                                value={act}
                                                onChange={(e) => {
                                                    const newActs = [...(formData.eventDetails?.supportingActs || [])] as string[]
                                                    newActs[index] = e.target.value
                                                    handleDetailChange('supportingActs', newActs)
                                                }}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    const newActs = formData.eventDetails?.supportingActs.filter((_, i) => i !== index)
                                                    handleDetailChange('supportingActs', newActs)
                                                }}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const currentActs = formData.eventDetails?.supportingActs || []
                                            handleDetailChange('supportingActs', [...currentActs, ''])
                                        }}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Supporting Act
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    <Label>Amenities</Label>
                                    {(formData.eventDetails?.amenities || []).map((amenity, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <Input
                                                value={amenity}
                                                onChange={(e) => {
                                                    const newAmenities = [...(formData.eventDetails?.amenities || [])] as string[]
                                                    newAmenities[index] = e.target.value
                                                    handleDetailChange('amenities', newAmenities)
                                                }}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    const newAmenities = formData.eventDetails?.amenities.filter((_, i) => i !== index)
                                                    handleDetailChange('amenities', newAmenities)
                                                }}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const currentAmenities = formData.eventDetails?.amenities || []
                                            handleDetailChange('amenities', [...currentAmenities, ''])
                                        }}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Amenity
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    <Label>Event Images</Label>
                                    {(formData.eventDetails?.eventImages || []).map((image, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <div className="flex-1">
                                                <Input
                                                    value={image}
                                                    onChange={(e) => {
                                                        const newImages = [...(formData.eventDetails?.eventImages || [])] as string[]
                                                        newImages[index] = e.target.value
                                                        handleDetailChange('eventImages', newImages)
                                                    }}
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <input
                                                    type="file"
                                                    id={`image-upload-${index}`}
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={(e) => handleImageUpload(e, index)}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        const fileInput = document.getElementById(`image-upload-${index}`) as HTMLInputElement
                                                        if (fileInput) fileInput.click()
                                                    }}
                                                >
                                                    <Upload className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        const newImages = formData.eventDetails?.eventImages.filter((_, i) => i !== index)
                                                        handleDetailChange('eventImages', newImages)
                                                    }}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const currentImages = formData.eventDetails?.eventImages || []
                                            handleDetailChange('eventImages', [...currentImages, 'eventimagebucket/'])
                                        }}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Image Path
                                    </Button>
                                </div>


                                <div className="space-y-2">
                                    <Label>Cover Picture Path</Label>
                                    {(formData.eventDetails?.cover_picture_path || []).map((path, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <Input
                                                value={path}
                                                onChange={(e) => {
                                                    const newPaths = [...(formData.eventDetails?.cover_picture_path || [])] as string[]
                                                    newPaths[index] = e.target.value
                                                    handleDetailChange('cover_picture_path', newPaths)
                                                }}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    const newPaths = formData.eventDetails?.cover_picture_path.filter((_, i) => i !== index)
                                                    handleDetailChange('cover_picture_path', newPaths)
                                                }}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const currentPaths = formData.eventDetails?.cover_picture_path || []
                                            handleDetailChange('cover_picture_path', [...currentPaths, 'eventimagebucket/'])
                                        }}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Cover Image Path
                                    </Button>
                                </div>
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
                            Create Event
                        </Button>
                    </form>
                </CardContent>
            </Card>
            <Toaster />
        </>
    )
}
