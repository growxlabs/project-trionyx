# Trionyx Documentation & Source of Truth

> **MANDATORY INSTRUCTION FOR ALL AI AGENTS (Codex, Antigravity, Claude, etc.):**  
> Read all relevant documentation in `/docs` before planning or modifying code in this repository.  
> **DO NOT DESIGN FROM MODEL MEMORY.**

---

## 1. Core Operating Principle

```text
Existing approved implementation + /docs = Source of truth.
```

### What You Must NEVER Invent:
- **Design & Layouts**: Do not invent arbitrary sections, bento grids, or visual motifs.
- **Copy & Claims**: Do not invent fake slogans, "industry leader" fluff, or marketing exaggerations.
- **Product Facts**: Do not invent product names, specs, cure times, hardness ratings, or prices.
- **Colors**: Do not add new colors, tints, or arbitrary gradients outside the approved palette.
- **Spacing**: Do not create custom spacing scales or arbitrary margin/padding values.
- **Components**: Do not generate new button variants, card variants, or navigation styles.
- **Responsive Behavior**: Do not shrink desktop components to fit mobile. Mobile must be intentionally art-directed.
- **Features & Scope**: If a feature is not in `/docs/03-PROJECT-SCOPE.md`, do not build it.
- **Roles & Permissions**: Do not infer roles or bypass server-side authorization.
- **Data & Business Rules**: If a fact is unknown, stop and flag it instead of hallucinating.

---

## 2. Documentation Architecture

```text
/docs
│
├── README.md                          # Entry point and global agent directives (this file)
│
├── 01-PROJECT-OVERVIEW.md             # Canonical brand definition, positioning, and goals
├── 02-BUSINESS-CONTEXT.md             # Operating model, relationships, confirmed facts vs unknowns
├── 03-PROJECT-SCOPE.md                # In-scope public/dealer/private surfaces vs explicit out-of-scope
├── 04-INFORMATION-ARCHITECTURE.md     # Exact URL routes, page hierarchy, and navigation maps
├── 05-CONTENT-SOURCE-OF-TRUTH.md      # Approved copy, verified specs, history, and proof points
│
├── 06-DESIGN-LANGUAGE.md              # Aesthetic philosophy, automotive materiality, tone of voice
├── 07-DESIGN-SYSTEM.md                # Concrete tokens (colors, typography, radii, spacing, shadows)
├── 08-RESPONSIVE-RULES.md             # Desktop vs tablet vs mobile art-direction and layout rules
├── 09-COMPONENT-SYSTEM.md             # Specifications and constraints for all approved primitives
├── 10-IMAGE-AND-MEDIA-RULES.md        # Media guidelines, aspect ratios, crops, and photography rules
│
├── 11-FRONTEND-ARCHITECTURE.md        # Next.js structure, client/server boundaries, state & styling
├── 12-BACKEND-ARCHITECTURE.md         # API routes, business logic, operations, and server services
├── 13-AUTH-ROLES-PERMISSIONS.md       # Authorization model, role definitions, and access control
├── 14-DATA-MODEL.md                   # Entity schemas, relationships, field constraints, and types
├── 15-INTEGRATIONS.md                 # External dependencies, email, storage, and service providers
├── 16-DEPLOYMENT.md                   # Environments, domains, build pipeline, and observability
│
├── 17-SEO-AEO-GEO.md                  # Metadata, structured data, canonical URLs, and search optimization
├── 18-ACCESSIBILITY-PERFORMANCE.md   # WCAG compliance, keyboard interaction, and Core Web Vitals
├── 19-QA-ACCEPTANCE.md                # Comprehensive pre-landing checklists and verification criteria
└── 20-AGENT-RULES.md                  # Strict guardrails and operational workflow for AI agents
```

---

## 3. The Required Agent Workflow

For every task, modification, or bugfix:

1. **Read `/docs/README.md`** and the relevant topic document(s).
2. **Inspect existing approved code** in `src/` to match real implementations.
3. **Build ONLY the requested component or section**.
4. **Compare desktop implementation** against `/docs`.
5. **Compare mobile implementation** against `/docs/08-RESPONSIVE-RULES.md`.
6. **Execute QA checks** per `/docs/19-QA-ACCEPTANCE.md`.
7. **Stop and request user review** before taking unrequested initiatives.
