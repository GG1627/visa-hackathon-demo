import { useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle, ArrowRight, ArrowRightLeft, BadgeCheck, Check, CheckCircle2, ChefHat, ChevronDown, ChevronUp, CircleDollarSign,
  Coffee, CreditCard, CupSoda, Droplets, ExternalLink, Eye, Gauge, LoaderCircle, LockKeyhole,
  Network, PackageCheck, PackageOpen, Palette, Play, RefreshCw, RotateCcw, ScanLine, Scissors,
  ShieldCheck, Store, TableProperties, Tags, TentTree, Wheat,
  XCircle, Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import GradientWaves from "@/components/GradientWaves";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { getPaidPrice, getTotalSpent, money, scenarios, type Category, type Scenario } from "@/data";

type Screen = "landing" | "auth" | "priority" | "live" | "summary";
type AuthIntent = "pass" | "fail";
type AgentStatus = "idle" | "searching" | "found" | "reserved" | "captured";
type EventKind = "agent_started" | "products_found" | "item_purchased" | "rebalancing" | "complete";
type AgentEvent = { at: number; kind: EventKind; message: string; category?: number; status?: AgentStatus; label?: string };

const icons: Record<Category["icon"], LucideIcon> = {
  Coffee, PackageOpen, TentTree, CupSoda, CreditCard, ChefHat, Wheat, Store, Tags,
  TableProperties, Scissors, Droplets, Palette,
};

const agentThemes = [
  { accent: "text-[#8FA5FF]", border: "border-l-[#3A5BFF]", outline: "border-[#3A5BFF]", icon: "bg-[#3A5BFF]/15 text-[#8FA5FF]", line: "#3A5BFF" },
  { accent: "text-cyan-300", border: "border-l-cyan-400", outline: "border-cyan-400", icon: "bg-cyan-400/10 text-cyan-300", line: "#22D3EE" },
  { accent: "text-[#FF8BD8]", border: "border-l-[#FF8BD8]", outline: "border-[#FF8BD8]", icon: "bg-[#FF8BD8]/10 text-[#FF8BD8]", line: "#FF8BD8" },
  { accent: "text-[#F7B500]", border: "border-l-[#F7B500]", outline: "border-[#F7B500]", icon: "bg-[#F7B500]/10 text-[#F7B500]", line: "#F7B500" },
  { accent: "text-emerald-300", border: "border-l-emerald-400", outline: "border-emerald-400", icon: "bg-emerald-400/10 text-emerald-300", line: "#34D399" },
] as const;

const purchaseAddOns: Record<Category["icon"], [string, string]> = {
  Coffee: ["Commercial portafilter starter set", "Water-line and cleaning kit"],
  PackageOpen: ["Dial-in sample pack", "Airtight storage set"],
  TentTree: ["Weighted anchor kit", "Weatherproof sidewall set"],
  CupSoda: ["Compostable lids and sleeves", "Service and condiment organizers"],
  CreditCard: ["Counter stand and charging cable", "Secure checkout activation"],
  ChefHat: ["Baking tray starter set", "Heat-safe prep accessories"],
  Wheat: ["Core dry-goods assortment", "Food-safe storage containers"],
  Store: ["Display tray set", "Counter mounting hardware"],
  Tags: ["Printed label assortment", "Food-safe packaging inserts"],
  TableProperties: ["Non-slip grooming mat", "Restraint arm and loop set"],
  Scissors: ["Blade and comb assortment", "Tool care and charging kit"],
  Droplets: ["Coat-specific wash set", "Towels and sanitation supplies"],
  Palette: ["Vehicle decal set", "Booking QR and contact signage"],
};

const screenMotion = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: .45, ease: [.22, 1, .36, 1] as const },
};

function MayaMark({ compact = false, inverse = false }: { compact?: boolean; inverse?: boolean }) {
  return <div className="flex items-center">
    <span className={cn("font-semibold tracking-[-.045em]", inverse ? "text-white" : "text-slate-950", compact ? "text-xl" : "text-2xl")}><span className={inverse ? "text-[#F7B500]" : "text-indigo-700"}>Visa</span> Maya</span>
  </div>;
}

function AmbientShell({ children, showReset, onReset }: { children: React.ReactNode; showReset?: boolean; onReset?: () => void }) {
  return <main className="maya-app-shell relative min-h-screen overflow-hidden text-white">
    <div className="ambient ambient-one" /><div className="ambient ambient-two" /><div className="ambient-grid" />
    {showReset && <header className="maya-workspace-header fixed left-0 right-0 top-0 z-40 px-5 sm:px-8">
      <div className="mx-auto flex h-[72px] w-full max-w-[1440px] items-center justify-between">
        <MayaMark compact inverse />
        <Button variant="ghost" size="sm" onClick={onReset} className="text-white/50 hover:bg-white/[.07] hover:text-white"><RotateCcw className="mr-2 h-3.5 w-3.5" /> Start over</Button>
      </div>
    </header>}
    <div className="relative z-10">{children}</div>
  </main>;
}

