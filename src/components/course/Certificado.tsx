"use client"

import { useState, useRef } from "react"
import { QRCodeCanvas } from "qrcode.react"
import { Download, ShieldCheck, QrCode, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/Button"
import jsPDF from "jspdf"

interface CertificadoProps {
  nombre: string
  curso: string
  fecha: string
  duracion: string
  tipo?: "curso" | "taller"
  preview?: boolean
}

function generateCertId(nombre: string, curso: string, fecha: string): string {
  const str = `${nombre}-${curso}-${fecha}`
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0
  }
  const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, "0")
  return `LX-${hex}-${Date.now().toString(36).toUpperCase().slice(-4)}`
}

const QR_COLOR = "#28315F"
const P = "#28315F"

function loadImage(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      const c = document.createElement("canvas")
      c.width = img.naturalWidth
      c.height = img.naturalHeight
      const ctx = c.getContext("2d")
      if (!ctx) return reject(new Error("no ctx"))
      ctx.drawImage(img, 0, 0)
      resolve(c.toDataURL("image/png"))
    }
    img.onerror = () => reject(new Error(url))
    img.src = url
  })
}

async function buildPdf(origin: string, nombre: string, curso: string, fecha: string, duracion: string, certId: string, qrDataUrl: string, tipo: "curso" | "taller"): Promise<Blob> {
  const W = 900, H = 630, cx = W / 2
  const tipoLabel = tipo === "taller" ? "Aprobación de Taller" : "Aprobación de Curso"
  const tipoCompleto = tipo === "taller" ? "ha completado exitosamente el taller" : "ha completado exitosamente el curso"
  const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [W, H] })

  // Fondo blanco
  pdf.setFillColor(255, 255, 255)
  pdf.rect(0, 0, W, H, "F")

  pdf.setDrawColor(40, 49, 95); pdf.setLineWidth(2.5); pdf.roundedRect(10, 10, W - 20, H - 20, 10, 10)
  pdf.setDrawColor(139, 156, 199); pdf.setLineWidth(0.8); pdf.roundedRect(16, 16, W - 32, H - 32, 6, 6)

  try { const d = await loadImage(`${origin}/dorado.webp`); pdf.addImage(d, "PNG", 38, 30, 110, 110) } catch {}

  if (qrDataUrl) {
    try { const qr = await loadImage(qrDataUrl); pdf.addImage(qr, "PNG", W - 138, 30, 100, 100) } catch {}
  }
  pdf.setFontSize(5.5); pdf.setTextColor(40, 49, 95)
  pdf.text("VALIDAR", W - 88, 92, { align: "center" })

  try {
    const l = await loadImage(`${origin}/logo.webp`)
    pdf.addImage(l, "PNG", cx - 168.75, 55, 337.5, 0)
  } catch {}

  pdf.setFontSize(65); pdf.setTextColor(40, 49, 95)
  pdf.text(tipoLabel, cx, 200, { align: "center" })
  pdf.setDrawColor(139, 156, 199); pdf.setLineWidth(2)
  pdf.line(cx - 45, 218, cx + 45, 218)
  pdf.setFontSize(41); pdf.setTextColor(107, 114, 128)
  pdf.text("Se certifica que", cx, 255, { align: "center" })
  pdf.setFontSize(38); pdf.setTextColor(40, 49, 95)
  pdf.text(nombre, cx, 300, { align: "center" })
  const nw = pdf.getTextWidth(nombre)
  pdf.setDrawColor(139, 156, 199); pdf.setLineWidth(1.2)
  pdf.line(cx - nw / 2 - 5, 306, cx + nw / 2 + 5, 306)
  pdf.setFontSize(41); pdf.setTextColor(107, 114, 128)
  pdf.text(tipoCompleto, cx, 350, { align: "center" })
  pdf.setFontSize(57); pdf.setTextColor(61, 79, 124)
  pdf.text(curso, cx, 400, { align: "center" })
  pdf.setFontSize(28); pdf.setTextColor(40, 49, 95)
  pdf.text(`Duración: ${duracion}  |  Fecha: ${fecha}`, cx, 450, { align: "center" })
  pdf.setFontSize(21); pdf.setTextColor(139, 156, 199)
  pdf.text(`ID: ${certId}`, cx, 480, { align: "center" })

  pdf.setFillColor(40, 49, 95); pdf.rect(0, H - 32, W, 32, "F")
  pdf.setFontSize(16); pdf.setTextColor(255, 255, 255)
  ;[{ t: "Gerencia de Talento Humano", x: W * 0.18 },
    { t: "Coordinación de Capacitación y Desarrollo", x: W * 0.5 },
    { t: "Coordinación de Evaluación", x: W * 0.82 }
  ].forEach(s => pdf.text(s.t, s.x, H - 16, { align: "center" }))

  return pdf.output("blob")
}

