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
  return <main className="relative min-h-screen overflow-hidden bg-[#F7F8FC] text-slate-950">
    <div className="ambient ambient-one" /><div className="ambient ambient-two" /><div className="ambient-grid" />
    {showReset && <header className="absolute left-0 right-0 top-0 z-40 flex items-center justify-between px-5 py-4 sm:px-8">
      <MayaMark compact />
      <Button variant="ghost" size="sm" onClick={onReset} className="rounded-full text-slate-500"><RotateCcw className="mr-2 h-3.5 w-3.5" /> Start over</Button>
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
    <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col">
      <header className="flex h-20 items-center justify-between border-b border-white/10"><MayaMark inverse /><div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[.06] px-3 py-1.5 text-xs font-medium text-white/60 backdrop-blur"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Spend controls active</div></header>
      <div className="flex flex-1 flex-col items-center justify-center py-12 text-center lg:py-14">
        <div className="launch-kicker"><span />Autonomous procurement for small business</div>
        <h1 className="launch-title mt-5">Start with intent. <em>Finish under budget.</em></h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-white/65 sm:text-lg">One request becomes a complete purchasing plan—sourced, optimized, and governed from the first dollar to the last.</p>
        <motion.div initial={{ y: 16 }} animate={{ y: 0 }} transition={{ delay: .12, duration: .6, ease: [.19, 1, .22, 1] }} className="prompt-composer mt-9 w-full max-w-4xl text-left">
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
            <Button size="lg" onClick={onSubmit} disabled={!prompt.trim()} className="rounded-xl">Build my plan <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </div>
        </motion.div>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-xs text-white/35"><span>Hard budget boundary</span><span className="h-1 w-1 rounded-full bg-[#F7B500]" /><span>Visible agent activity</span><span className="h-1 w-1 rounded-full bg-[#F7B500]" /><span>Automatic rebalancing</span></div>
      </div>
      <footer className="flex items-center justify-between border-t border-white/10 py-5 text-[10px] font-medium uppercase tracking-[.16em] text-white/30"><span>Visa Maya · Spend control for autonomous commerce</span><span className="hidden sm:inline">Bounded · visible · accountable</span></footer>
    </div>
    <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1 rounded-full border border-white/10 bg-white/[.06] p-1 pl-3 text-[10px] text-white/35 backdrop-blur-xl">
      <span className="mr-1 font-medium">Auth path</span>
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

  return <motion.section {...screenMotion} className="flex min-h-screen items-center justify-center px-5 py-24">
    <Card className="relative w-full max-w-lg overflow-hidden border-white bg-white/85 text-center">
      <div className={cn("absolute inset-x-0 top-0 h-1 transition-colors", phase === "failed" ? "bg-rose-500" : phase === "success" ? "bg-emerald-500" : "bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500")} />
      <CardContent className="px-8 py-12 sm:px-14 sm:py-16">
        <AnimatePresence mode="wait">
          {phase === "scanning" && <motion.div key="scan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: .95 }}>
            <div className="scanner mx-auto"><ShieldCheck className="h-10 w-10 text-indigo-600" /><motion.div className="scan-line" animate={{ y: [-36, 36, -36] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} /></div>
            <h1 className="mt-8 text-2xl font-semibold tracking-tight">Authorizing spend authority…</h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">Verifying identity, business controls, and transaction limits.</p>
            <div className="mt-8 space-y-3 text-left">
              {["Identity & business profile", "Procurement permissions", "Budget guardrail"].map((label, i) => <motion.div key={label} initial={{ opacity: .35 }} animate={{ opacity: [0.35, 1, .35] }} transition={{ delay: i * .35, repeat: Infinity, duration: 1.6 }} className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600"><LoaderCircle className="h-4 w-4 animate-spin text-indigo-500" />{label}</motion.div>)}
            </div>
          </motion.div>}
          {phase === "success" && <motion.div key="success" initial={{ opacity: 0, scale: .85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <div className="success-rings mx-auto"><motion.div initial={{ scale: 0, rotate: -25 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 220, damping: 14 }} className="grid h-24 w-24 place-items-center rounded-full bg-emerald-500 text-white shadow-xl shadow-emerald-200"><Check className="h-11 w-11" strokeWidth={2.5} /></motion.div></div>
            <h1 className="mt-8 text-2xl font-semibold tracking-tight">Authority confirmed</h1><p className="mt-3 text-sm text-slate-500">Your secure spending envelope is ready.</p>
          </motion.div>}
          {phase === "failed" && <motion.div key="failed" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-rose-50 text-rose-500"><XCircle className="h-11 w-11" /></div>
            <h1 className="mt-8 text-2xl font-semibold tracking-tight">Authentication failed</h1><p className="mt-3 text-sm leading-6 text-slate-500">Spend authority could not be verified. No permissions were granted and no funds were moved.</p>
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
  return <motion.section {...screenMotion} className="mx-auto min-h-screen max-w-6xl px-5 pb-16 pt-28 sm:px-8">
    <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
      <div><div className="section-kicker"><Gauge className="h-3.5 w-3.5" /> Guardrail setup</div><h1 className="mt-3 text-4xl font-semibold tracking-[-.04em] sm:text-5xl">Set your priorities.</h1><p className="mt-3 max-w-xl text-slate-500">Fine-tune Maya’s initial envelopes. The agents can optimize inside your total limit, never beyond it.</p></div>
      <Card className={cn("w-full max-w-md transition-colors", over && "border-rose-200 bg-rose-50/80")}>
        <CardContent className="p-5"><div className="flex items-center justify-between"><div><p className="text-xs font-medium uppercase tracking-wider text-slate-400">Allocated</p><p className={cn("mt-1 text-2xl font-semibold tracking-tight", over && "text-rose-600")}>{money(total)} <span className="text-sm font-normal text-slate-400">/ {money(scenario.totalBudget)}</span></p></div><div className={cn("rounded-full px-3 py-1 text-xs font-semibold", over ? "bg-rose-100 text-rose-700" : remaining === 0 ? "bg-emerald-100 text-emerald-700" : "bg-indigo-50 text-indigo-700")}>{over ? `${money(-remaining)} over` : remaining === 0 ? "Fully allocated" : `${money(remaining)} available`}</div></div>
          <Progress value={Math.min((total / scenario.totalBudget) * 100, 100)} className={cn("mt-4", over && "bg-rose-100")} indicatorClassName={over ? "bg-rose-500" : total === scenario.totalBudget ? "bg-emerald-500" : "bg-indigo-600"} />
        </CardContent>
      </Card>
    </div>
    <div className="mt-8 grid gap-4 lg:grid-cols-2">
      {scenario.categories.map((category, index) => { const Icon = icons[category.icon]; return <Card key={category.name} className={cn("transition-shadow hover:shadow-lg", index === 4 && "lg:col-span-2")}>
        <CardContent className="p-5 sm:p-6"><div className="flex items-center gap-4"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><Icon className="h-5 w-5" /></div><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><div><h2 className="font-semibold text-slate-800">{category.name}</h2><p className="mt-0.5 text-xs text-slate-400">Suggested {money(category.estimatedAllocation)}</p></div><div className="rounded-xl bg-slate-50 px-3 py-2 text-base font-semibold tabular-nums text-slate-800">{money(allocations[index])}</div></div><Slider aria-label={`${category.name} allocation`} className="mt-5" min={0} max={Math.min(scenario.totalBudget, Math.max(category.estimatedAllocation * 2, 1000))} step={10} value={[allocations[index]]} onValueChange={([v]) => update(index, v)} /></div></div></CardContent>
      </Card>; })}
    </div>
    <div className={cn("mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border p-4 sm:flex-row sm:px-5", over ? "border-rose-200 bg-rose-50" : "border-indigo-100 bg-indigo-50/60")}>
      <div className="flex items-center gap-3 text-sm"><div className={cn("grid h-8 w-8 place-items-center rounded-full", over ? "bg-rose-100 text-rose-600" : "bg-white text-indigo-600")}><ShieldCheck className="h-4 w-4" /></div><span className={over ? "font-medium text-rose-700" : "text-slate-600"}>{over ? "Reduce allocations to restore the spend guardrail." : "Maya automatically blocks any plan that exceeds your approved budget."}</span></div>
      <Button size="lg" onClick={onContinue} disabled={over}>{over ? <AlertCircle className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4 fill-current" />} Start purchasing</Button>
    </div>
  </motion.section>;
}

function buildEvents(scenario: Scenario): AgentEvent[] {
  const c = scenario.categories;
  const events: AgentEvent[] = [];
  [300, 900, 1500, 2100, 2700].forEach((at, i) => events.push({ at, kind: "agent_started", category: i, status: "searching", message: `${c[i].name} Agent started searching…` }));
  [3400, 4100, 4800, 5500, 6200].forEach((at, i) => events.push({ at, kind: "products_found", category: i, status: "found", message: `Found 3 candidates: ${c[i].candidates.join(", ")}` }));
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
  agent_started: { icon: Zap, className: "bg-sky-50 text-sky-600", label: "SEARCH" },
  products_found: { icon: Eye, className: "bg-violet-50 text-violet-600", label: "FOUND" },
  item_purchased: { icon: PackageCheck, className: "bg-emerald-50 text-emerald-600", label: "ORDER" },
  rebalancing: { icon: ArrowRightLeft, className: "bg-amber-50 text-amber-600", label: "REBALANCE" },
  complete: { icon: CheckCircle2, className: "bg-indigo-600 text-white", label: "COMPLETE" },
};

function AgentGraph({ scenario, statuses, activeCategory }: { scenario: Scenario; statuses: AgentStatus[]; activeCategory?: number }) {
  const positions = [{ x: 300, y: 58 }, { x: 505, y: 175 }, { x: 430, y: 404 }, { x: 170, y: 404 }, { x: 95, y: 175 }];
  return <div className="relative mx-auto aspect-[6/5] w-full max-w-[620px] overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_center,rgba(99,102,241,.12),transparent_42%)]">
    <svg viewBox="0 0 600 500" className="absolute inset-0 h-full w-full overflow-visible">
      <defs><linearGradient id="line-active" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#6366f1" /><stop offset="1" stopColor="#a855f7" /></linearGradient><filter id="glow"><feGaussianBlur stdDeviation="4" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
      {positions.map((p, i) => <g key={scenario.categories[i].name}>
        <line x1="300" y1="250" x2={p.x} y2={p.y} stroke="#e2e8f0" strokeWidth="2" />
        {activeCategory === i && <motion.line x1="300" y1="250" x2={p.x} y2={p.y} stroke="url(#line-active)" strokeWidth="3" strokeLinecap="round" strokeDasharray="8 10" filter="url(#glow)" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: [0.5, 1, .65], strokeDashoffset: [40, 0] }} transition={{ pathLength: { duration: .45 }, opacity: { repeat: Infinity, duration: 1.2 }, strokeDashoffset: { repeat: Infinity, duration: 1.5, ease: "linear" } }} />}
      </g>)}
    </svg>
    <motion.div animate={{ boxShadow: activeCategory !== undefined ? ["0 0 0 0 rgba(99,102,241,.12)", "0 0 0 20px rgba(99,102,241,0)"] : "0 0 0 0 rgba(99,102,241,0)" }} transition={{ repeat: Infinity, duration: 1.6 }} className="absolute left-1/2 top-1/2 z-10 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-200">
      <Network className="h-5 w-5" /><span className="mt-1 text-sm font-semibold">Main Agent</span><span className="mt-0.5 text-[9px] font-medium uppercase tracking-widest text-indigo-200">orchestrating</span>
    </motion.div>
    {positions.map((p, i) => { const category = scenario.categories[i]; const Icon = icons[category.icon]; const active = activeCategory === i; return <motion.div key={category.name} animate={{ scale: active ? 1.06 : 1, y: active ? -2 : 0 }} transition={{ type: "spring", stiffness: 260, damping: 20 }} style={{ left: `${p.x / 6}%`, top: `${p.y / 5}%` }} className={cn("absolute z-20 w-[116px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border bg-white p-3 text-center shadow-md transition-colors sm:w-[140px]", active ? "border-indigo-300 shadow-lg shadow-indigo-100" : "border-slate-100")}>
      <div className={cn("mx-auto grid h-8 w-8 place-items-center rounded-lg", active ? "bg-indigo-600 text-white" : statuses[i] === "captured" ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-500")}><Icon className="h-4 w-4" /></div><p className="mt-2 truncate text-[10px] font-semibold sm:text-xs">{category.name}</p><div className={cn("mx-auto mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider", statuses[i] === "captured" ? "bg-emerald-50 text-emerald-600" : active ? "bg-indigo-50 text-indigo-600" : "bg-slate-50 text-slate-400")}><span className={cn("h-1.5 w-1.5 rounded-full", statuses[i] === "captured" ? "bg-emerald-500" : active ? "animate-pulse bg-indigo-500" : "bg-slate-300")} />{statuses[i]}</div>
    </motion.div>; })}
  </div>;
}

function ActivityLog({ events }: { events: AgentEvent[] }) {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [events.length]);
  return <div className="activity-scroll h-[520px] overflow-y-auto pr-2">
    <AnimatePresence initial={false}>
      {events.map((event, index) => { const style = eventStyle[event.kind]; const Icon = style.icon; return <motion.div key={`${event.at}-${event.message}`} initial={{ opacity: 0, x: -12, height: 0 }} animate={{ opacity: 1, x: 0, height: "auto" }} transition={{ duration: .4, ease: [.22, 1, .36, 1] }} className={cn("relative ml-5 border-l border-slate-100 pb-5 pl-7", event.kind === "complete" && "border-transparent")}>
        <div className={cn("absolute -left-4 top-0 grid h-8 w-8 place-items-center rounded-lg ring-4 ring-white", style.className)}><Icon className="h-3.5 w-3.5" /></div>
        <div className={cn("rounded-xl border border-slate-100 bg-white px-4 py-3", event.kind === "rebalancing" && "border-amber-200 bg-gradient-to-r from-amber-50 to-white", event.kind === "complete" && "border-indigo-200 bg-indigo-50")}>
          <div className="mb-1.5 flex items-center justify-between gap-3"><span className={cn("text-[9px] font-bold tracking-[.14em]", event.kind === "rebalancing" ? "text-amber-600" : event.kind === "complete" ? "text-indigo-600" : "text-slate-400")}>{event.label ?? style.label}</span><span className="font-mono text-[9px] text-slate-300">T+{String(Math.floor(event.at / 1000)).padStart(2, "0")}:{String(Math.floor((event.at % 1000) / 10)).padStart(2, "0")}</span></div>
          <p className="text-xs leading-5 text-slate-600 sm:text-sm">{event.message}</p>
        </div>
      </motion.div>; })}
    </AnimatePresence><div ref={endRef} />
  </div>;
}

function PurchaseCards({ scenario, allocations, statuses }: { scenario: Scenario; allocations: number[]; statuses: AgentStatus[] }) {
  const spent = scenario.categories.reduce((sum, c, i) => sum + (statuses[i] === "captured" ? getPaidPrice(scenario, c) : 0), 0);
  return <div><div className="mb-5 flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4"><div><p className="text-xs uppercase tracking-wider text-slate-400">Captured so far</p><p className="mt-1 text-2xl font-semibold tracking-tight">{money(spent)} <span className="text-sm font-normal text-slate-400">/ {money(scenario.totalBudget)}</span></p></div><Progress value={(spent / scenario.totalBudget) * 100} className="w-36 sm:w-56" indicatorClassName="bg-emerald-500" /></div>
    <div className="grid gap-3 lg:grid-cols-2">{scenario.categories.map((category, i) => { const Icon = icons[category.icon]; const done = statuses[i] === "captured"; const paid = getPaidPrice(scenario, category); const upgraded = category.isUpgradeTarget && done; return <Card key={category.name} className={cn("shadow-none transition-all", done ? "border-emerald-100 bg-white" : "border-slate-100 bg-white/60", i === 4 && "lg:col-span-2")}><CardContent className="p-4"><div className="flex items-start gap-3"><div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", done ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-400")}><Icon className="h-4 w-4" /></div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold">{category.name}</p><p className={cn("mt-1 truncate text-xs", done ? "text-slate-500" : "text-slate-300")}>{done ? (upgraded ? category.upgradedProductName : category.productName) : "Awaiting capture…"}</p></div><span className={cn("rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-wider", upgraded ? "bg-violet-50 text-violet-600" : done && paid < allocations[i] ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-400")}>{upgraded ? "Upgraded" : done && paid < allocations[i] ? "Under budget" : statuses[i]}</span></div><div className="mt-3 flex gap-6 border-t border-slate-50 pt-3 text-xs"><div><span className="text-slate-400">Allocated</span><strong className="ml-2 text-slate-700">{money(allocations[i])}</strong></div><div><span className="text-slate-400">Spent</span><strong className="ml-2 text-slate-700">{done ? money(paid) : "—"}</strong></div></div></div></div></CardContent></Card>; })}</div></div>;
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
  const last = visible.at(-1);
  const complete = visibleCount === events.length;
  const progress = complete ? 100 : Math.round((visibleCount / events.length) * 100);
  return <motion.section {...screenMotion} className="mx-auto min-h-screen max-w-[1440px] px-4 pb-10 pt-24 sm:px-7">
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><div className="section-kicker"><span className={cn("h-2 w-2 rounded-full", complete ? "bg-emerald-500" : "animate-pulse bg-indigo-500")} /> {complete ? "Run complete" : "Agents working live"}</div><h1 className="mt-3 text-3xl font-semibold tracking-[-.04em] sm:text-4xl">Autonomous procurement</h1><p className="mt-2 text-sm text-slate-500">5 specialist agents · secured under a {money(scenario.totalBudget)} spend envelope</p></div><div className="flex min-w-64 items-center gap-3"><Progress value={progress} /><span className="w-10 text-right text-xs font-semibold tabular-nums text-slate-500">{progress}%</span></div></div>
    <Tabs defaultValue="activity" className="mt-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><TabsList><TabsTrigger value="activity"><Zap className="mr-2 h-3.5 w-3.5" />Live agent activity</TabsTrigger><TabsTrigger value="purchases"><PackageCheck className="mr-2 h-3.5 w-3.5" />Purchases by category</TabsTrigger></TabsList>
        <AnimatePresence>{complete && <motion.div initial={{ opacity: 0, scale: .9 }} animate={{ opacity: 1, scale: 1 }}><Button onClick={onSummary} className="animate-soft-pulse">View summary <ArrowRight className="ml-2 h-4 w-4" /></Button></motion.div>}</AnimatePresence></div>
      <TabsContent value="activity"><div className="grid gap-5 xl:grid-cols-[.9fr_1.1fr]"><Card className="overflow-hidden"><CardHeader className="border-b border-slate-100 pb-4"><div className="flex items-center justify-between"><div><CardTitle>Activity stream</CardTitle><CardDescription className="mt-1">Secure, timestamped agent actions</CardDescription></div><div className="flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400"><ScanLine className="h-3.5 w-3.5 text-indigo-500" /> live</div></div></CardHeader><CardContent className="p-4 pt-5"><ActivityLog events={visible} /></CardContent></Card>
        <Card className="overflow-hidden"><CardHeader className="border-b border-slate-100 pb-4"><div className="flex items-center justify-between"><div><CardTitle>Agent network</CardTitle><CardDescription className="mt-1">Real-time orchestration map</CardDescription></div><div className="flex -space-x-2">{scenario.categories.map((c, i) => { const Icon = icons[c.icon]; return <div key={c.name} className={cn("grid h-8 w-8 place-items-center rounded-full border-2 border-white", statuses[i] === "captured" ? "bg-emerald-500 text-white" : "bg-indigo-50 text-indigo-500")}><Icon className="h-3.5 w-3.5" /></div>; })}</div></div></CardHeader><CardContent className="p-2 sm:p-4"><AgentGraph scenario={scenario} statuses={statuses} activeCategory={complete ? undefined : last?.category} /></CardContent></Card></div></TabsContent>
      <TabsContent value="purchases"><PurchaseCards scenario={scenario} allocations={allocations} statuses={statuses} /></TabsContent>
    </Tabs>
  </motion.section>;
}

function SummaryScreen({ scenario, allocations, onRestart }: { scenario: Scenario; allocations: number[]; onRestart: () => void }) {
  const spent = getTotalSpent(scenario); const remaining = scenario.totalBudget - spent;
  const target = scenario.categories.find(c => c.isUpgradeTarget)!;
  const redirect = (target.upgradedPrice ?? target.actualFound) - target.actualFound;
  const chartData = scenario.categories.map((c, i) => ({ name: c.name.split(" ")[0], allocated: allocations[i], spent: getPaidPrice(scenario, c) }));
  const donut = [{ name: "Spent", value: spent }, { name: "Remaining", value: remaining }];
  return <motion.section {...screenMotion} className="mx-auto min-h-screen max-w-6xl px-5 pb-16 pt-28 sm:px-8">
    <div className="text-center"><motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }} className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-200"><Check className="h-8 w-8" /></motion.div><div className="mt-5 text-xs font-bold uppercase tracking-[.18em] text-emerald-600">Procurement complete</div><h1 className="mt-3 text-4xl font-semibold tracking-[-.045em] sm:text-5xl">Your business is ready to move.</h1><p className="mx-auto mt-4 max-w-2xl text-slate-500">Maya sourced, optimized, and secured every item autonomously—inside your approved spend limit.</p></div>
    <div className="mt-9 grid gap-5 lg:grid-cols-[.78fr_1.22fr]">
      <Card><CardHeader><CardTitle>Budget performance</CardTitle><CardDescription>Approved budget vs. captured total</CardDescription></CardHeader><CardContent><div className="relative mx-auto h-52"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={donut} dataKey="value" innerRadius={65} outerRadius={88} startAngle={90} endAngle={-270} strokeWidth={0}>{donut.map((_, i) => <Cell key={i} fill={i === 0 ? "#6366f1" : "#e2e8f0"} />)}</Pie></PieChart></ResponsiveContainer><div className="absolute inset-0 grid place-content-center text-center"><span className="text-xs text-slate-400">Total spent</span><strong className="text-3xl tracking-tight">{money(spent)}</strong><span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">Within limit</span></div></div><div className="grid grid-cols-2 gap-3"><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-400">Approved</p><p className="mt-1 text-lg font-semibold">{money(scenario.totalBudget)}</p></div><div className="rounded-xl bg-emerald-50 p-4"><p className="text-xs text-emerald-600">Unspent</p><p className="mt-1 text-lg font-semibold text-emerald-700">{money(remaining)}</p></div></div></CardContent></Card>
      <Card className="overflow-hidden"><CardHeader><CardTitle>Category spend</CardTitle><CardDescription>Allocation compared with final captured price</CardDescription></CardHeader><CardContent className="h-[310px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} margin={{ top: 10, right: 5, left: -15, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef0f4" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} /><YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} tickFormatter={v => `$${v / 1000}k`} /><Tooltip cursor={{ fill: "#f8fafc" }} formatter={(value: number) => money(value)} contentStyle={{ borderRadius: 12, border: "1px solid #eef0f4", boxShadow: "0 12px 30px rgba(15,23,42,.08)", fontSize: 12 }} /><Bar dataKey="allocated" fill="#dfe3f3" radius={[5, 5, 0, 0]} /><Bar dataKey="spent" fill="#6366f1" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></CardContent></Card>
    </div>
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .35 }} className="mt-5 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-[1px] shadow-glow"><div className="flex flex-col items-start justify-between gap-5 rounded-[15px] bg-[#111331] px-6 py-6 text-white sm:flex-row sm:items-center"><div className="flex items-start gap-4"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/10"><ArrowRightLeft className="h-5 w-5 text-violet-300" /></div><div><p className="text-2xl font-semibold tracking-tight">{money(redirect)} automatically redirected</p><p className="mt-1 text-sm text-slate-300">Upgraded your {target.name} to the {target.upgradedProductName}.</p>{scenario.checkoutCredit && <p className="mt-2 text-xs text-violet-300">Includes a {money(scenario.checkoutCredit)} bundled checkout credit to preserve the hard cap.</p>}</div></div><BadgeCheck className="h-7 w-7 text-emerald-400" /></div></motion.div>
    <Card className="mt-5"><CardHeader><CardTitle>Final purchase plan</CardTitle><CardDescription>Every allocation, capture, and product in one place</CardDescription></CardHeader><CardContent><div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left"><thead><tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400"><th className="pb-3">Category</th><th className="pb-3">Allocated</th><th className="pb-3">Spent</th><th className="pb-3">Product secured</th><th className="pb-3 text-right">Result</th></tr></thead><tbody>{scenario.categories.map((c, i) => { const Icon = icons[c.icon]; const paid = getPaidPrice(scenario, c); return <tr key={c.name} className={cn("border-b border-slate-50 last:border-0", c.isUpgradeTarget && "bg-violet-50/50")}><td className="py-4"><div className="flex items-center gap-3"><div className="grid h-8 w-8 place-items-center rounded-lg bg-white text-indigo-600 shadow-sm"><Icon className="h-3.5 w-3.5" /></div><span className="text-sm font-semibold">{c.name}</span></div></td><td className="py-4 text-sm text-slate-500">{money(allocations[i])}</td><td className="py-4 text-sm font-semibold">{money(paid)}</td><td className="py-4 text-sm text-slate-600">{c.isUpgradeTarget ? c.upgradedProductName : c.productName}{scenario.checkoutCredit && c.isUpgradeTarget && <span className="ml-1 text-xs text-slate-400">({money(c.upgradedPrice!)} list)</span>}</td><td className="py-4 text-right"><span className={cn("rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider", c.isUpgradeTarget ? "bg-violet-100 text-violet-700" : paid < allocations[i] ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-500")}>{c.isUpgradeTarget ? "Upgraded" : paid < allocations[i] ? `${money(allocations[i] - paid)} under` : "On budget"}</span></td></tr>; })}</tbody></table></div></CardContent></Card>
    <div className="mt-8 flex flex-col items-center justify-between gap-5 border-t border-slate-200 pt-7 text-center sm:flex-row sm:text-left"><div><p className="font-semibold">One plan. Five agents. Zero budget overruns.</p><p className="mt-1 text-sm text-slate-500">Visa Maya turned spend controls into better business outcomes.</p></div><Button variant="outline" size="lg" onClick={onRestart}><RotateCcw className="mr-2 h-4 w-4" /> Start another plan</Button></div>
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
