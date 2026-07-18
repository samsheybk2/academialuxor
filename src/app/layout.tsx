import { Providers } from "@/components/Providers"
import "./globals.css"

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
