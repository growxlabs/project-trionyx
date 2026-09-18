# Hero ribbon design QA

final result: passed

Scope: Replace the existing blurred hero background with an animated WebGL ribbon in Trionyx colors. This is a custom interpretation of the supplied Stripe effect, not a pixel-identical reproduction of the full Stripe page. WebGL mesh generation follows the user's explicit request, overriding the generic skill preference for raster assets.

## Evidence
- Source: C:/Users/LENOVO/AppData/Local/Temp/codex-clipboard-3b58976d-ac82-437e-9525-bcf57e436a48.png (1920 x 1080 including browser chrome).
- Existing brand/content reference: C:/Users/LENOVO/AppData/Local/Temp/codex-clipboard-5e93483b-0968-4a8f-ae59-34960653f484.png.
- Implementation: http://localhost:3001/.
- Desktop screenshot: qa/ribbon-desktop.png, 1920 x 970 capture, requested CSS viewport 1920 x 970.
- Mobile screenshot: qa/ribbon-mobile.png, 390 x 844 capture and requested CSS viewport.
- Comparison: source and desktop screenshot emitted together in the same browser-tool result. Browser chrome and different page framing excluded from the scope of comparison; assess the ribbon within each hero. No pixel-level fidelity claim. Capture is soft across all page content; subpixel typography cannot be judged precisely.
- State: initial landing page, animated ribbon, mobile menu closed in final capture.
- Focus: ribbon silhouette, edge highlight and fine diagonal texture visible in full desktop capture; separate crop unnecessary for this scoped background change.

## Findings and iteration history
1. Initial browser check caught a shader link failure caused by mismatched float precision between shader stages. Added matching precision declarations; subsequent captures show the rendered ribbon and no new shader warnings.
2. Shifted the lower curve inward to retain more of the folded highlight within the hero. Final desktop evidence shows a broad orange/coral surface, warm highlighted fold, and a clear text area.
3. Mobile headline minimum reduced from 64px to 40px; final mobile capture has readable text and contained buttons without horizontal clipping.

## Required surfaces
- Typography: existing Trionyx desktop family, weight, and hierarchy preserved. Mobile font minimum fixed. Exact Stripe typography is outside the background-only scope.
- Layout: existing Trionyx frame, header, content and button positions preserved. Ribbon sweeps from upper center toward lower right.
- Color: orange, coral, apricot and copper against the existing pearl background. Purple/pink in the source intentionally translated into Trionyx warm colors.
- Asset: genuine tessellated WebGL surface, subtle animated displacement, fine surface texture and defined fold. This recreates the visual direction; Stripe's exact mesh and animation are not available from a still image.
- Copy: existing Trionyx copy unchanged.

## Checks and limits
- TypeScript check passed.
- Browser rendering checked at desktop and mobile sizes.
- Mobile navigation opening verified. Hero canvas ignores pointer events.
- Browser console checked: historical warnings before the precision correction; no new shader errors in subsequent captures.
- Reduced-motion, viewport resizing, hidden-page/offscreen suspension, context restoration and resource cleanup implemented. Reduced-motion and context loss recovery not manually simulated.
- Existing CTA buttons have no handlers supplied by the homepage; destination implementation is outside this visual change.
- No full production build run.

## Follow-up polish
- The source ribbon extends behind the header, while this scoped implementation remains in the existing hero container.
- User review of the animation pacing and similarity remains subjective; no claim of an exact Stripe match.

## Layer refinement — 2026-09-18
- Request: make overlapping layers clearly visible using the supplied Stripe screenshot as the shape reference, retaining Trionyx colors.
- Source: C:/Users/LENOVO/AppData/Local/Temp/codex-clipboard-87097694-b1d9-4460-a834-35e9cf92c0a4.png (1920 x 1080 including browser chrome).
- New evidence: qa/layers-desktop.png (1920 x 970) and qa/layers-mobile.png (390 x 844), matching requested CSS viewport sizes. Compared source and desktop capture together in one tool result; browser chrome excluded conceptually. Existing page frame differs intentionally.
- Replaced one shaded surface with four separately drawn meshes: peach back sheet, coral trailing sheet, orange main sheet, and amber front fold. Each has independent curvature and animation phase. Premultiplied alpha blending preserves overlapping edges.
- Fonts, content, logo, spacing and buttons unchanged. Orange/coral/peach colors intentionally substitute for Stripe purple/pink. Desktop shows distinct boundaries and a light front fold; mobile shows lighter layers along the right while copy and buttons remain readable.
- Earlier issue: single thick surface and dark rust edge obscured the layered intent. Fixed by separate geometry, edge highlights and lighter colors. New captures show four distinct surfaces. Fine texture visible at full-view scale; separate crop unnecessary for scoped layer separation review.
- Browser console: no errors or warnings during this verification. Desktop and mobile screenshots inspected. Existing interaction destinations remain outside this visual-only change.
- No actionable P0/P1/P2 visual findings for this scoped refinement. This remains a custom approximation, not the exact Stripe mesh.
- final result: passed
