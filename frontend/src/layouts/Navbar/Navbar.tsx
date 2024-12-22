import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useAuth0 } from '@auth0/auth0-react'
import { NotificationBell } from "@/layouts/NotificationsPage/components/NotificationBell";
import { CartIcon } from "../Cart/CartIconV2"
export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isAuthenticated, loginWithRedirect, logout } = useAuth0()
  console.log("Authentication State " + isAuthenticated)


  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="font-bold text-2xl">
          EventTix
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/events" className="text-foreground/60 hover:text-foreground">
            Events
          </Link>
          {isAuthenticated ? (
            <Link to="/calendar" className="text-foreground/60 hover:text-foreground">
              Calendar
            </Link>
          ) : null}
          <Link to="/about" className="text-foreground/60 hover:text-foreground">
            About
          </Link>

          {isAuthenticated ? (
            <Link to="/profile" className="text-foreground/60 hover:text-foreground">
              Profile
            </Link>
          ) : null}

          {isAuthenticated ? (
            <Link to="/user-bookings" className="text-foreground/60 hover:text-foreground">
              My Bookings
            </Link>
          ) : null}
          {isAuthenticated && (
            <>
              <NotificationBell />
              <CartIcon />
            </>
          )}
        </div>




        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <Button onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })} >
              Sign Out
            </Button>
          ) : (
            <Button onClick={() => loginWithRedirect()}>Sign In</Button>
          )}
          <ModeToggle />
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-b">
          <div className="container py-4 flex flex-col gap-4">
            <Link to="/events" className="text-foreground/60 hover:text-foreground">
              Events
            </Link>

            <Link to="/about" className="text-foreground/60 hover:text-foreground">
              About
            </Link>

            {isAuthenticated ? (
              <Link to="/calendar" className="text-foreground/60 hover:text-foreground">
                Calendar
              </Link>
            ) : null}

            {isAuthenticated ? (
              <Link to="/profile" className="text-foreground/60 hover:text-foreground">
                Profile
              </Link>
            ) : null}

            {isAuthenticated ? (
              <Link to="/user-bookings" className="text-foreground/60 hover:text-foreground">
                My Bookings
              </Link>
            ) : null}
            {isAuthenticated && (
              <>
                <Link to="/user-notifications" className="text-foreground/60 hover:text-foreground">
                  <span>Notifications</span>
                  <NotificationBell />
                </Link>
                <div className="text-foreground/60 hover:text-foreground">
                  <span>Cart</span>
                  <CartIcon />
                </div>
              </>
            )}
            <div className="flex flex-col gap-2">
              {isAuthenticated ? (
                <Button  onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
                  Sign Out
                </Button>
              ) : (
                <Button  onClick={() => loginWithRedirect()}>Sign In</Button>
              )}
              <ModeToggle />
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}