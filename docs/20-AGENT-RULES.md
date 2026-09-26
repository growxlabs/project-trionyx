# 20 — Agent Rules & Operational Guardrails

> **CARDINAL RULE FOR ALL AI AGENTS:**  
> ```text
> DO NOT DESIGN FROM MODEL MEMORY.
> ```

---

## 1. Absolute Guardrails

1. **Read `/docs` First**: Never make an architectural or styling decision without cross-referencing `/docs`.
2. **Use Project Data Only**: If a specification, claim, or company detail is not in `/docs/05-CONTENT-SOURCE-OF-TRUTH.md`, **stop and ask**. Do not invent facts.
3. **Do Not Invent UI**: Do not invent novel card designs, buttons, badges, or layouts that are not documented in `/docs/09-COMPONENT-SYSTEM.md`.
4. **Do Not Invent Copy**: Never write generic marketing fluff ("We are the leading...", "Best in class...").
5. **Do Not Introduce Another Color**: The palette is strictly defined in `/docs/07-DESIGN-SYSTEM.md`. Zero arbitrary hex codes.
6. **Do Not Introduce Another Font**: Do not load or use fonts outside the approved typography system. No inline `fontFamily` hacks.
7. **Do Not Modify Approved Sections**: When asked to fix or build a specific component (e.g. Hero), do not touch or refactor unrelated sections (e.g. About, Trust, Reviews).
8. **Do Not Change Desktop While Fixing Mobile**: Mobile adjustments must use responsive Tailwind prefixes (`max-sm:`, `sm:`, `md:`) or mobile-specific components without mutating the approved desktop presentation.
9. **Never Determine Auth Roles from Strings**: Server-side role checks and permissions must be verified against database records.
10. **Stop and Flag Missing Data**: It is always correct to flag a missing business fact rather than filling the vacuum with hallucinations.

---

## 2. Standard Task Execution Loop

```text
1. Read /docs/README.md and relevant section doc.
2. Inspect existing approved implementation in src/.
3. Build ONLY the requested component or fix.
4. Verify desktop appearance against /docs/07-DESIGN-SYSTEM.md.
5. Verify mobile appearance against /docs/08-RESPONSIVE-RULES.md.
6. Run QA checklist from /docs/19-QA-ACCEPTANCE.md.
7. Present concise walkthrough and request user review.
```
