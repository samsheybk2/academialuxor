import type { Metadata } from "next"
import localFont from "next/font/local"
import { Providers } from "@/components/Providers"
import "./globals.css"

const plusJakarta = localFont({
  src: [
    {
      path: "../../public/fonts/PlusJakartaSans-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/PlusJakartaSans-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/PlusJakartaSans-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/PlusJakartaSans-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/PlusJakartaSans-ExtraBold.woff2",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-plus-jakarta",
})

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
    <html
      lang="es"
      className={`${plusJakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
