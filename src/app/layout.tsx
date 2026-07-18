import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Academia LUXOR - Plataforma de Formación",
  description:
    "Plataforma de formación teórica y práctica para el personal de Supermercados Luxor",
  icons: {
    icon: "/favicon.svg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-gray-50 font-sans">
        {children}
      </body>
    </html>
  )
}
