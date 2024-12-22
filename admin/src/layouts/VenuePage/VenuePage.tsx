import { useEffect, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import axios from 'axios'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import { VenueModel } from '@/models/VenueModel'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { useVenueStore } from '@/stores/VenueStore'
import { useUserStore } from '@/stores/UserStore'

export function VenuesList() {
    const { venues, setVenues } = useVenueStore()
    const { setUser } = useUserStore()
    const [loading, setLoading] = useState(true)
    const { getAccessTokenSilently, user } = useAuth0()

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

    return (
        <Card className="container w-full">
            <CardHeader className="bg-slate-50">
                <CardTitle className="text-2xl font-bold text-slate-800">
                    Venue Management ({venues.length})
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                {venues.length > 0 ? (
                    <Table >
                        <TableHeader>
                            <TableRow className="bg-slate-100">
                                <TableHead className="font-semibold text-slate-900 text-center">Venue Name</TableHead>
                                <TableHead className="font-semibold text-slate-900 text-center">Address</TableHead>
                                <TableHead className="font-semibold text-slate-900 text-center">City</TableHead>
                                <TableHead className="font-semibold text-slate-900 text-center">State</TableHead>
                                <TableHead className="font-semibold text-slate-900 text-center">Capacity</TableHead>
                                <TableHead className="font-semibold text-slate-900 text-center">Type</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {venues.map((venue, index) => (
                                <TableRow key={`${venue.venueId}-${index}`} className="hover:bg-slate-50 transition-colors">
                                    <TableCell>{venue.venueName}</TableCell>
                                    <TableCell>{venue.venueAddress}</TableCell>
                                    <TableCell>{venue.venueCity}</TableCell>
                                    <TableCell>{venue.venueState}</TableCell>
                                    <TableCell>{venue.venueCapacity}</TableCell>
                                    <TableCell>{venue.venueType}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="text-center py-4">No venues found</div>
                )}
                <div className="mt-6">
                    <Button asChild>
                        <Link to="/addVenue">Add New Venue</Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
