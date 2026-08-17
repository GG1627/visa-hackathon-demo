import { useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SiVisa } from "react-icons/si";
import {
  AlertCircle, ArrowRight, ArrowRightLeft, BadgeCheck, Check, CheckCircle2, ChefHat, ChevronDown, ChevronUp, CircleDollarSign,
  Coffee, CreditCard, CupSoda, Download, Droplets, ExternalLink, Eye, Gauge, LoaderCircle, LockKeyhole,
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
import { createProcurementRun, money, scenarios, type Category, type ProcurementRun, type Scenario } from "@/data";

type Screen = "landing" | "auth" | "priority" | "live" | "summary";
type AuthIntent = "pass" | "fail";
type AgentStatus = "idle" | "searching" | "found" | "reserved" | "captured";
type EventKind = "agent_started" | "products_found" | "constraint" | "item_purchased" | "rebalancing" | "complete";
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

const screenMotion = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: .45, ease: [.22, 1, .36, 1] as const },
};

function MayaMark({ compact = false, inverse = false }: { compact?: boolean; inverse?: boolean }) {
  return <div className="flex items-center" aria-label="Visa Maya">
    <span className={cn("flex shrink-0 items-center justify-center", compact ? "h-9" : "h-10")}>
      <SiVisa className={cn(inverse ? "text-white" : "text-[#1434CB]", compact ? "h-8 w-[88px]" : "h-9 w-[100px]")} aria-hidden="true" />
    </span>
    <span aria-hidden="true" className={cn("mx-3.5 h-7 w-px shrink-0", inverse ? "bg-white/25" : "bg-[#1434CB]/25")} />
    <span className={cn("font-medium leading-none tracking-[-.035em]", inverse ? "text-white/92" : "text-[#0A0E27]", compact ? "text-xl" : "text-[22px]")}>Maya</span>
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

function buildEvents(run: ProcurementRun): AgentEvent[] {
  const events: AgentEvent[] = [];
  const startTimes = [300, 850, 1450, 2200, 3050];
  const quoteTimes = [3150, 3750, 4550, 5650, 6800];
  const reserveTimes = [7150, 7900, 8650, 9400, 10150];
  run.orders.forEach((order, index) => {
    const availableQuotes = order.quotes.filter(quote => quote.availability !== "unavailable");
    const bestQuote = availableQuotes.reduce((best, quote) => quote.landedTotal < best.landedTotal ? quote : best);
    events.push({ at: startTimes[index], kind: "agent_started", category: index, status: "searching", message: `Scanning approved suppliers and checking landed cost against a ${money(order.allocation)} working envelope.` });
    events.push({ at: quoteTimes[index], kind: "products_found", category: index, status: "found", message: `${availableQuotes.length} viable quotes returned · best landed estimate ${money(bestQuote.landedTotal)} from ${bestQuote.merchant}.` });
    if (order.preferredUnavailable) events.push({ at: quoteTimes[index] + 280, kind: "constraint", category: index, status: "searching", label: "STOCK CHANGE", message: `${order.quotes[0].name} went unavailable · switching to ${order.selectedProduct}.` });
    events.push({ at: reserveTimes[index], kind: "item_purchased", category: index, status: "reserved", label: order.substituted ? "SUBSTITUTED" : order.upgraded ? "UPGRADE HELD" : "RESERVED", message: `${order.selectedMerchant} reserved ${order.selectedProduct} at ${money(order.capturedTotal)} landed.` });
    if (!order.upgraded) events.push({ at: 10600 + index * 720, kind: "item_purchased", category: index, status: "captured", label: "CAPTURED", message: `Captured ${order.selectedProduct} · ${money(order.capturedTotal)} including fees and credits.` });
  });
  let eventTime = 14200;
  run.transfers.forEach(transfer => {
    const targetIndex = run.orders.findIndex(order => order.categoryName === transfer.to);
    events.push({ at: eventTime, kind: "rebalancing", category: targetIndex >= 0 ? targetIndex : undefined, message: `Moved ${money(transfer.amount)} from ${transfer.from} to ${transfer.to}.` });
    eventTime += 420;
  });
  const upgradeOrder = run.orders.find(order => order.upgraded);
  if (upgradeOrder) {
    events.push({ at: eventTime + 240, kind: "rebalancing", category: upgradeOrder.categoryIndex, status: "reserved", label: "UPGRADED", message: `Approved ${upgradeOrder.selectedProduct} after validating the pooled surplus and hard cap.` });
    events.push({ at: eventTime + 1180, kind: "item_purchased", category: upgradeOrder.categoryIndex, status: "captured", label: "CAPTURED", message: `Captured upgraded order at ${money(upgradeOrder.capturedTotal)} · ${money(upgradeOrder.discount + upgradeOrder.credit)} in discounts and credits applied.` });
    eventTime += 1180;
  }
  events.push({ at: eventTime + 1100, kind: "complete", message: `${run.orders.length} agents complete · ${money(run.totalSpent)} captured with ${money(run.remaining)} remaining.` });
  return events.sort((a, b) => a.at - b.at);
}

const eventStyle: Record<EventKind, { icon: ComponentType<{ className?: string }>; className: string; label: string }> = {
  agent_started: { icon: Zap, className: "bg-cyan-400/10 text-cyan-300", label: "SEARCH" },
  products_found: { icon: Eye, className: "bg-[#3A5BFF]/15 text-[#8FA5FF]", label: "FOUND" },
  constraint: { icon: AlertCircle, className: "bg-[#FF8BD8]/10 text-[#FF8BD8]", label: "CONSTRAINT" },
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
        return <motion.div key={`${event.at}-${event.message}`} initial={{ x: -12 }} animate={{ x: 0 }} transition={{ duration: .4, ease: [.22, 1, .36, 1] }} className={cn("mb-3 border border-l-2 border-white/[.08] bg-white/[.03]", theme.border, event.kind === "constraint" && "border-[#FF8BD8]/25 bg-[#FF8BD8]/[.045]", event.kind === "rebalancing" && "border-[#F7B500]/30 bg-[#F7B500]/[.05]", event.kind === "complete" && "border-[#3A5BFF]/30 bg-[#3A5BFF]/[.08]")}>
          <div className="flex items-start gap-3 px-4 py-3.5">
            <div className={cn("mt-0.5 grid h-8 w-8 shrink-0 place-items-center", event.kind === "complete" || event.kind === "constraint" ? style.className : theme.icon)}><Icon className="h-3.5 w-3.5" /></div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1"><span className={cn("text-xs font-semibold", event.kind === "rebalancing" ? "text-[#F7B500]" : event.kind === "constraint" ? "text-[#FF8BD8]" : theme.accent)}>{agentName}</span><span className="font-mono text-[8px] font-bold uppercase tracking-[.14em] text-white/30">{event.label ?? style.label}</span></div>
              <p className="mt-1.5 text-xs leading-5 text-white/62 sm:text-sm">{event.message}</p>
            </div>
            <span className="shrink-0 font-mono text-[9px] text-white/20">T+{(event.at / 1000).toFixed(1).padStart(4, "0")}s</span>
          </div>
        </motion.div>;
      })}
    </AnimatePresence><div ref={endRef} />
  </div>;
}

