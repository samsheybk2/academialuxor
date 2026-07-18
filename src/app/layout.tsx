import { Providers } from "@/components/Providers"
import "./globals.css"
import type { Metadata, Viewport } from "next"

export const viewport: Viewport = {
  themeColor: "#28315F",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Academia Luxor",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/logo_academia_luxor.jpeg",
    apple: "/logo_academia_luxor.jpeg",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-gray-50 font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
