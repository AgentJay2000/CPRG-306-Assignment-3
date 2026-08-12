import { Geist, Geist_Mono, Oswald } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Load Geist Sans font
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Load Geist Mono font 
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Load Oswald font
const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

// Global metadata for the entire app 
export const metadata = {
  title: "IMR Movie Rentals",
  description: "Internet Movies Rental Company - movie database portal",
};

// Root layout wraps every page in the app
export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${oswald.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
      
        {/* Global navigation bar */}
        <Navbar />

        {/* Main content area grows to fill available space */}
        <main className="flex-1">{children}</main>

        {/* Global footer */}
        <Footer />
      </body>
    </html>
  );
}
