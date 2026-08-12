export default function Footer() {
  return (
    <footer className="border-t border-border mt-12 py-8 px-8 text-center">

      {/* Brand / company name */}
      <p className="font-display font-semibold tracking-wide text-foreground">
        IMR MOVIE RENTALS
      </p>

      {/* Contact + location info */}
      <p className="text-muted text-sm mt-2">
        123 Rental Row, Calgary, AB &nbsp;|&nbsp; (403) 555-0142 &nbsp;|&nbsp; support@imr.com
      </p>

      {/* Dynamic copyright year */}
      <p className="text-muted text-sm mt-1">
        &copy; {new Date().getFullYear()} IMR Movie Rentals. All rights reserved.
      </p>
    </footer>
  )
}