export function Certificado({ nombre, curso, fecha, duracion, tipo = "curso", preview }: CertificadoProps) {
  const [pdfUrl, setPdfUrl] = useState<string>("")
  const [descargando, setDescargando] = useState(false)
  const pdfGenRef = useRef(false)
  const certId = generateCertId(nombre, curso, fecha)
  const validationUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/validar-certificado?id=${certId}`
  const originRef = useRef("")
  if (typeof window !== "undefined" && !originRef.current) originRef.current = window.location.origin
  const origin = originRef.current

  async function handleDescargar() {
    setDescargando(true)
    try {
      const blob = await buildPdf(origin, nombre, curso, fecha, duracion, certId, "", tipo)
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url; a.download = `Certificado-${curso.replace(/\s+/g, "_")}.pdf`
      a.click(); URL.revokeObjectURL(url)
    } catch {}
    setDescargando(false)
  }

  return (
    <>
      {/* Desktop: full-screen overlay */}
      <div className="hidden lg:flex fixed inset-0 z-50 bg-white">
        <div className="flex-1 min-w-0 bg-gray-100">
          {pdfUrl ? (
            <iframe src={pdfUrl} className="w-full h-full" style={{ border: "none" }} title="Certificado PDF" />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400 text-sm">Generando certificado...</p>
            </div>
          )}
        </div>

        <div className="w-[340px] shrink-0 bg-gradient-to-b from-luxor-primary to-luxor-secondary text-white p-5 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold">¡Felicitaciones!</h2>
            <p className="text-base text-luxor-accent leading-relaxed">
              Has completado exitosamente el {tipo === "taller" ? "taller" : "curso"} <strong className="text-white">{curso}</strong>. Este certificado acredita tu participación y logro académico.
            </p>
          </div>

          <div className="border-t border-white/20" />

          <div className="space-y-3">
            <h3 className="text-base font-bold uppercase tracking-wider text-luxor-accent">Validar autenticidad</h3>
            <p className="text-sm text-white/70 leading-relaxed">
              Cualquier persona puede verificar la autenticidad de este certificado:
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                  <QrCode className="w-5 h-5 text-luxor-accent" />
                </div>
                <div>
                  <p className="text-base font-semibold text-white">1. Escanea el código QR</p>
                  <p className="text-sm text-white/60">Ubicado en la esquina superior derecha del certificado</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                  <ExternalLink className="w-5 h-5 text-luxor-accent" />
                </div>
                <div>
                  <p className="text-base font-semibold text-white">2. Ingresa al portal de validación</p>
                  <p className="text-sm text-white/60">Serás redirigido a la página de verificación de Academia LUXOR</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-5 h-5 text-luxor-accent" />
                </div>
                <div>
                  <p className="text-base font-semibold text-white">3. Confirma la información</p>
                  <p className="text-sm text-white/60">El sistema mostrará los datos del certificado y su estado de validez</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/20" />

          <div className="text-center">
            <p className="text-[10px] text-white/40 font-mono tracking-wider">ID: {certId}</p>
          </div>
        </div>
      </div>

      {/* Mobile: no viewer, just message + download */}
      <div className="lg:hidden bg-gradient-to-br from-luxor-primary/5 via-white to-luxor-accent/10 p-6 space-y-5">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-gray-900">¡Felicitaciones!</h2>
          <p className="text-sm text-gray-500">
            Has completado exitosamente el {tipo === "taller" ? "taller" : "curso"} <strong>{curso}</strong>
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 space-y-4 border border-gray-100">
          <div className="flex items-center gap-2 text-luxor-primary">
            <ShieldCheck className="w-5 h-5" />
            <h3 className="text-sm font-bold uppercase tracking-wider">Validar autenticidad</h3>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            Cualquier persona puede verificar este certificado escaneando el código QR que aparece en él o ingresando el ID al portal de validación de Academia LUXOR.
          </p>
          <p className="text-[10px] text-gray-400 font-mono tracking-wider text-center">ID: {certId}</p>
        </div>

        <Button onClick={handleDescargar} disabled={descargando} className="w-full">
          {descargando ? (
            <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generando...</span>
          ) : (
            <span className="flex items-center justify-center gap-2"><Download className="w-4 h-4" /> Descargar certificado</span>
          )}
        </Button>
      </div>

      {/* Hidden QR canvas */}
      <div className="absolute -left-[9999px]">
        <QRCodeCanvas ref={(node) => {
          if (node && !pdfGenRef.current) {
            pdfGenRef.current = true
            const nodeRef = node
            setTimeout(() => {
              buildPdf(origin, nombre, curso, fecha, duracion, certId, nodeRef.toDataURL("image/png"), tipo)
                .then(blob => setPdfUrl(URL.createObjectURL(blob)))
                .catch(() => {})
            }, 500)
          }
        }} value={validationUrl} size={120} level="M" fgColor={QR_COLOR} bgColor="#ffffff" includeMargin={false} />
      </div>
    </>
  )
}
