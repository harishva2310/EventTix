import { useState, useEffect } from 'react'
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Toaster } from '@/components/ui/toaster'
import { toast } from '@/hooks/use-toast'
import { useAuth0 } from '@auth0/auth0-react'
import axios from 'axios'

export default function QRScanner() {
  const [eventSecretKey, setEventSecretKey] = useState('')
  const [scanning, setScanning] = useState(false)
  const { getAccessTokenSilently } = useAuth0();
  const formatsToSupport = [Html5QrcodeSupportedFormats.QR_CODE]

  useEffect(() => {
    if (scanning) {
      const scanner = new Html5QrcodeScanner("reader", {
        qrbox: {
          width: 250,
          height: 250,
        },
        fps: 60, // Increased from 30
        formatsToSupport: formatsToSupport,
        disableFlip: true, // Reduces processing overhead
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true
        }
      }, false)

      scanner.render(onScanSuccess, onScanError)

      return () => {
        scanner.clear()
      }
    }
  }, [scanning])

  const onScanSuccess = async (decodedText: string, decodedResult: any) => {
    try {
      const token = await getAccessTokenSilently()

      const response = await axios.post(
        `/api/bookings/verifyQRCode?eventSecretKey=${eventSecretKey}`,
        decodedText,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'text/plain'
          }
        }
      )

      toast({
        title: response.data.valid ? "Valid Ticket ✓" : "Invalid Ticket ✗",
        description: response.data.message,
        variant: response.data.valid ? "default" : "destructive",
        className: response.data.valid ? "bg-green-500 text-white" : "bg-red-500 text-white"
      })

    } catch (error) {
      console.error('Error details:', error)
      toast({
        title: "Error",
        description: "Failed to verify QR code",
        variant: "destructive",
        className: "bg-red-500 text-white"
      })
    }
  }

  const onScanError = (error: string) => {
    console.warn(error)
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Ticket Scanner</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Enter Event Secret Key"
              value={eventSecretKey}
              onChange={(e) => setEventSecretKey(e.target.value)}
            />

            <Button
              onClick={() => setScanning(!scanning)}
              className="w-full"
            >
              {scanning ? 'Stop Scanning' : 'Start Scanning'}
            </Button>

            {scanning && (
              <div id="reader" className="mt-4" />
            )}
          </div>
        </CardContent>
        <Toaster />
      </Card>
    </div>
  )
}
