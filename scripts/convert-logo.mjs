import sharp from "sharp"
import { readFileSync, writeFileSync, existsSync } from "fs"
import { join } from "path"

const INPUT = join(process.cwd(), "public", "logo-luxor.svg")
const OUTPUT = join(process.cwd(), "public", "logo-luxor.webp")

async function convert() {
  if (!existsSync(INPUT)) {
    console.error("SVG not found:", INPUT)
    process.exit(1)
  }

  const svgBuffer = readFileSync(INPUT)

  // Generate multiple sizes for responsiveness
  const sizes = [120, 90, 60, 40]

  for (const size of sizes) {
    const out = size === 120 ? OUTPUT : join(process.cwd(), "public", `logo-luxor-${size}.webp`)
    await sharp(svgBuffer)
      .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .webp({ quality: 90 })
      .toFile(out)
    console.log(`Created: ${out} (${size}x${size})`)
  }

  // Also keep a PNG version for PDF rendering (higher quality)
  await sharp(svgBuffer)
    .resize(180, 180, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(join(process.cwd(), "public", "logo-luxor.png"))
  console.log("Created: logo-luxor.png (180x180)")

  console.log("\nDone! All formats generated.")
}

convert().catch(console.error)
