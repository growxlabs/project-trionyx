# 10 — Image & Media Rules

> **MEDIA INTEGRITY DIRECTIVE:**  
> Imagery communicates technical competence, surface finish, and laboratory precision.  
> **Never insert random supercars or stock sports cars just because they look fast or flashy.**

---

## 1. Section-to-Image Mapping

| Section | Approved Imagery Type | Visual Focus | Canonical File / Source |
| :--- | :--- | :--- | :--- |
| **Hero** | Signature Trionyx Material Artwork | Animated WebGL mesh ribbon; tactile translucent polymer fibers | `MeshGradientCanvas.tsx` |
| **About (Primary)** | Skilled Workshop Application | Professional detailer stretching PPF or buffing ceramic clearcoat | `/images/about/ppf-installation.jpg` |
| **About (Accent)** | Coated Finished Surface | Extreme close-up of water beading and metallic clearcoat reflection | `/images/about/ceramic-coating-surface.jpg` |
| **Why Trionyx (Materials)** | Film & Chemical Layer | Translucent layered protective film roll with smooth curvature | `/trionyx-materials.png` |
| **Dealer / Network** | Geographic Distribution & Studios | Interactive SVG network routes originating from Vijayawada HQ | `IndiaNetworkMap.tsx` |
| **Customer Reviews** | Real Studio & Installer Profiles | Authentic studio owners, detailing technicians, and headshots | Verified studio image URLs |

---

## 2. Framing, Geometry & Aspect Ratios

- **Workshop / Installation**: Aspect ratio `4:5` (portrait orientation, rounded `4px`, border `1px solid rgba(23,23,20,0.08)`).
- **Surface Detail / Reflection**: Aspect ratio `4:3` (landscape orientation, rounded `4px`, `border-2 border-[#F5F5EE]`).
- **Product Packaging**: Clean neutral cutout on `#FAF8F6` background, centered with subtle drop shadow.

---

## 3. Strict Photography Guardrails

- ❌ **No Supercar Slop**: Never add stock Lamborghinis, Ferraris, or Bugattis to standard product cards. Focus on the protected surface, not the car's price tag.
- ❌ **No Darkroom / Neon Garages**: Avoid over-saturated purple, green, or neon-lit garages that look like fast-and-furious video games.
- ❌ **Authentic Indian Context**: Respect Indian automotive driving conditions (sunlight, monsoons, road dust, real workshops).
- ❌ **Zero Distortion**: Maintain `object-cover` or `object-contain` without stretching aspect ratios. Always provide proper `sizes` and parent element heights when using Next.js `Image`.