function LandingScreen({ scenario, prompt, setPrompt, onCycle, authIntent, setAuthIntent, onSubmit }: { scenario: Scenario; prompt: string; setPrompt: (v: string) => void; onCycle: (direction: -1 | 1) => void; authIntent: AuthIntent; setAuthIntent: (v: AuthIntent) => void; onSubmit: () => void }) {
  return <motion.section {...screenMotion} className="launch-screen min-h-screen px-5 sm:px-8">
    <div className="gradient-waves-layer absolute inset-0" aria-hidden="true">
      <GradientWaves
        horizonColor="#0A0E27"
        waveColor="#1434CB"
        crestColor="#F7B500"
        speed={0.28}
        amplitude={2.35}
        waveScale={0.56}
        waveRatio={0.86}
        swell={30}
        turbulence={14}
        tilt={1.08}
        zoom={0.94}
        height={5.35}
        fogDepth={20}
        detail="medium"
        brightness={1.08}
        opacity={1}
        mouseInteraction
        parallaxStrength={0.32}
        grain
        grainIntensity={0.025}
      />
    </div>
    <div className="gradient-waves-shade absolute inset-0" aria-hidden="true" />
    <div className="maya-hero-shell relative z-10 mx-auto flex min-h-screen w-full flex-col">
      <header className="flex h-20 items-center justify-between border-b border-white/10"><MayaMark inverse /><div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[.06] px-3 py-1.5 text-xs font-medium text-white/60 backdrop-blur"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Spend controls active</div></header>
      <div className="flex flex-1 flex-col items-center justify-center py-12 text-center lg:py-14">
        <div className="launch-kicker"><span />Autonomous procurement for small business</div>
        <h1 className="launch-title mt-5">Start with intent. <em>Finish under budget.</em></h1>
        <p className="maya-hero-description mt-5 text-base leading-7 text-white/65 sm:text-lg">One request becomes a complete purchasing plan—sourced, optimized, and governed from the first dollar to the last.</p>
        <motion.div initial={{ y: 16 }} animate={{ y: 0 }} transition={{ delay: .12, duration: .6, ease: [.19, 1, .22, 1] }} className="prompt-composer mt-9 w-full text-left">
          <div className="relative px-5 py-4 sm:px-7 sm:py-5">
            <label htmlFor="procurement-prompt" className="mb-3 block text-sm font-semibold text-indigo-700">What can I do for you today?</label>
            <textarea id="procurement-prompt" value={prompt} onChange={e => setPrompt(e.target.value)} rows={3} spellCheck="true" className="prompt-textarea w-full resize-none bg-transparent pr-12 text-lg leading-8 text-[#0A0E27] outline-none placeholder:text-slate-400 sm:text-xl" />
            <div className="prompt-arrows absolute bottom-5 right-5 z-10 flex flex-col sm:right-7">
              <button type="button" onClick={() => onCycle(-1)} aria-label="Previous prefilled prompt" title="Previous prompt" className="grid h-7 w-8 place-items-center"><ChevronUp className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={() => onCycle(1)} aria-label="Next prefilled prompt" title="Next prompt" className="grid h-7 w-8 place-items-center"><ChevronDown className="h-3.5 w-3.5" /></button>
            </div>
          </div>
          <div className="flex flex-col gap-4 border-t border-[#0A0E27]/10 bg-white/35 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-center gap-2 text-xs text-slate-600"><LockKeyhole className="h-3.5 w-3.5" /> Authority verified before spend</div>
            <Button
              size="lg"
              onClick={onSubmit}
              disabled={!prompt.trim()}
              className="group h-11 rounded-[11px] border border-white/10 bg-[#0A0E27] px-5 text-sm text-white shadow-[0_10px_24px_-14px_rgba(10,14,39,.85),inset_0_1px_0_rgba(255,255,255,.12)] hover:-translate-y-px hover:bg-[#111634]"
            >
              Build my plan
              <ArrowRight className="ml-3 h-4 w-4 text-[#F7B500] transition-transform duration-300 group-hover:translate-x-0.5" />
            </Button>
          </div>
        </motion.div>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-xs text-white/35"><span>Hard budget boundary</span><span className="h-1 w-1 rounded-full bg-[#F7B500]" /><span>Visible agent activity</span><span className="h-1 w-1 rounded-full bg-[#F7B500]" /><span>Automatic rebalancing</span></div>
      </div>
      <footer className="flex items-center justify-between border-t border-white/10 py-5 text-[10px] font-medium uppercase tracking-[.16em] text-white/30"><span>Visa Maya · Spend control for autonomous commerce</span><span className="hidden sm:inline">Bounded · visible · accountable</span></footer>
    </div>
    <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1 rounded-full border border-white/10 bg-white/[.06] p-1 text-[10px] text-white/35 backdrop-blur-xl">
      {/* <span className="mr-1 font-medium">Auth path</span> */}
      <button onClick={() => setAuthIntent("pass")} className={cn("rounded-full px-2.5 py-1 transition", authIntent === "pass" && "bg-emerald-400/15 font-semibold text-emerald-300")}>Pass</button>
      <button onClick={() => setAuthIntent("fail")} className={cn("rounded-full px-2.5 py-1 transition", authIntent === "fail" && "bg-rose-400/15 font-semibold text-rose-300")}>Fail</button>
    </div>
  </motion.section>;
}

function AuthScreen({ intent, onSuccess }: { intent: AuthIntent; onSuccess: () => void }) {
  const [phase, setPhase] = useState<"scanning" | "success" | "failed">("scanning");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    setPhase("scanning");
    const result = window.setTimeout(() => setPhase(attempt > 0 || intent === "pass" ? "success" : "failed"), 2400);
    return () => window.clearTimeout(result);
  }, [intent, attempt]);
  useEffect(() => {
    if (phase !== "success") return;
    const advance = window.setTimeout(onSuccess, 1400);
    return () => window.clearTimeout(advance);
  }, [phase, onSuccess]);

  return <motion.section {...screenMotion} className="workspace-section flex min-h-screen items-center justify-center px-5 py-24">
    <Card className="auth-dossier relative w-full max-w-xl overflow-hidden text-center">
      <div className={cn("absolute inset-x-0 top-0 h-[3px] transition-colors", phase === "failed" ? "bg-rose-500" : phase === "success" ? "bg-emerald-500" : "bg-[#F7B500]")} />
      <CardContent className="px-8 py-12 sm:px-14 sm:py-16">
        <div className="mb-9 font-mono text-[10px] font-bold uppercase tracking-[.22em] text-[#8FA5FF]/65">Maya / Authority gate / 01</div>
        <AnimatePresence mode="wait">
          {phase === "scanning" && <motion.div key="scan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: .95 }}>
            <div className="scanner mx-auto"><ShieldCheck className="h-10 w-10 text-[#8FA5FF]" /><motion.div className="scan-line" animate={{ y: [-36, 36, -36] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} /></div>
            <h1 className="mt-8 text-2xl font-semibold tracking-tight">Authorizing spend authority…</h1>
            <p className="mt-3 text-sm leading-6 text-white/50">Verifying identity, business controls, and transaction limits.</p>
            <div className="mt-8 space-y-3 text-left">
              {["Identity & business profile", "Procurement permissions", "Budget guardrail"].map((label, i) => <motion.div key={label} initial={{ opacity: .35 }} animate={{ opacity: [0.35, 1, .35] }} transition={{ delay: i * .35, repeat: Infinity, duration: 1.6 }} className="auth-check-row flex items-center gap-3 px-4 py-3 text-sm text-white/65"><LoaderCircle className="h-4 w-4 animate-spin text-[#8FA5FF]" />{label}<span className="ml-auto font-mono text-[9px] uppercase tracking-wider text-white/25">checking</span></motion.div>)}
            </div>
          </motion.div>}
          {phase === "success" && <motion.div key="success" initial={{ opacity: 0, scale: .85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <div className="success-rings mx-auto"><motion.div initial={{ scale: 0, rotate: -25 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 220, damping: 14 }} className="grid h-24 w-24 place-items-center rounded-full bg-emerald-500 text-white shadow-xl shadow-emerald-950/50"><Check className="h-11 w-11" strokeWidth={2.5} /></motion.div></div>
            <h1 className="mt-8 text-2xl font-semibold tracking-tight">Authority confirmed</h1><p className="mt-3 text-sm text-white/50">Your secure spending envelope is ready.</p>
          </motion.div>}
          {phase === "failed" && <motion.div key="failed" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-rose-400/10 text-rose-300"><XCircle className="h-11 w-11" /></div>
            <h1 className="mt-8 text-2xl font-semibold tracking-tight">Authentication failed</h1><p className="mt-3 text-sm leading-6 text-white/50">Spend authority could not be verified. No permissions were granted and no funds were moved.</p>
            <Button className="mt-8" onClick={() => setAttempt(a => a + 1)}><RefreshCw className="mr-2 h-4 w-4" /> Try again</Button>
          </motion.div>}
        </AnimatePresence>
      </CardContent>
    </Card>
  </motion.section>;
}

function PriorityScreen({ scenario, allocations, setAllocations, onContinue }: { scenario: Scenario; allocations: number[]; setAllocations: (v: number[]) => void; onContinue: () => void }) {
  const total = allocations.reduce((a, b) => a + b, 0);
  const over = total > scenario.totalBudget;
  const remaining = scenario.totalBudget - total;
  const update = (index: number, value: number) => setAllocations(allocations.map((a, i) => i === index ? value : a));
  return <motion.section {...screenMotion} className="workspace-section mx-auto min-h-screen max-w-[1280px] px-5 pb-16 pt-28 sm:px-8">
    <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
      <div><div className="section-kicker"><Gauge className="h-3.5 w-3.5" /> Guardrail setup</div><h1 className="workspace-title mt-4">Set your priorities.</h1><p className="workspace-lede mt-3 max-w-xl">Fine-tune Maya’s initial envelopes. The agents can optimize inside your total limit, never beyond it.</p></div>
      <Card className={cn("budget-dossier w-full max-w-md transition-colors", over && "border-rose-400/25 bg-rose-950/40")}>
        <CardContent className="p-5"><div className="flex items-center justify-between"><div><p className="operational-label">Allocated</p><p className={cn("mt-1 text-3xl font-semibold tracking-[-.035em] text-white", over && "text-rose-300")}>{money(total)} <span className="text-sm font-normal text-white/35">/ {money(scenario.totalBudget)}</span></p></div><div className={cn("rounded-[5px] border px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider", over ? "border-rose-400/25 bg-rose-400/10 text-rose-300" : remaining === 0 ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300" : "border-[#3A5BFF]/30 bg-[#3A5BFF]/10 text-[#8FA5FF]")}>{over ? `${money(-remaining)} over` : remaining === 0 ? "Fully allocated" : `${money(remaining)} available`}</div></div>
          <Progress value={Math.min((total / scenario.totalBudget) * 100, 100)} className={cn("mt-4", over && "bg-rose-400/10")} indicatorClassName={over ? "bg-rose-400" : total === scenario.totalBudget ? "bg-emerald-400" : "bg-[#3A5BFF]"} />
        </CardContent>
      </Card>
    </div>
    <div className="mt-8 grid gap-4 lg:grid-cols-2">
      {scenario.categories.map((category, index) => { const Icon = icons[category.icon]; return <Card key={category.name} className={cn("allocation-card transition-all hover:-translate-y-0.5", index === 4 && "lg:col-span-2")}>
        <CardContent className="p-5 sm:p-6"><div className="flex items-center gap-4"><div className="relative grid h-12 w-12 shrink-0 place-items-center rounded-[7px] border border-[#3A5BFF]/30 bg-[#3A5BFF]/10 text-[#8FA5FF]"><span className="absolute -right-1.5 -top-2 bg-[#111634] px-1 font-mono text-[8px] text-white/30">0{index + 1}</span><Icon className="h-5 w-5" /></div><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><div><h2 className="font-semibold text-white">{category.name}</h2><p className="mt-0.5 text-xs text-white/40">Suggested {money(category.estimatedAllocation)}</p></div><div className="rounded-[6px] border border-white/10 bg-white/[.06] px-3 py-2 text-base font-semibold tabular-nums text-white">{money(allocations[index])}</div></div><Slider aria-label={`${category.name} allocation`} className="mt-5" min={0} max={Math.min(scenario.totalBudget, Math.max(category.estimatedAllocation * 2, 1000))} step={10} value={[allocations[index]]} onValueChange={([v]) => update(index, v)} /></div></div></CardContent>
      </Card>; })}
    </div>
    <div className={cn("guardrail-strip mt-8 flex flex-col items-center justify-between gap-4 border p-4 sm:flex-row sm:px-5", over ? "border-rose-400/20 bg-rose-400/[.08]" : "border-white/10 bg-[#111634]/80")}>
      <div className="flex items-center gap-3 text-sm"><div className={cn("grid h-8 w-8 place-items-center rounded-full", over ? "bg-rose-400/10 text-rose-300" : "bg-[#F7B500]/10 text-[#F7B500]")}><ShieldCheck className="h-4 w-4" /></div><span className={over ? "font-medium text-rose-300" : "text-white/60"}>{over ? "Reduce allocations to restore the spend guardrail." : "Maya automatically blocks any plan that exceeds your approved budget."}</span></div>
      <Button size="lg" onClick={onContinue} disabled={over}>{over ? <AlertCircle className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4 fill-current" />} Start purchasing</Button>
    </div>
  </motion.section>;
}

function buildEvents(scenario: Scenario): AgentEvent[] {
  const c = scenario.categories;
  const events: AgentEvent[] = [];
  [300, 900, 1500, 2100, 2700].forEach((at, i) => events.push({ at, kind: "agent_started", category: i, status: "searching", message: `Scanning approved suppliers and comparing live inventory.` }));
  [3400, 4100, 4800, 5500, 6200].forEach((at, i) => events.push({ at, kind: "products_found", category: i, status: "found", message: `Shortlisted 3 candidates: ${c[i].candidates.join(", ")}` }));
  [6900, 7500, 8100, 8700, 9300].forEach((at, i) => events.push({ at, kind: "item_purchased", category: i, status: "reserved", label: "RESERVED", message: `Reserved ${c[i].productName} — ${money(c[i].actualFound)}` }));
  [10000, 10700, 11400, 12100].forEach((at, offset) => { const i = offset + 1; events.push({ at, kind: "item_purchased", category: i, status: "captured", label: "CAPTURED", message: `Captured ${c[i].productName} — ${money(c[i].actualFound)}` }); });
  const sourceIndex = c.findIndex(item => item.isSurplusSource);
  const targetIndex = c.findIndex(item => item.isUpgradeTarget);
  const sourceSurplus = c[sourceIndex].estimatedAllocation - c[sourceIndex].actualFound;
  const upgradeDelta = (c[targetIndex].upgradedPrice ?? c[targetIndex].actualFound) - c[targetIndex].actualFound;
  events.push({ at: 12800, kind: "rebalancing", category: sourceIndex, message: `${c[sourceIndex].name} came in ${money(sourceSurplus)} under budget — reallocating surplus` });
  events.push({ at: 13900, kind: "rebalancing", category: targetIndex, message: `${money(upgradeDelta)} surplus pool identified across the plan` });
  events.push({ at: 15000, kind: "rebalancing", category: targetIndex, status: "reserved", label: "UPGRADED", message: `Upgrading ${c[targetIndex].name} to ${c[targetIndex].upgradedProductName} — ${money(c[targetIndex].upgradedPrice ?? 0)}` });
  events.push({ at: 16300, kind: "item_purchased", category: targetIndex, status: "captured", label: "CAPTURED", message: `Captured ${c[targetIndex].upgradedProductName} — ${money(getPaidPrice(scenario, c[targetIndex]))}${scenario.checkoutCredit ? ` after ${money(scenario.checkoutCredit)} checkout credit` : ""}` });
  events.push({ at: 17500, kind: "complete", message: `All 5 agents complete — ${money(getTotalSpent(scenario))} total captured` });
  return events;
}

const eventStyle: Record<EventKind, { icon: ComponentType<{ className?: string }>; className: string; label: string }> = {
  agent_started: { icon: Zap, className: "bg-cyan-400/10 text-cyan-300", label: "SEARCH" },
  products_found: { icon: Eye, className: "bg-[#3A5BFF]/15 text-[#8FA5FF]", label: "FOUND" },
  item_purchased: { icon: PackageCheck, className: "bg-emerald-400/10 text-emerald-300", label: "ORDER" },
  rebalancing: { icon: ArrowRightLeft, className: "bg-[#F7B500]/10 text-[#F7B500]", label: "REBALANCE" },
  complete: { icon: CheckCircle2, className: "bg-[#2547EC] text-white", label: "COMPLETE" },
};

function AgentGraph({ scenario, statuses, activeCategories }: { scenario: Scenario; statuses: AgentStatus[]; activeCategories: number[] }) {
  // These are SVG-space coordinates in the 600 × 500 viewBox. Keeping them inset
  // prevents the fixed-width agent cards from clipping as the graph gets narrower.
  const positions = [{ x: 299, y: 100 }, { x: 500, y: 220 }, { x: 440, y: 390 }, { x: 160, y: 390 }, { x: 100, y: 220 }];
  const activeCount = activeCategories.length;
  return <div className="agent-graph relative mx-auto aspect-[6/5] w-full max-w-[680px] overflow-hidden border border-white/[.08]">
    <svg viewBox="0 0 600 500" className="absolute inset-0 h-full w-full overflow-visible">
      <defs><filter id="glow"><feGaussianBlur stdDeviation="4" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
      {positions.map((p, i) => { const active = activeCategories.includes(i); return <g key={scenario.categories[i].name}>
        <line x1="300" y1="250" x2={p.x} y2={p.y} stroke="#27315B" strokeWidth="2" />
        {active && <motion.line x1="300" y1="250" x2={p.x} y2={p.y} stroke={agentThemes[i].line} strokeWidth="3" strokeLinecap="square" strokeDasharray="8 10" filter="url(#glow)" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: [0.45, 1, .55], strokeDashoffset: [40, 0] }} transition={{ pathLength: { duration: .4 }, opacity: { repeat: Infinity, duration: 1.25 }, strokeDashoffset: { repeat: Infinity, duration: 1.5, ease: "linear" } }} />}
      </g>; })}
    </svg>
    <motion.div animate={{ boxShadow: activeCount > 0 ? ["0 0 0 0 rgba(58,91,255,.18)", "0 0 0 20px rgba(58,91,255,0)"] : "0 0 0 0 rgba(58,91,255,0)" }} transition={{ repeat: Infinity, duration: 1.6 }} className="absolute left-1/2 top-1/2 z-10 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border-4 border-[#3A5BFF]/35 bg-[#070A1E] text-white shadow-[0_22px_45px_-20px_rgba(0,0,0,.9)]">
      <Network className="h-5 w-5 text-[#F7B500]" /><span className="mt-1 text-sm font-semibold">Maya</span><span className="mt-0.5 font-mono text-[8px] font-medium uppercase tracking-widest text-white/45">{activeCount > 0 ? `${activeCount} agents live` : "orchestrating"}</span>
    </motion.div>
    {positions.map((p, i) => { const category = scenario.categories[i]; const Icon = icons[category.icon]; const active = activeCategories.includes(i); const theme = agentThemes[i]; return <div key={category.name} style={{ left: `${p.x / 6}%`, top: `${p.y / 5}%` }} className="absolute z-20 w-[112px] -translate-x-1/2 -translate-y-1/2 sm:w-[136px]">
      <motion.div animate={{ scale: active ? 1.045 : 1, y: active ? -2 : 0 }} transition={{ type: "spring", stiffness: 260, damping: 20 }} className={cn("w-full border bg-[#141B3D]/95 p-3 text-center text-white shadow-[0_14px_30px_-18px_rgba(0,0,0,.8)] backdrop-blur-md transition-colors", active ? theme.outline : "border-white/10")}>
        <div className={cn("mx-auto grid h-8 w-8 place-items-center", active ? theme.icon : statuses[i] === "captured" ? "bg-emerald-400/10 text-emerald-300" : "bg-white/[.06] text-white/45")}><Icon className="h-4 w-4" /></div><p className="mt-2 truncate text-[10px] font-semibold sm:text-xs">{category.name}</p><div className={cn("mx-auto mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 font-mono text-[7px] font-bold uppercase tracking-wider", statuses[i] === "captured" ? "bg-emerald-400/10 text-emerald-300" : active ? theme.icon : "bg-white/[.04] text-white/30")}><span className={cn("h-1.5 w-1.5 rounded-full", statuses[i] === "captured" ? "bg-emerald-400" : active ? "animate-pulse bg-current" : "bg-white/20")} />{statuses[i]}</div>
      </motion.div>
    </div>; })}
  </div>;
}

function ActivityLog({ events, scenario }: { events: AgentEvent[]; scenario: Scenario }) {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [events.length]);
  return <div className="activity-scroll h-[520px] overflow-y-auto pr-2">
    <AnimatePresence initial={false}>
      {events.map(event => {
        const style = eventStyle[event.kind];
        const Icon = style.icon;
        const category = event.category === undefined ? undefined : scenario.categories[event.category];
        const theme = event.category === undefined ? agentThemes[0] : agentThemes[event.category];
        const agentName = category ? `${category.name} agent` : "Maya coordinator";
        return <motion.div key={`${event.at}-${event.message}`} initial={{ x: -12 }} animate={{ x: 0 }} transition={{ duration: .4, ease: [.22, 1, .36, 1] }} className={cn("mb-3 border border-l-2 border-white/[.08] bg-white/[.03]", theme.border, event.kind === "rebalancing" && "border-[#F7B500]/30 bg-[#F7B500]/[.05]", event.kind === "complete" && "border-[#3A5BFF]/30 bg-[#3A5BFF]/[.08]")}>
          <div className="flex items-start gap-3 px-4 py-3.5">
            <div className={cn("mt-0.5 grid h-8 w-8 shrink-0 place-items-center", event.kind === "complete" ? style.className : theme.icon)}><Icon className="h-3.5 w-3.5" /></div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1"><span className={cn("text-xs font-semibold", event.kind === "rebalancing" ? "text-[#F7B500]" : theme.accent)}>{agentName}</span><span className="font-mono text-[8px] font-bold uppercase tracking-[.14em] text-white/30">{event.label ?? style.label}</span></div>
              <p className="mt-1.5 text-xs leading-5 text-white/62 sm:text-sm">{event.message}</p>
            </div>
            <span className="shrink-0 font-mono text-[9px] text-white/20">T+{(event.at / 1000).toFixed(1).padStart(4, "0")}s</span>
          </div>
        </motion.div>;
      })}
    </AnimatePresence><div ref={endRef} />
  </div>;
}

function PurchaseCards({ scenario, allocations, statuses }: { scenario: Scenario; allocations: number[]; statuses: AgentStatus[] }) {
  const [expanded, setExpanded] = useState<number | null>(0);
  const spent = scenario.categories.reduce((sum, c, i) => sum + (statuses[i] === "captured" ? getPaidPrice(scenario, c) : 0), 0);
  return <div><div className="mb-5 flex items-center justify-between border border-white/10 bg-[#111634]/75 p-4"><div><p className="operational-label">Captured so far</p><p className="mt-1 text-2xl font-semibold tracking-tight text-white">{money(spent)} <span className="text-sm font-normal text-white/35">/ {money(scenario.totalBudget)}</span></p></div><Progress value={(spent / scenario.totalBudget) * 100} className="w-36 sm:w-56" indicatorClassName="bg-emerald-400" /></div>
    <div className="grid items-start gap-3 lg:grid-cols-2">{scenario.categories.map((category, i) => {
      const Icon = icons[category.icon];
      const done = statuses[i] === "captured";
      const paid = getPaidPrice(scenario, category);
      const upgraded = category.isUpgradeTarget && done;
      const isExpanded = expanded === i;
      const selectedName = upgraded ? category.upgradedProductName : category.productName;
      const addOns = purchaseAddOns[category.icon];
      return <Card key={category.name} className={cn("shadow-none transition-all", done ? "border-emerald-400/15 bg-emerald-400/[.04]" : "border-white/[.08] bg-white/[.025]", i === 4 && "lg:col-span-2")}>
        <button type="button" aria-expanded={isExpanded} onClick={() => setExpanded(isExpanded ? null : i)} className="flex w-full items-start gap-3 p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#3A5BFF]/50">
          <div className={cn("grid h-10 w-10 shrink-0 place-items-center", done ? "bg-emerald-400/10 text-emerald-300" : "bg-white/[.05] text-white/35")}><Icon className="h-4 w-4" /></div>
          <div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-white">{category.name}</p><p className={cn("mt-1 truncate text-xs", done ? "text-white/50" : "text-white/25")}>{done ? selectedName : "Awaiting capture…"}</p></div><div className="flex items-center gap-2"><span className={cn("px-2 py-1 font-mono text-[8px] font-bold uppercase tracking-wider", upgraded ? "bg-[#F7B500]/10 text-[#F7B500]" : done && paid < allocations[i] ? "bg-emerald-400/10 text-emerald-300" : "bg-white/[.05] text-white/35")}>{upgraded ? "Upgraded" : done && paid < allocations[i] ? "Under budget" : statuses[i]}</span><ChevronDown className={cn("h-4 w-4 text-white/30 transition-transform", isExpanded && "rotate-180 text-white/65")} /></div></div>
            <div className="mt-3 flex gap-6 border-t border-white/[.08] pt-3 text-xs"><div><span className="text-white/35">Allocated</span><strong className="ml-2 text-white/75">{money(allocations[i])}</strong></div><div><span className="text-white/35">Spent</span><strong className="ml-2 text-white/75">{done ? money(paid) : "—"}</strong></div></div>
          </div>
        </button>
        <AnimatePresence initial={false}>{isExpanded && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="border-t border-white/[.08] px-4 py-4">
          <p className="operational-label mb-3">{done ? "Secured in this category" : "Order contents"}</p>
          {done ? <div className="space-y-2.5">{[selectedName, ...addOns].map((item, itemIndex) => <div key={item} className="flex items-center gap-3 text-xs"><CheckCircle2 className={cn("h-3.5 w-3.5 shrink-0", itemIndex === 0 ? "text-emerald-300" : "text-[#8FA5FF]")} /><span className="min-w-0 flex-1 text-white/62">{item}</span><span className={cn("font-mono text-[9px] uppercase tracking-wider", itemIndex === 0 ? "text-white/70" : "text-white/30")}>{itemIndex === 0 ? money(paid) : "Included"}</span></div>)}</div> : <p className="text-xs leading-5 text-white/35">Maya is still validating the selected bundle. Final line items appear here as soon as the capture completes.</p>}
        </div></motion.div>}</AnimatePresence>
      </Card>;
    })}</div></div>;
}

function LiveScreen({ scenario, allocations, onSummary }: { scenario: Scenario; allocations: number[]; onSummary: () => void }) {
  const events = useMemo(() => buildEvents(scenario), [scenario]);
  const [visibleCount, setVisibleCount] = useState(0);
  useEffect(() => {
    const started = performance.now();
    const tick = () => { const elapsed = performance.now() - started; setVisibleCount(events.filter(e => e.at <= elapsed).length); };
    tick(); const timer = window.setInterval(tick, 80); return () => window.clearInterval(timer);
  }, [events]);
  const visible = events.slice(0, visibleCount);
  const statuses = scenario.categories.map((_, index) => visible.reduce<AgentStatus>((status, event) => event.category === index && event.status ? event.status : status, "idle"));
  const activeCategories = statuses.map((status, index) => status !== "idle" && status !== "captured" ? index : -1).filter(index => index >= 0);
  const complete = visibleCount === events.length;
  const progress = complete ? 100 : Math.round((visibleCount / events.length) * 100);
  return <motion.section {...screenMotion} className="workspace-section mx-auto min-h-screen max-w-[1440px] px-4 pb-10 pt-24 sm:px-7">
    <div className="live-command-bar grid items-center gap-4 border-y border-white/10 bg-[#111634]/55 px-5 py-4 backdrop-blur-xl md:grid-cols-[1fr_auto_1fr] md:px-7">
      <div className="flex items-center justify-center gap-2 font-mono text-[9px] font-bold uppercase tracking-[.16em] text-[#F7B500] md:justify-start"><span className={cn("h-2 w-2 rounded-full", complete ? "bg-emerald-400" : "animate-pulse bg-[#3A5BFF]")} />{complete ? "Run complete" : `${activeCategories.length} agents working`}</div>
      <div className="text-center"><h1 className="text-[clamp(2rem,3.4vw,3.25rem)] font-bold leading-[.92] tracking-[-.065em] text-white shadow-black/20 drop-shadow-sm">Autonomous <span className="text-[#F7B500]">procurement</span></h1><p className="mt-2 text-xs text-white/45">5 specialist agents · {money(scenario.totalBudget)} secured envelope</p></div>
      <div className="mx-auto flex w-full max-w-[270px] items-center gap-3 md:mx-0 md:ml-auto"><Progress value={progress} className="bg-white/15" indicatorClassName="bg-[#3A5BFF]" /><span className="w-10 text-right font-mono text-[10px] font-bold tabular-nums text-white/45">{progress}%</span></div>
    </div>
    <Tabs defaultValue="activity" className="mt-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><TabsList><TabsTrigger value="activity"><Zap className="mr-2 h-3.5 w-3.5" />Live agent activity</TabsTrigger><TabsTrigger value="purchases"><PackageCheck className="mr-2 h-3.5 w-3.5" />Purchases by category</TabsTrigger></TabsList>
        <AnimatePresence>{complete && <motion.div initial={{ opacity: 0, scale: .9 }} animate={{ opacity: 1, scale: 1 }}><Button onClick={onSummary} className="animate-soft-pulse">View summary <ArrowRight className="ml-2 h-4 w-4" /></Button></motion.div>}</AnimatePresence></div>
      <TabsContent value="activity"><div className="grid gap-5 xl:grid-cols-[.9fr_1.1fr]"><Card className="overflow-hidden"><CardHeader className="border-b border-white/[.08] pb-4"><div className="flex items-center justify-between"><div><CardTitle>Activity stream</CardTitle><CardDescription className="mt-1">Agent-attributed, timestamped actions</CardDescription></div><div className="flex items-center gap-2 border border-white/10 bg-white/[.05] px-3 py-1.5 font-mono text-[9px] font-bold uppercase tracking-wider text-white/40"><ScanLine className="h-3.5 w-3.5 text-[#8FA5FF]" /> live</div></div></CardHeader><CardContent className="p-4 pt-5"><ActivityLog events={visible} scenario={scenario} /></CardContent></Card>
        <Card className="overflow-hidden"><CardHeader className="border-b border-white/[.08] pb-4"><div className="flex items-center justify-between"><div><CardTitle>Agent network</CardTitle><CardDescription className="mt-1">Concurrent orchestration across every category</CardDescription></div><div className="flex -space-x-2">{scenario.categories.map((c, i) => { const Icon = icons[c.icon]; return <div key={c.name} className={cn("grid h-8 w-8 place-items-center rounded-full border-2 border-[#111634]", statuses[i] === "captured" ? "bg-emerald-500 text-white" : activeCategories.includes(i) ? agentThemes[i].icon : "bg-white/[.05] text-white/30")}><Icon className="h-3.5 w-3.5" /></div>; })}</div></div></CardHeader><CardContent className="p-2 sm:p-4"><AgentGraph scenario={scenario} statuses={statuses} activeCategories={complete ? [] : activeCategories} /></CardContent></Card></div></TabsContent>
      <TabsContent value="purchases" className="purchase-ledger"><PurchaseCards scenario={scenario} allocations={allocations} statuses={statuses} /></TabsContent>
    </Tabs>
  </motion.section>;
}

function SummaryScreen({ scenario, allocations, onRestart }: { scenario: Scenario; allocations: number[]; onRestart: () => void }) {
  const spent = getTotalSpent(scenario); const remaining = scenario.totalBudget - spent;
  const target = scenario.categories.find(c => c.isUpgradeTarget)!;
  const redirect = (target.upgradedPrice ?? target.actualFound) - target.actualFound;
  const chartData = scenario.categories.map((c, i) => ({ name: c.name.split(" ")[0], allocated: allocations[i], spent: getPaidPrice(scenario, c) }));
  const donut = [{ name: "Spent", value: spent }, { name: "Remaining", value: remaining }];
  return <motion.section {...screenMotion} className="workspace-section mx-auto min-h-screen max-w-[1280px] px-5 pb-16 pt-28 sm:px-8">
    <div className="text-center"><motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }} className="summary-seal mx-auto"><span className="summary-seal-ring" /><Check className="relative h-7 w-7 text-[#F7B500]" /></motion.div><div className="mt-5 font-mono text-[10px] font-bold uppercase tracking-[.22em] text-[#F7B500]">Procurement complete / 05 of 05</div><h1 className="workspace-title mx-auto mt-4">Your business is ready to move.</h1><p className="workspace-lede mx-auto mt-4 max-w-2xl">Maya sourced, optimized, and secured every item autonomously—inside your approved spend limit.</p></div>
    <div className="mt-9 grid gap-5 lg:grid-cols-[.78fr_1.22fr]">
      <Card><CardHeader><CardTitle>Budget performance</CardTitle><CardDescription>Approved budget vs. captured total</CardDescription></CardHeader><CardContent><div className="relative mx-auto h-52"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={donut} dataKey="value" innerRadius={65} outerRadius={88} startAngle={90} endAngle={-270} strokeWidth={0} isAnimationActive={false}>{donut.map((_, i) => <Cell key={i} fill={i === 0 ? "#3A5BFF" : "#293154"} />)}</Pie></PieChart></ResponsiveContainer><div className="absolute inset-0 grid place-content-center text-center"><span className="text-xs text-white/40">Total spent</span><strong className="text-3xl tracking-tight text-white">{money(spent)}</strong><span className="font-mono text-[9px] font-bold uppercase tracking-wider text-emerald-300">Within limit</span></div></div><div className="grid grid-cols-2 gap-3"><div className="rounded-[7px] border border-white/[.08] bg-white/[.035] p-4"><p className="text-xs text-white/40">Approved</p><p className="mt-1 text-lg font-semibold text-white">{money(scenario.totalBudget)}</p></div><div className="rounded-[7px] border border-emerald-400/15 bg-emerald-400/[.06] p-4"><p className="text-xs text-emerald-300/75">Unspent</p><p className="mt-1 text-lg font-semibold text-emerald-300">{money(remaining)}</p></div></div></CardContent></Card>
      <Card className="overflow-hidden"><CardHeader><CardTitle>Category spend</CardTitle><CardDescription>Allocation compared with final captured price</CardDescription></CardHeader><CardContent className="h-[310px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} margin={{ top: 10, right: 5, left: -15, bottom: 5 }}><CartesianGrid strokeDasharray="3 5" vertical={false} stroke="#27315B" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#7F8AB5" }} /><YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#66719D" }} tickFormatter={v => `$${v / 1000}k`} /><Tooltip cursor={{ fill: "rgba(58,91,255,.08)" }} formatter={(value: number) => money(value)} contentStyle={{ borderRadius: 7, border: "1px solid rgba(255,255,255,.1)", background: "#111634", color: "#FFFFFF", boxShadow: "0 12px 30px rgba(0,0,0,.35)", fontSize: 12 }} /><Bar dataKey="allocated" fill="#33406E" radius={[3, 3, 0, 0]} isAnimationActive={false} /><Bar dataKey="spent" fill="#3A5BFF" radius={[3, 3, 0, 0]} isAnimationActive={false} /></BarChart></ResponsiveContainer></CardContent></Card>
    </div>
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .35 }} className="redirect-dossier mt-5 overflow-hidden rounded-[9px] border border-[#F7B500]/30 bg-[#111634]/90 shadow-[0_34px_70px_-42px_rgba(0,0,0,.9)] backdrop-blur-xl"><div className="flex flex-col items-start justify-between gap-5 px-6 py-6 text-white sm:flex-row sm:items-center"><div className="flex items-start gap-4"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-[7px] border border-[#F7B500]/25 bg-[#F7B500]/10"><ArrowRightLeft className="h-5 w-5 text-[#F7B500]" /></div><div><p className="workspace-card-heading text-white">{money(redirect)} automatically redirected</p><p className="mt-1 text-sm text-white/55">Upgraded your {target.name} to the {target.upgradedProductName}.</p>{scenario.checkoutCredit && <p className="mt-2 font-mono text-[10px] text-[#F7B500]/80">Includes a {money(scenario.checkoutCredit)} bundled checkout credit to preserve the hard cap.</p>}</div></div><BadgeCheck className="h-7 w-7 text-emerald-400" /></div></motion.div>
    <Card className="mt-5"><CardHeader><CardTitle>Final purchase plan</CardTitle><CardDescription>Every allocation, capture, and product in one place</CardDescription></CardHeader><CardContent><div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left"><thead><tr className="border-b border-white/[.08] text-[10px] font-bold uppercase tracking-wider text-white/40"><th className="pb-3">Category</th><th className="pb-3">Allocated</th><th className="pb-3">Spent</th><th className="pb-3">Product secured</th><th className="pb-3 text-right">Result</th></tr></thead><tbody>{scenario.categories.map((c, i) => { const Icon = icons[c.icon]; const paid = getPaidPrice(scenario, c); return <tr key={c.name} className={cn("border-b border-white/[.07] last:border-0", c.isUpgradeTarget && "bg-[#F7B500]/[.035]")}><td className="py-4"><div className="flex items-center gap-3"><div className="grid h-8 w-8 place-items-center rounded-[6px] bg-[#3A5BFF]/10 text-[#8FA5FF]"><Icon className="h-3.5 w-3.5" /></div><span className="text-sm font-semibold text-white">{c.name}</span></div></td><td className="py-4 text-sm text-white/50">{money(allocations[i])}</td><td className="py-4 text-sm font-semibold text-white">{money(paid)}</td><td className="py-4 text-sm text-white/60">{c.isUpgradeTarget ? c.upgradedProductName : c.productName}{scenario.checkoutCredit && c.isUpgradeTarget && <span className="ml-1 text-xs text-white/30">({money(c.upgradedPrice!)} list)</span>}</td><td className="py-4 text-right"><span className={cn("rounded-[4px] px-2.5 py-1 font-mono text-[8px] font-bold uppercase tracking-wider", c.isUpgradeTarget ? "bg-[#F7B500]/10 text-[#F7B500]" : paid < allocations[i] ? "bg-emerald-400/10 text-emerald-300" : "bg-white/[.05] text-white/45")}>{c.isUpgradeTarget ? "Upgraded" : paid < allocations[i] ? `${money(allocations[i] - paid)} under` : "On budget"}</span></td></tr>; })}</tbody></table></div></CardContent></Card>
    <div className="mt-8 flex flex-col items-center justify-between gap-5 border-t border-white/10 pt-7 text-center sm:flex-row sm:text-left"><div><p className="font-semibold text-white">One plan. Five agents. Zero budget overruns.</p><p className="mt-1 text-sm text-white/45">Visa Maya turned spend controls into better business outcomes.</p></div><Button variant="outline" size="lg" onClick={onRestart} className="border-white/15 bg-white/[.07] text-white hover:border-white/25 hover:bg-white/[.12] hover:text-white"><RotateCcw className="mr-2 h-4 w-4" /> Start another plan</Button></div>
  </motion.section>;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [scenario, setScenario] = useState<Scenario>(scenarios[0]);
  const [prompt, setPrompt] = useState(scenarios[0].prefilledPrompt);
  const [allocations, setAllocations] = useState(scenarios[0].categories.map(c => c.estimatedAllocation));
  const [authIntent, setAuthIntent] = useState<AuthIntent>("pass");
  const scenarioIndex = scenarios.findIndex(item => item.id === scenario.id);
  const selectScenario = (next: Scenario) => { setScenario(next); setPrompt(next.prefilledPrompt); setAllocations(next.categories.map(c => c.estimatedAllocation)); };
  const cycleScenario = (direction: -1 | 1) => { const nextIndex = (scenarioIndex + direction + scenarios.length) % scenarios.length; selectScenario(scenarios[nextIndex]); };
  const reset = () => { selectScenario(scenarios[0]); setAuthIntent("pass"); setScreen("landing"); };
  return <AmbientShell showReset={screen !== "landing"} onReset={reset}><AnimatePresence mode="wait">
    {screen === "landing" && <LandingScreen key="landing" scenario={scenario} prompt={prompt} setPrompt={setPrompt} onCycle={cycleScenario} authIntent={authIntent} setAuthIntent={setAuthIntent} onSubmit={() => setScreen("auth")} />}
    {screen === "auth" && <AuthScreen key="auth" intent={authIntent} onSuccess={() => setScreen("priority")} />}
    {screen === "priority" && <PriorityScreen key="priority" scenario={scenario} allocations={allocations} setAllocations={setAllocations} onContinue={() => setScreen("live")} />}
    {screen === "live" && <LiveScreen key="live" scenario={scenario} allocations={allocations} onSummary={() => setScreen("summary")} />}
    {screen === "summary" && <SummaryScreen key="summary" scenario={scenario} allocations={allocations} onRestart={reset} />}
  </AnimatePresence></AmbientShell>;
}