function PurchaseCards({ run, statuses }: { run: ProcurementRun; statuses: AgentStatus[] }) {
  const [expanded, setExpanded] = useState<number | null>(0);
  const spent = run.orders.reduce((sum, order, index) => sum + (statuses[index] === "captured" ? order.capturedTotal : 0), 0);
  return <div><div className="mb-5 flex items-center justify-between border border-white/10 bg-[#111634]/75 p-4"><div><p className="operational-label">Captured so far</p><p className="mt-1 text-2xl font-semibold tracking-tight text-white">{money(spent)} <span className="text-sm font-normal text-white/35">/ {money(run.budget)}</span></p></div><Progress value={(spent / run.budget) * 100} className="w-36 sm:w-56" indicatorClassName="bg-emerald-400" /></div>
    <div className="grid items-start gap-3 lg:grid-cols-2">{run.orders.map((order, i) => {
      const Icon = icons[order.icon];
      const done = statuses[i] === "captured";
      const isExpanded = expanded === i;
      const delta = order.allocation - order.capturedTotal;
      const result = order.upgraded ? "Upgraded" : order.substituted ? "Substituted" : delta > 0 ? `${money(delta)} under` : delta < 0 ? "Reallocated" : "On budget";
      return <Card key={order.categoryName} className={cn("shadow-none transition-all", done ? "border-emerald-400/15 bg-emerald-400/[.04]" : "border-white/[.08] bg-white/[.025]", i === 4 && "lg:col-span-2")}>
        <button type="button" aria-expanded={isExpanded} onClick={() => setExpanded(isExpanded ? null : i)} className="flex w-full items-start gap-3 p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#3A5BFF]/50">
          <div className={cn("grid h-10 w-10 shrink-0 place-items-center", done ? "bg-emerald-400/10 text-emerald-300" : "bg-white/[.05] text-white/35")}><Icon className="h-4 w-4" /></div>
          <div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-sm font-semibold text-white">{order.categoryName}</p><p className={cn("mt-1 truncate text-xs", done ? "text-white/50" : "text-white/25")}>{done ? order.selectedProduct : "Awaiting capture…"}</p></div><div className="flex shrink-0 items-center gap-2"><span className={cn("px-2 py-1 font-mono text-[8px] font-bold uppercase tracking-wider", order.upgraded ? "bg-[#F7B500]/10 text-[#F7B500]" : order.substituted ? "bg-[#FF8BD8]/10 text-[#FF8BD8]" : done && delta > 0 ? "bg-emerald-400/10 text-emerald-300" : done && delta < 0 ? "bg-[#3A5BFF]/15 text-[#8FA5FF]" : "bg-white/[.05] text-white/35")}>{done ? result : statuses[i]}</span><ChevronDown className={cn("h-4 w-4 text-white/30 transition-transform", isExpanded && "rotate-180 text-white/65")} /></div></div>
            <div className="mt-3 flex gap-6 border-t border-white/[.08] pt-3 text-xs"><div><span className="text-white/35">Allocated</span><strong className="ml-2 text-white/75">{money(order.allocation)}</strong></div><div><span className="text-white/35">Captured</span><strong className="ml-2 text-white/75">{done ? money(order.capturedTotal) : "—"}</strong></div></div>
          </div>
        </button>
        <AnimatePresence initial={false}>{isExpanded && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="border-t border-white/[.08] px-4 py-4">
          {done ? <><div className="mb-3 flex items-center justify-between gap-3"><div><p className="operational-label">Landed cost</p><p className="mt-1 text-xs text-white/45">{order.selectedMerchant} · {order.quotes.filter(quote => quote.availability !== "unavailable").length} viable quotes</p></div>{order.preferredUnavailable && <span className="bg-[#FF8BD8]/10 px-2 py-1 font-mono text-[8px] font-bold uppercase tracking-wider text-[#FF8BD8]">Stock changed</span>}</div><div className="space-y-2.5">{order.lineItems.map(item => <div key={`${item.kind}-${item.label}`} className="flex items-center gap-3 text-xs"><CheckCircle2 className={cn("h-3.5 w-3.5 shrink-0", item.amount < 0 ? "text-[#F7B500]" : "text-[#8FA5FF]")} /><span className="min-w-0 flex-1 text-white/62">{item.label}</span><span className={cn("font-mono text-[9px]", item.amount < 0 ? "text-[#F7B500]" : "text-white/60")}>{item.amount < 0 ? `−${money(Math.abs(item.amount))}` : money(item.amount)}</span></div>)}</div><div className="mt-4 flex items-center justify-between border-t border-white/[.08] pt-3 text-xs"><span className="font-semibold text-white/65">Captured total</span><strong className="text-sm text-white">{money(order.capturedTotal)}</strong></div></> : <p className="text-xs leading-5 text-white/35">Maya is validating inventory, landed cost, and merchant terms. The final receipt appears here after capture.</p>}
        </div></motion.div>}</AnimatePresence>
      </Card>;
    })}</div></div>;
}

function LiveScreen({ run, onSummary }: { run: ProcurementRun; onSummary: () => void }) {
  const scenario = run.scenario;
  const events = useMemo(() => buildEvents(run), [run]);
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
      <div className="text-center"><h1 className="text-[clamp(2rem,3.4vw,3.25rem)] font-bold leading-[.92] tracking-[-.065em] text-white shadow-black/20 drop-shadow-sm">Autonomous <span className="text-[#F7B500]">procurement</span></h1><p className="mt-2 text-xs text-white/45">{run.orders.length} specialist agents · {run.quoteCount} quotes · {money(run.budget)} secured envelope</p></div>
      <div className="mx-auto flex w-full max-w-[270px] items-center gap-3 md:mx-0 md:ml-auto"><Progress value={progress} className="bg-white/15" indicatorClassName="bg-[#3A5BFF]" /><span className="w-10 text-right font-mono text-[10px] font-bold tabular-nums text-white/45">{progress}%</span></div>
    </div>
    <Tabs defaultValue="activity" className="mt-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><TabsList><TabsTrigger value="activity"><Zap className="mr-2 h-3.5 w-3.5" />Live agent activity</TabsTrigger><TabsTrigger value="purchases"><PackageCheck className="mr-2 h-3.5 w-3.5" />Purchases by category</TabsTrigger></TabsList>
        <AnimatePresence>{complete && <motion.div initial={{ opacity: 0, scale: .9 }} animate={{ opacity: 1, scale: 1 }}><Button onClick={onSummary} className="animate-soft-pulse">View summary <ArrowRight className="ml-2 h-4 w-4" /></Button></motion.div>}</AnimatePresence></div>
      <TabsContent value="activity"><div className="grid gap-5 xl:grid-cols-[.9fr_1.1fr]"><Card className="overflow-hidden"><CardHeader className="border-b border-white/[.08] pb-4"><div className="flex items-center justify-between"><div><CardTitle>Activity stream</CardTitle><CardDescription className="mt-1">Agent-attributed, timestamped actions</CardDescription></div><div className="flex items-center gap-2 border border-white/10 bg-white/[.05] px-3 py-1.5 font-mono text-[9px] font-bold uppercase tracking-wider text-white/40"><ScanLine className="h-3.5 w-3.5 text-[#8FA5FF]" /> live</div></div></CardHeader><CardContent className="p-4 pt-5"><ActivityLog events={visible} scenario={scenario} /></CardContent></Card>
        <Card className="overflow-hidden"><CardHeader className="border-b border-white/[.08] pb-4"><div className="flex items-center justify-between"><div><CardTitle>Agent network</CardTitle><CardDescription className="mt-1">Concurrent orchestration across every category</CardDescription></div><div className="flex -space-x-2">{scenario.categories.map((c, i) => { const Icon = icons[c.icon]; return <div key={c.name} className={cn("grid h-8 w-8 place-items-center rounded-full border-2 border-[#111634]", statuses[i] === "captured" ? "bg-emerald-500 text-white" : activeCategories.includes(i) ? agentThemes[i].icon : "bg-white/[.05] text-white/30")}><Icon className="h-3.5 w-3.5" /></div>; })}</div></div></CardHeader><CardContent className="p-2 sm:p-4"><AgentGraph scenario={scenario} statuses={statuses} activeCategories={complete ? [] : activeCategories} /></CardContent></Card></div></TabsContent>
      <TabsContent value="purchases" className="purchase-ledger"><PurchaseCards run={run} statuses={statuses} /></TabsContent>
    </Tabs>
  </motion.section>;
}

const pdfSafe = (value: string) => value
  .replace(/[—–]/g, "-")
  .replace(/×/g, "x")
  .replace(/·/g, " | ")
  .replace(/’/g, "'")
  .replace(/−/g, "-");

async function downloadRunSummary(run: ProcurementRun) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "letter", compress: true });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 46;
  const contentWidth = pageWidth - margin * 2;
  let y = 0;

  const addContinuationHeader = () => {
    doc.setFillColor(10, 14, 39);
    doc.rect(0, 0, pageWidth, 54, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text("VISA | MAYA", margin, 33);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(170, 181, 220);
    doc.text(`${run.id} | PROCUREMENT SUMMARY`, pageWidth - margin, 33, { align: "right" });
    y = 78;
  };

  const ensureSpace = (height: number) => {
    if (y + height <= pageHeight - 48) return;
    doc.addPage();
    addContinuationHeader();
  };

  const sectionTitle = (title: string, detail?: string) => {
    ensureSpace(34);
    doc.setFillColor(247, 181, 0);
    doc.rect(margin, y - 9, 4, 13, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(10, 14, 39);
    doc.text(title.toUpperCase(), margin + 12, y);
    if (detail) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(104, 113, 145);
      doc.text(pdfSafe(detail), pageWidth - margin, y, { align: "right" });
    }
    y += 20;
  };

  doc.setFillColor(10, 14, 39);
  doc.rect(0, 0, pageWidth, 122, "F");
  doc.setFillColor(20, 52, 203);
  doc.rect(0, 118, pageWidth, 4, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(23);
  doc.setTextColor(255, 255, 255);
  doc.text("VISA | MAYA", margin, 44);
  doc.setFontSize(17);
  doc.text("Procurement run summary", margin, 75);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(178, 188, 225);
  doc.text(pdfSafe(`${run.scenario.businessType} | ${run.id} | ${run.orders.length} captured orders`), margin, 96);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(75, 226, 171);
  doc.text("RECONCILED - INSIDE HARD CAP", pageWidth - margin, 43, { align: "right" });
  y = 150;

  const metrics = [
    ["APPROVED", run.budget],
    ["CAPTURED", run.totalSpent],
    ["REMAINING", run.remaining],
    ["REALLOCATED", run.totalReallocated],
  ] as const;
  const metricGap = 6;
  const metricWidth = (contentWidth - metricGap * 3) / 4;
  metrics.forEach(([label, value], index) => {
    const x = margin + index * (metricWidth + metricGap);
    doc.setFillColor(245, 247, 253);
    doc.setDrawColor(221, 226, 241);
    doc.rect(x, y, metricWidth, 55, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(101, 111, 145);
    doc.text(label, x + 10, y + 17);
    doc.setFontSize(14);
    doc.setTextColor(index === 3 ? 177 : 20, index === 3 ? 126 : 32, index === 3 ? 0 : 75);
    doc.text(money(value), x + 10, y + 40);
  });
  y += 82;

  sectionTitle("Run controls", `${run.quoteCount} quotes evaluated`);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(62, 70, 99);
  doc.text(`Allocated before run: ${money(run.allocatedTotal)}`, margin, y);
  doc.text(`Flexible reserve: ${money(run.unallocatedReserve)}`, margin + 176, y);
  doc.text(`Fees and tax: ${money(run.totalFees)}`, margin + 340, y);
  y += 16;
  doc.text(`Discounts and credits: -${money(run.totalDiscounts)}`, margin, y);
  doc.text(`Budget utilization: ${Math.round((run.totalSpent / run.budget) * 100)}%`, margin + 176, y);
  doc.text(`Stock substitutions: ${run.orders.filter(order => order.substituted).length}`, margin + 340, y);
  y += 32;

  sectionTitle("Order ledger", "Landed cost by category");
  run.orders.forEach(order => {
    const outcome = order.upgraded
      ? "UPGRADED"
      : order.substituted
        ? "SUBSTITUTED"
        : order.capturedTotal < order.allocation
          ? `${money(order.allocation - order.capturedTotal)} UNDER`
          : order.capturedTotal > order.allocation
            ? `${money(order.capturedTotal - order.allocation)} REALLOCATED`
            : "WITHIN ENVELOPE";
    const blockHeight = 78 + order.lineItems.length * 13;
    ensureSpace(blockHeight + 12);
    doc.setFillColor(order.upgraded ? 255 : 248, order.upgraded ? 249 : 249, order.upgraded ? 229 : 253);
    doc.setDrawColor(order.upgraded ? 237 : 225, order.upgraded ? 206 : 229, order.upgraded ? 104 : 241);
    doc.rect(margin, y, contentWidth, blockHeight, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(10, 14, 39);
    doc.text(pdfSafe(order.categoryName), margin + 12, y + 19);
    doc.setFontSize(10);
    doc.text(money(order.capturedTotal), pageWidth - margin - 12, y + 19, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(75, 84, 115);
    doc.text(pdfSafe(order.selectedProduct), margin + 12, y + 36, { maxWidth: contentWidth - 160 });
    doc.text(pdfSafe(order.selectedMerchant), margin + 12, y + 50);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(order.substituted ? 191 : order.upgraded ? 170 : 38, order.substituted ? 60 : order.upgraded ? 121 : 73, order.substituted ? 151 : order.upgraded ? 0 : 165);
    doc.text(outcome, pageWidth - margin - 12, y + 49, { align: "right" });
    doc.setDrawColor(226, 230, 241);
    doc.line(margin + 12, y + 59, pageWidth - margin - 12, y + 59);
    let lineY = y + 74;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    order.lineItems.forEach(item => {
      doc.setTextColor(86, 94, 121);
      doc.text(pdfSafe(item.label), margin + 12, lineY, { maxWidth: contentWidth - 120 });
      doc.setTextColor(item.amount < 0 ? 166 : 62, item.amount < 0 ? 119 : 70, item.amount < 0 ? 0 : 99);
      doc.text(item.amount < 0 ? `-${money(Math.abs(item.amount))}` : money(item.amount), pageWidth - margin - 12, lineY, { align: "right" });
      lineY += 13;
    });
    y += blockHeight + 10;
  });

  sectionTitle("Reallocation trail", `${run.transfers.length} transfers`);
  if (run.transfers.length === 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(75, 84, 115);
    doc.text("No transfers were required; every order fit its original category envelope.", margin, y);
    y += 22;
  } else {
    run.transfers.forEach(transfer => {
      ensureSpace(20);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(75, 84, 115);
      doc.text(pdfSafe(`${transfer.from} -> ${transfer.to}`), margin, y);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(171, 122, 0);
      doc.text(money(transfer.amount), pageWidth - margin, y, { align: "right" });
      doc.setDrawColor(232, 235, 244);
      doc.line(margin, y + 7, pageWidth - margin, y + 7);
      y += 20;
    });
  }

  ensureSpace(48);
  y += 8;
  doc.setFillColor(10, 14, 39);
  doc.rect(margin, y, contentWidth, 40, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(`Final captured total: ${money(run.totalSpent)}`, margin + 12, y + 17);
  doc.setTextColor(75, 226, 171);
  doc.text(`${money(run.remaining)} remaining`, pageWidth - margin - 12, y + 17, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(173, 183, 219);
  doc.text("All captures reconciled to the approved hard budget boundary.", margin + 12, y + 30);

  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(133, 141, 166);
    doc.text(`Visa Maya | ${run.id}`, margin, pageHeight - 22);
    doc.text(`Page ${page} of ${pageCount}`, pageWidth - margin, pageHeight - 22, { align: "right" });
  }

  const fileName = `visa-maya-${run.scenario.id}-${run.id.toLowerCase()}.pdf`;
  doc.save(fileName);
}

function SummaryScreen({ run, onRestart }: { run: ProcurementRun; onRestart: () => void }) {
  const [pdfDownloading, setPdfDownloading] = useState(false);
  const scenario = run.scenario;
  const chartData = run.orders.map(order => ({ name: order.categoryName.split(" ")[0], allocated: order.allocation, spent: order.capturedTotal }));
  const donut = [{ name: "Captured", value: run.totalSpent }, { name: "Remaining", value: run.remaining }];
  const upgradeOrder = run.orders.find(order => order.upgraded);
  const substitutionCount = run.orders.filter(order => order.substituted).length;
  const handlePdfDownload = async () => {
    setPdfDownloading(true);
    try {
      await downloadRunSummary(run);
    } finally {
      setPdfDownloading(false);
    }
  };
  return <motion.section {...screenMotion} className="workspace-section mx-auto min-h-screen max-w-[1440px] px-5 pb-16 pt-28 sm:px-8">
    <div className="grid items-end gap-6 border-b border-white/10 pb-7 lg:grid-cols-[1fr_auto]"><div><div className="section-kicker"><BadgeCheck className="h-3.5 w-3.5" /> Procurement dashboard · {run.id}</div><h1 className="workspace-title mt-4">Run summary.</h1><p className="workspace-lede mt-3 max-w-2xl">{scenario.businessType} · {run.orders.length} orders captured from {run.quoteCount} evaluated quotes, all reconciled to the approved envelope.</p></div><div className="flex items-center gap-4 border border-emerald-400/20 bg-emerald-400/[.06] px-5 py-4"><motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }} className="summary-seal"><span className="summary-seal-ring" /><Check className="relative h-7 w-7 text-[#F7B500]" /></motion.div><div><p className="font-mono text-[9px] font-bold uppercase tracking-[.18em] text-emerald-300">Reconciled</p><p className="mt-1 text-sm font-semibold text-white">Inside hard cap</p></div></div></div>
    <div className="mt-4 flex justify-end"><Button variant="outline" onClick={() => void handlePdfDownload()} disabled={pdfDownloading} className="border-white/15 bg-white/[.06] text-white hover:border-[#F7B500]/35 hover:bg-[#F7B500]/10 hover:text-white">{pdfDownloading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin text-[#F7B500]" /> : <Download className="mr-2 h-4 w-4 text-[#F7B500]" />}{pdfDownloading ? "Preparing PDF…" : "Download PDF summary"}</Button></div>
    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[
      { label: "Approved envelope", value: run.budget, tone: "text-white" },
      { label: "Captured", value: run.totalSpent, tone: "text-[#8FA5FF]" },
      { label: "Remaining", value: run.remaining, tone: "text-emerald-300" },
      { label: "Reallocated", value: run.totalReallocated, tone: "text-[#F7B500]" },
    ].map(metric => <Card key={metric.label} className="shadow-none"><CardContent className="p-5"><p className="operational-label">{metric.label}</p><p className={cn("mt-2 text-2xl font-semibold tracking-[-.035em]", metric.tone)}>{money(metric.value)}</p></CardContent></Card>)}</div>
    <div className="mt-5 grid gap-5 lg:grid-cols-[.72fr_1.28fr]">
      <Card><CardHeader><CardTitle>Budget utilization</CardTitle><CardDescription>Captured total against the hard cap</CardDescription></CardHeader><CardContent><div className="relative mx-auto h-60"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={donut} dataKey="value" innerRadius={72} outerRadius={98} startAngle={90} endAngle={-270} strokeWidth={0} isAnimationActive={false}>{donut.map((_, i) => <Cell key={i} fill={i === 0 ? "#3A5BFF" : "#293154"} />)}</Pie></PieChart></ResponsiveContainer><div className="absolute inset-0 grid place-content-center text-center"><span className="text-xs text-white/40">Captured</span><strong className="text-3xl tracking-tight text-white">{money(run.totalSpent)}</strong><span className="font-mono text-[9px] font-bold uppercase tracking-wider text-emerald-300">{Math.round((run.totalSpent / run.budget) * 100)}% utilized</span></div></div><div className="flex items-center justify-between border-t border-white/[.08] pt-4 text-xs"><span className="text-white/40">Fees and tax</span><strong className="text-white/70">{money(run.totalFees)}</strong><span className="text-white/40">Discounts and credits</span><strong className="text-[#F7B500]">−{money(run.totalDiscounts)}</strong></div></CardContent></Card>
      <Card className="overflow-hidden"><CardHeader><CardTitle>Category spend</CardTitle><CardDescription>Allocation compared with final captured price</CardDescription></CardHeader><CardContent className="h-[310px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} margin={{ top: 10, right: 5, left: -15, bottom: 5 }}><CartesianGrid strokeDasharray="3 5" vertical={false} stroke="#27315B" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#7F8AB5" }} /><YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#66719D" }} tickFormatter={v => `$${v / 1000}k`} /><Tooltip cursor={{ fill: "rgba(58,91,255,.08)" }} formatter={(value: number) => money(value)} contentStyle={{ borderRadius: 7, border: "1px solid rgba(255,255,255,.1)", background: "#111634", color: "#FFFFFF", boxShadow: "0 12px 30px rgba(0,0,0,.35)", fontSize: 12 }} /><Bar dataKey="allocated" fill="#33406E" radius={[3, 3, 0, 0]} isAnimationActive={false} /><Bar dataKey="spent" fill="#3A5BFF" radius={[3, 3, 0, 0]} isAnimationActive={false} /></BarChart></ResponsiveContainer></CardContent></Card>
    </div>
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .35 }} className="redirect-dossier mt-5 overflow-hidden border border-[#F7B500]/25 bg-[#111634]/90 shadow-[0_34px_70px_-42px_rgba(0,0,0,.9)] backdrop-blur-xl"><div className="grid gap-5 px-6 py-6 text-white lg:grid-cols-[.78fr_1.22fr] lg:items-center"><div className="flex items-start gap-4"><div className="grid h-11 w-11 shrink-0 place-items-center border border-[#F7B500]/25 bg-[#F7B500]/10"><ArrowRightLeft className="h-5 w-5 text-[#F7B500]" /></div><div><p className="workspace-card-heading text-white">{run.transfers.length ? `${money(run.totalReallocated)} dynamically reallocated` : "No reallocation required"}</p><p className="mt-1 text-sm leading-6 text-white/55">{upgradeOrder ? `Surplus unlocked the ${upgradeOrder.selectedProduct} while preserving the hard cap.` : "Every captured order fit inside its original category envelope."}</p><p className="mt-2 font-mono text-[9px] uppercase tracking-wider text-white/30">{substitutionCount} stock substitution{substitutionCount === 1 ? "" : "s"} · {money(run.totalDiscounts)} discounts and credits</p></div></div><div className="grid gap-2 sm:grid-cols-2">{run.transfers.slice(0, 4).map((transfer, index) => <div key={`${transfer.from}-${transfer.to}-${index}`} className="border border-white/[.08] bg-white/[.035] px-3 py-2.5"><div className="flex items-center gap-2 text-[10px]"><span className="truncate text-white/45">{transfer.from}</span><ArrowRight className="h-3 w-3 shrink-0 text-[#F7B500]" /><span className="truncate text-white/70">{transfer.to}</span></div><p className="mt-1 font-mono text-[10px] font-bold text-[#F7B500]">{money(transfer.amount)}</p></div>)}</div></div></motion.div>
    <Card className="mt-5"><CardHeader className="px-6 sm:px-8"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><CardTitle>Order ledger</CardTitle><CardDescription className="mt-1">Allocation, landed capture, merchant, and outcome</CardDescription></div><span className="font-mono text-[9px] font-bold uppercase tracking-[.14em] text-white/30">Run {run.id} · {run.orders.length} captures</span></div></CardHeader><CardContent className="px-6 pb-6 sm:px-8"><div className="overflow-x-auto"><table className="w-full min-w-[780px] text-left"><thead><tr className="border-b border-white/[.08] text-[10px] font-bold uppercase tracking-wider text-white/40"><th className="pb-3 pl-2">Category</th><th className="pb-3">Allocated</th><th className="pb-3">Captured</th><th className="pb-3">Product / merchant</th><th className="pb-3 pr-2 text-right">Outcome</th></tr></thead><tbody>{run.orders.map(order => { const Icon = icons[order.icon]; const delta = order.allocation - order.capturedTotal; const result = order.upgraded ? "Upgraded" : order.substituted ? "Substituted" : delta > 0 ? `${money(delta)} under` : delta < 0 ? `${money(-delta)} reallocated` : "Within envelope"; return <tr key={order.categoryName} className={cn("border-b border-white/[.07] last:border-0", order.upgraded && "bg-[#F7B500]/[.035]", order.substituted && "bg-[#FF8BD8]/[.025]")}><td className="py-4 pl-2"><div className="flex items-center gap-3"><div className="grid h-8 w-8 place-items-center bg-[#3A5BFF]/10 text-[#8FA5FF]"><Icon className="h-3.5 w-3.5" /></div><span className="text-sm font-semibold text-white">{order.categoryName}</span></div></td><td className="py-4 text-sm text-white/50">{money(order.allocation)}</td><td className="py-4 text-sm font-semibold text-white">{money(order.capturedTotal)}</td><td className="py-4"><p className="max-w-[360px] truncate text-sm text-white/65">{order.selectedProduct}</p><p className="mt-1 text-[10px] text-white/30">{order.selectedMerchant}</p></td><td className="py-4 pr-2 text-right"><span className={cn("px-2.5 py-1 font-mono text-[8px] font-bold uppercase tracking-wider", order.upgraded ? "bg-[#F7B500]/10 text-[#F7B500]" : order.substituted ? "bg-[#FF8BD8]/10 text-[#FF8BD8]" : delta > 0 ? "bg-emerald-400/10 text-emerald-300" : delta < 0 ? "bg-[#3A5BFF]/15 text-[#8FA5FF]" : "bg-white/[.05] text-white/45")}>{result}</span></td></tr>; })}</tbody></table></div></CardContent></Card>
    <div className="mt-8 flex flex-col items-center justify-between gap-5 border-t border-white/10 pt-7 text-center sm:flex-row sm:text-left"><div><p className="font-semibold text-white">One plan. Five agents. Zero budget overruns.</p><p className="mt-1 text-sm text-white/45">Visa Maya turned spend controls into better business outcomes.</p></div><Button variant="outline" size="lg" onClick={onRestart} className="border-white/15 bg-white/[.07] text-white hover:border-white/25 hover:bg-white/[.12] hover:text-white"><RotateCcw className="mr-2 h-4 w-4" /> Start another plan</Button></div>
  </motion.section>;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [scenario, setScenario] = useState<Scenario>(scenarios[0]);
  const [prompt, setPrompt] = useState(scenarios[0].prefilledPrompt);
  const [allocations, setAllocations] = useState(scenarios[0].categories.map(c => c.estimatedAllocation));
  const [authIntent, setAuthIntent] = useState<AuthIntent>("pass");
  const [run, setRun] = useState<ProcurementRun | null>(null);
  const scenarioIndex = scenarios.findIndex(item => item.id === scenario.id);
  const selectScenario = (next: Scenario) => { setScenario(next); setPrompt(next.prefilledPrompt); setAllocations(next.categories.map(c => c.estimatedAllocation)); setRun(null); };
  const cycleScenario = (direction: -1 | 1) => { const nextIndex = (scenarioIndex + direction + scenarios.length) % scenarios.length; selectScenario(scenarios[nextIndex]); };
  const reset = () => { selectScenario(scenarios[0]); setAuthIntent("pass"); setScreen("landing"); };
  const startPurchasing = () => { setRun(createProcurementRun(scenario, allocations)); setScreen("live"); };
  return <AmbientShell showReset={screen !== "landing"} onReset={reset}><AnimatePresence mode="wait">
    {screen === "landing" && <LandingScreen key="landing" scenario={scenario} prompt={prompt} setPrompt={setPrompt} onCycle={cycleScenario} authIntent={authIntent} setAuthIntent={setAuthIntent} onSubmit={() => setScreen("auth")} />}
    {screen === "auth" && <AuthScreen key="auth" intent={authIntent} onSuccess={() => setScreen("priority")} />}
    {screen === "priority" && <PriorityScreen key="priority" scenario={scenario} allocations={allocations} setAllocations={setAllocations} onContinue={startPurchasing} />}
    {screen === "live" && run && <LiveScreen key="live" run={run} onSummary={() => setScreen("summary")} />}
    {screen === "summary" && run && <SummaryScreen key="summary" run={run} onRestart={reset} />}
  </AnimatePresence></AmbientShell>;
}
