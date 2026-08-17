# Build: "Maya" — Multi-Agent Spend-Control Demo Frontend

## Context
This is a **standalone, fully hardcoded/scripted React demo** recreating the frontend of a hackathon-winning project called Maya — a multi-agent system that autonomously spends a fixed budget across categories for a small business, using AI sub-agents to find/price products and a rebalancing algorithm to reallocate unused budget toward higher-priority items. This demo has **no real backend, no real APIs, no real LLM calls** — everything is scripted with realistic timing/delays to *look* like a live multi-agent system running. This will be demoed live in person by me, so it needs to run reliably offline, look extremely polished, and never break.

## Tech Stack
- React + TypeScript + Vite
- Tailwind CSS
- **shadcn/ui** for all base components (buttons, cards, tabs, sliders, dialogs, progress bars) — install and configure it properly, don't hand-roll components shadcn already provides
- **Framer Motion** for animations/transitions between screens and for the agent activity visualizations
- **Recharts** for the budget bar / category breakdown charts on the summary screen
- Lucide icons for iconography
- No backend, no database, no real network calls — all data lives in local React state / hardcoded config objects

## Design Direction
Light, elegant, sleek, minimal — think modern fintech product (Stripe/Linear/Ramp aesthetic), not a hackathon project. Generous whitespace, soft shadows, subtle gradients, a refined type scale, smooth micro-interactions on every state change. Rounded corners, a restrained accent color (pick a sophisticated blue/violet — avoid literal Visa brand colors since this is a recreation, not the real confidential product). Every screen transition should be animated (fade/slide), not an abrupt cut.

## Data Model

Define three hardcoded scenarios the demo can run, selectable at the start. Each scenario has: a business type, a prefilled prompt, a total budget, and 5 categories, each with an `estimatedAllocation` (what the Envelope Agent assigns before searching) and `actualFound` (what the sub-agent "finds" when it searches), plus one category flagged as the `upgradeTarget` and one as the `surplusSource`.

```ts
type Category = {
  name: string;
  icon: string; // lucide icon name
  estimatedAllocation: number;
  actualFound: number;       // price found by sub-agent before rebalancing
  upgradedPrice?: number;    // final price after rebalancing, only set on upgradeTarget
  isUpgradeTarget: boolean;
  isSurplusSource: boolean;
  productName: string;       // e.g. "Breville Barista Pro" — realistic mock product name
  upgradedProductName?: string; // e.g. "La Marzocco Linea Mini" for the upgraded version
};

type Scenario = {
  id: string;
  businessType: string;
  prefilledPrompt: string;
  totalBudget: number;
  categories: Category[]; // exactly 5
};
```

### Scenario 1 — Coffee Stand (default/primary demo scenario)
- Prompt: "I'm opening a coffee stand with a $3,000 budget for a farmer's market and coffee stand. Purchase all necessary equipment to start my business."
- Total budget: $3,000
- Categories:
  - Espresso Machine — est $1,400 → found $1,200 → **upgrade target**, upgraded price $1,750
  - Coffee Beans (wholesale stock) — est $400 → found $350
  - Tent/Canopy — est $600 → found $380 — **surplus source**
  - Cups/Utensils — est $250 → found $220
  - Payment Processor (reader + stand) — est $350 → found $300

### Scenario 2 — Home Bakery Startup
- Prompt: "I'm starting a home bakery business with a $3,500 budget. Purchase all necessary equipment to start my business."
- Total budget: $3,500
- Categories:
  - Commercial Countertop Oven — est $1,600 → found $1,400 — **upgrade target**, upgraded price $2,100 (double-deck model)
  - Ingredient/Pantry Stock — est $500 → found $460
  - Display Case — est $700 → found $420 — **surplus source**
  - Packaging & Labels — est $300 → found $260
  - Payment Processor — est $350 → found $300

### Scenario 3 — Mobile Pet Grooming
- Prompt: "I'm launching a mobile pet grooming business with a $4,000 budget. Purchase all necessary equipment to start my business."
- Total budget: $4,000
- Categories:
  - Grooming Table (hydraulic) — est $1,200 → found $1,050 — **upgrade target**, upgraded price $1,650 (electric-lift model)
  - Clippers/Tools Kit — est $700 → found $650
  - Shampoo & Grooming Supplies — est $500 → found $450
  - Signage/Branding — est $500 → found $280 — **surplus source**
  - Payment Processor — est $350 → found $300

Make up realistic, brand-plausible (but not real trademarked-in-a-weird-way) product names for each `productName`/`upgradedProductName` — e.g. "Breville Barista Pro" tier names, generic-but-credible commercial equipment brand names.

## Screens / Flow

Build this as a single-page app with client-side state driving which screen shows (or use a simple router). Every transition animated.

### 0. Scenario Picker (small addition, not in original but needed for live demo flexibility)
A minimal, unobtrusive way for me to pick which of the 3 scenarios to run before hitting the landing screen — e.g. a tiny selector in the corner or a pre-landing screen. Should not look like a "config panel," keep it tasteful and on-brand. Default to Scenario 1 (Coffee Stand).

### 1. Landing / Hero Screen
- Maya branding (wordmark + a simple abstract logomark, since we can't use real Visa assets)
- A short tagline about autonomous spend-control for AI agents / small business procurement
- A large, polished text input box, **prefilled** with the selected scenario's `prefilledPrompt` (editable, but I'll just hit submit as-is)
- A prominent "Get Started" / submit button
- Submitting transitions to the Auth screen

