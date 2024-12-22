import { SiLinkedin } from "@icons-pack/react-simple-icons"

export function Footer() {
    const app_link = import.meta.env.VITE_APP_LINK
    
    return (
        <footer className="border-t bg-background">
            <div className="container py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Company Info */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-2xl">EventTix</h3>
                        <p className="text-muted-foreground">
                            Your one-stop destination for booking event tickets.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-semibold mb-4">Quick Links</h4>
                        <div className="space-y-3">
                            <a href={`${app_link}/events`} className="block text-muted-foreground hover:text-foreground">
                                Browse Events
                            </a>
                            <a href={`${app_link}/calendar`} className="block text-muted-foreground hover:text-foreground">
                                Event Calendar
                            </a>
                        </div>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="font-semibold mb-4">Support</h4>
                        <div className="space-y-3">
                            <a href={`${app_link}/help`} className="block text-muted-foreground hover:text-foreground">
                                Help Center
                            </a>
                            <a href={`${app_link}/about`} className="block text-muted-foreground hover:text-foreground">
                                About
                            </a>
                            <a href={`${app_link}/privacy`} className="block text-muted-foreground hover:text-foreground">
                                Privacy Policy
                            </a>
                        </div>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-semibold mb-4">Contact</h4>
                        <div className="space-y-3 text-muted-foreground">
                            <span className="block text-muted-foreground hover:text-foreground">Email: harish.va1910@gmail.com</span>
                            <a
                                href="https://www.linkedin.com/in/harishva1997/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-muted-foreground hover:text-foreground"
                            >
                                <SiLinkedin className="inline-block h-6 w-6" />
                                <span className="ml-2">LinkedIn</span>
                            </a>
                        </div>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t text-center text-muted-foreground">
                    <p>© {new Date().getFullYear()} EventTix. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}