### 2. Authentication Simulation Screen
- A clean "Authorizing spend authority..." screen with a loading/scanning animation (a few seconds)
- Resolves to one of two states, controllable so I can demo both live:
  - **Pass**: a satisfying success animation (checkmark, subtle confetti or glow — tasteful, not cheesy) then auto-advances to the Priority screen after ~1.5s
  - **Fail**: a clear "Authentication Failed" state with an error icon and a short explanatory line (e.g. "Spend authority could not be verified"), stays on this screen, offers a "Try Again" button that (in the demo) always succeeds on retry
- Give me an easy way to trigger fail vs pass live (e.g. a hidden toggle, keyboard shortcut, or two buttons only visible in a small dev-affordance corner) — I want to be able to show the fail state on purpose during the demo, not have it be random

### 3. Priority / Budget Allocation Screen
- Header showing the total budget and a live "Allocated: $X / $3,000" budget bar that updates in real time as sliders move
- One slider per category (5 sliders), each labeled with category name + icon, prefilled to `estimatedAllocation`, draggable to adjust
- The budget bar must visually communicate over/under budget clearly (e.g. turns red/warning state if the sum of sliders exceeds total budget)
- **Hard constraint**: the "Continue" / "Start Purchasing" button is disabled whenever total allocation exceeds the budget — this is the core product guarantee ("Maya never goes over budget") and needs to be visually unmistakable, not subtle
- A small explanatory microcopy line reinforcing that Maya enforces this automatically
- Continuing transitions to the Live Agent screen

### 4. Live Agent Execution Screen (two tabs)

**Tab A: Live Agent Activity (default tab)**
Split into two halves:
- **Left half**: a scrolling activity/event log, timestamped, showing each sub-agent's actions firing in a realistic staggered sequence (not all at once) — one sub-agent per category (so 5 sub-agents for the demo). Event types to include, styled distinctly (icon + color per type):
  - `agent_started` — "Espresso Machine Agent started searching..."
  - `products_found` — "Found 3 candidates: Breville Barista Pro ($1,200), ..."
  - `item_purchased` (shown as e.g. `RESERVED` then `CAPTURED`) — "Reserved Breville Barista Pro — $1,200"
  - `rebalancing` — a visually distinct event: "Tent came in $220 under budget — reallocating surplus" then "Upgrading Espresso Machine to La Marzocco Linea Mini — $1,750"
  - Sequence these with realistic staggered delays (e.g. 400–1200ms apart) so it feels alive, not instant
- **Right half**: an elegant animated node graph — a central "Main Agent" node with 5 sub-agent nodes around it, animated connection lines that pulse/light up when that sub-agent is actively communicating with the main agent (sync this to the left-side event log firing). Use Framer Motion for smooth pulse/glow effects on active connections. This is the visual centerpiece of the demo — make it genuinely impressive, not a static diagram.
- A status badge per sub-agent node (idle → searching → found → reserved → captured) that updates live

**Tab B: Purchases by Category**
- One card per category showing: category name, budget allocated, actual amount spent, product purchased (with the upgraded product name for the upgrade-target category), and a small "under budget" / "upgraded" badge where relevant
- A running total spent vs total budget

The full sequence (all 5 sub-agents completing + the rebalancing event + the upgrade) should take roughly 15-25 seconds total when I hit "start," so it's demoable in real time without dragging. Once complete, a "View Summary" button appears/activates (e.g. fades in or pulses subtly) to advance to the final screen.

### 5. Summary Screen
- Clear "Procurement Complete" header
- Total budget vs total spent (with a Recharts bar or donut chart)
- Amount saved/redirected via rebalancing, called out prominently (this is the money stat — e.g. "$550 automatically redirected to upgrade your Espresso Machine")
- A clean breakdown table/list of every category: allocated → spent → product purchased, with the upgraded category visually highlighted
- A closing line reinforcing the value prop (never exceeded budget, autonomously found and upgraded equipment, etc.)

## Important Implementation Notes
- Everything must be **deterministic and replayable** — no randomness that could produce a bad-looking result during a live demo. Timings/delays are fine to feel "alive" but the outcome must be identical every run.
- Make sure the whole thing works fully offline (no external API calls at runtime) since this may be demoed without reliable wifi — all "AI-found" data is baked in.
- Add a simple way to reset/restart the whole flow from any screen (e.g. a subtle reset button) in case I need to re-run the demo for a second judge.
- Prioritize the Live Agent screen's visual polish above everything else — it's the "wow" moment of the demo. The node graph animation and the staggered event log are what will make this look like a real live multi-agent system.
- Keep the whole app snappy — no jank, no layout shift, animations should feel premium (ease curves, not linear).
- This is a demo of a **real product concept** (multi-agent spend control for agentic commerce) — the actual backend, prompts, and infra are confidential and NOT to be reconstructed here. Only build what's described above: a scripted frontend that visually tells the same story.

## Deliverable
A single runnable Vite React TypeScript app (`npm install && npm run dev`) implementing all 5 screens + scenario picker as described, using shadcn/ui + Tailwind + Framer Motion + Recharts, with the three hardcoded scenarios and the deterministic scripted sequences described above. Don't stop until the full flow — scenario select → landing → auth (pass and fail states) → priority sliders with budget-cap enforcement → live agent tabs with working node graph animation and event log → summary — is complete, polished, and demo-ready.
