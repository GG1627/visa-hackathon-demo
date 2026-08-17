export type Category = {
  name: string;
  icon: "Coffee" | "PackageOpen" | "TentTree" | "CupSoda" | "CreditCard" | "ChefHat" | "Wheat" | "Store" | "Tags" | "TableProperties" | "Scissors" | "Droplets" | "Palette";
  estimatedAllocation: number;
  actualFound: number;
  upgradedPrice?: number;
  isUpgradeTarget: boolean;
  isSurplusSource: boolean;
  productName: string;
  upgradedProductName?: string;
  candidates: string[];
};

export type Scenario = {
  id: string;
  businessType: string;
  shortDescription: string;
  prefilledPrompt: string;
  totalBudget: number;
  categories: Category[];
  checkoutCredit?: number;
};

export type ProcurementQuote = {
  name: string;
  merchant: string;
  listPrice: number;
  landedTotal: number;
  availability: "available" | "unavailable" | "limited";
};

export type ProcurementLineItem = {
  label: string;
  kind: "merchandise" | "shipping" | "tax" | "discount" | "credit";
  amount: number;
};

export type ProcurementOrder = {
  categoryIndex: number;
  categoryName: string;
  icon: Category["icon"];
  allocation: number;
  quotes: ProcurementQuote[];
  selectedProduct: string;
  selectedMerchant: string;
  selectedCandidateIndex: number;
  preferredUnavailable: boolean;
  substituted: boolean;
  upgraded: boolean;
  listPrice: number;
  shipping: number;
  tax: number;
  discount: number;
  credit: number;
  capturedTotal: number;
  lineItems: ProcurementLineItem[];
};

export type ReallocationTransfer = {
  from: string;
  to: string;
  amount: number;
};

export type ProcurementRun = {
  id: string;
  scenario: Scenario;
  budget: number;
  allocations: number[];
  allocatedTotal: number;
  unallocatedReserve: number;
  orders: ProcurementOrder[];
  transfers: ReallocationTransfer[];
  totalReallocated: number;
  totalSpent: number;
  remaining: number;
  totalFees: number;
  totalDiscounts: number;
  quoteCount: number;
};

export const scenarios: Scenario[] = [
  {
    id: "coffee-stand",
    businessType: "Coffee Stand",
    shortDescription: "A polished farmer's market setup",
    prefilledPrompt: "I'm opening a coffee stand with a $3,000 budget for a farmer's market and coffee stand. Purchase all necessary equipment to start my business.",
    totalBudget: 3000,
    categories: [
      { name: "Espresso Machine", icon: "Coffee", estimatedAllocation: 1400, actualFound: 1200, upgradedPrice: 1750, isUpgradeTarget: true, isSurplusSource: false, productName: "Northstar Barista Pro", upgradedProductName: "LineaCraft Studio Mini", candidates: ["Northstar Barista Pro ($1,200)", "Aster Dual Boiler ($1,290)", "Modena Compact One ($1,340)"] },
      { name: "Coffee Beans", icon: "PackageOpen", estimatedAllocation: 400, actualFound: 350, isUpgradeTarget: false, isSurplusSource: false, productName: "Alder & Pine Espresso — 20 lb", candidates: ["Alder & Pine Espresso ($350)", "Common Ground House Blend ($370)", "Daybreak Market Roast ($385)"] },
      { name: "Tent / Canopy", icon: "TentTree", estimatedAllocation: 600, actualFound: 380, isUpgradeTarget: false, isSurplusSource: true, productName: "Ridgefield ProMarket 10×10", candidates: ["Ridgefield ProMarket ($380)", "Everstand Vendor Pro ($425)", "Fieldhouse All-Weather ($469)"] },
      { name: "Cups & Utensils", icon: "CupSoda", estimatedAllocation: 250, actualFound: 220, isUpgradeTarget: false, isSurplusSource: false, productName: "ServeKind Opening Service Kit", candidates: ["ServeKind Opening Kit ($220)", "EcoWare Market Pack ($235)", "Daily Pour Starter Set ($242)"] },
      { name: "Payment Processor", icon: "CreditCard", estimatedAllocation: 350, actualFound: 300, isUpgradeTarget: false, isSurplusSource: false, productName: "Orbit Tap Reader + Stand", candidates: ["Orbit Tap Reader + Stand ($300)", "CounterPay Flex Kit ($325)", "Relay Checkout Mini ($340)"] },
    ],
  },
  {
    id: "home-bakery",
    businessType: "Home Bakery",
    shortDescription: "Production, packaging, and checkout",
    prefilledPrompt: "I'm starting a home bakery business with a $3,500 budget. Purchase all necessary equipment to start my business.",
    totalBudget: 3500,
    checkoutCredit: 40,
    categories: [
      { name: "Countertop Oven", icon: "ChefHat", estimatedAllocation: 1600, actualFound: 1400, upgradedPrice: 2100, isUpgradeTarget: true, isSurplusSource: false, productName: "Hearthline Convection 4", upgradedProductName: "Hearthline Double-Deck 8", candidates: ["Hearthline Convection 4 ($1,400)", "Baker's Row CX4 ($1,475)", "Copperstone ProBake ($1,520)"] },
      { name: "Ingredient Stock", icon: "Wheat", estimatedAllocation: 500, actualFound: 460, isUpgradeTarget: false, isSurplusSource: false, productName: "Mill & Meadow Pantry Set", candidates: ["Mill & Meadow Pantry Set ($460)", "Baker's Reserve Stock ($475)", "Flourhouse Opening Lot ($490)"] },
      { name: "Display Case", icon: "Store", estimatedAllocation: 700, actualFound: 420, isUpgradeTarget: false, isSurplusSource: true, productName: "Clarity Counter Display 36", candidates: ["Clarity Counter Display ($420)", "VistaServe 36 ($485)", "Glasshouse Market Case ($530)"] },
      { name: "Packaging & Labels", icon: "Tags", estimatedAllocation: 300, actualFound: 260, isUpgradeTarget: false, isSurplusSource: false, productName: "Parcel & Crumb Brand Kit", candidates: ["Parcel & Crumb Brand Kit ($260)", "Paperfolk Bakery Set ($275)", "Kraftline Launch Pack ($288)"] },
      { name: "Payment Processor", icon: "CreditCard", estimatedAllocation: 350, actualFound: 300, isUpgradeTarget: false, isSurplusSource: false, productName: "Orbit Tap Reader + Stand", candidates: ["Orbit Tap Reader + Stand ($300)", "CounterPay Flex Kit ($325)", "Relay Checkout Mini ($340)"] },
    ],
  },
  {
    id: "mobile-grooming",
    businessType: "Mobile Pet Grooming",
    shortDescription: "A road-ready professional kit",
    prefilledPrompt: "I'm launching a mobile pet grooming business with a $4,000 budget. Purchase all necessary equipment to start my business.",
    totalBudget: 4000,
    categories: [
      { name: "Grooming Table", icon: "TableProperties", estimatedAllocation: 1200, actualFound: 1050, upgradedPrice: 1650, isUpgradeTarget: true, isSurplusSource: false, productName: "Pawstead Hydraulic Pro", upgradedProductName: "Pawstead Electric-Lift Elite", candidates: ["Pawstead Hydraulic Pro ($1,050)", "GroomGrid Mobile H2 ($1,095)", "StudioPaw Lift Table ($1,140)"] },
      { name: "Clippers & Tools", icon: "Scissors", estimatedAllocation: 700, actualFound: 650, isUpgradeTarget: false, isSurplusSource: false, productName: "Coatcraft Precision Kit", candidates: ["Coatcraft Precision Kit ($650)", "Trimline Mobile Set ($669)", "ProPaw Groomer's Case ($685)"] },
      { name: "Grooming Supplies", icon: "Droplets", estimatedAllocation: 500, actualFound: 450, isUpgradeTarget: false, isSurplusSource: false, productName: "KindCoat Salon Supply Set", candidates: ["KindCoat Salon Set ($450)", "FreshFur Pro Stock ($468)", "CleanPaw Mobile Supply ($480)"] },
      { name: "Signage & Branding", icon: "Palette", estimatedAllocation: 500, actualFound: 280, isUpgradeTarget: false, isSurplusSource: true, productName: "Roadmark Mobile Brand Pack", candidates: ["Roadmark Mobile Pack ($280)", "Streetwise Brand Kit ($325)", "BrightVan Launch Set ($360)"] },
      { name: "Payment Processor", icon: "CreditCard", estimatedAllocation: 350, actualFound: 300, isUpgradeTarget: false, isSurplusSource: false, productName: "Orbit Tap Mobile Reader", candidates: ["Orbit Tap Mobile Reader ($300)", "CounterPay Go Kit ($320)", "Relay Checkout Mini ($340)"] },
    ],
  },
];

export const money = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

const merchants = ["Harbor Supply Co.", "Northline Commerce", "MarketPro Direct", "Atlas Merchant", "Fieldwork Business"];

const stableHash = (value: string) => {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const parseCandidate = (candidate: string) => {
  const match = candidate.match(/^(.*) \(\$([\d,]+)\)$/);
  if (!match) return { name: candidate, price: 0 };
  return { name: match[1], price: Number(match[2].replace(/,/g, "")) };
};

const buildLineItems = ({
  product,
  listPrice,
  capturedTotal,
  credit,
  seed,
}: {
  product: string;
  listPrice: number;
  capturedTotal: number;
  credit: number;
  seed: string;
}): Omit<ProcurementOrder, "categoryIndex" | "categoryName" | "icon" | "allocation" | "quotes" | "selectedProduct" | "selectedMerchant" | "selectedCandidateIndex" | "preferredUnavailable" | "substituted" | "upgraded"> => {
  const hash = stableHash(seed);
  const shippingOptions = [0, 12, 18, 24, 32, 45];
  const shipping = shippingOptions[hash % shippingOptions.length];
  const taxRate = 0.055 + ((hash >>> 3) % 4) * 0.005;
  const tax = Math.round(listPrice * taxRate);
  const discount = Math.max(0, listPrice + shipping + tax - credit - capturedTotal);
  const lineItems: ProcurementLineItem[] = [
    { label: product, kind: "merchandise", amount: listPrice },
    { label: shipping === 0 ? "Supplier shipping · included" : "Supplier shipping", kind: "shipping", amount: shipping },
    { label: "Estimated tax", kind: "tax", amount: tax },
  ];
  if (discount > 0) lineItems.push({ label: "Negotiated merchant discount", kind: "discount", amount: -discount });
  if (credit > 0) lineItems.push({ label: "Visa checkout credit", kind: "credit", amount: -credit });
  return { listPrice, shipping, tax, discount, credit, capturedTotal, lineItems };
};

export const createProcurementRun = (scenario: Scenario, requestedAllocations: number[]): ProcurementRun => {
  const allocations = scenario.categories.map((_, index) => Math.max(0, Math.round(requestedAllocations[index] ?? 0)));
  const allocatedTotal = allocations.reduce((sum, value) => sum + value, 0);
  const unallocatedReserve = Math.max(0, scenario.totalBudget - allocatedTotal);
  const unavailableSeed = stableHash(`${scenario.id}:availability`) % scenario.categories.length;
  const unavailableCategory = scenario.categories[unavailableSeed]?.isUpgradeTarget ? (unavailableSeed + 1) % scenario.categories.length : unavailableSeed;

  const baseOrders = scenario.categories.map((category, categoryIndex): ProcurementOrder => {
    const quotes = category.candidates.map((candidate, candidateIndex): ProcurementQuote => {
      const parsed = parseCandidate(candidate);
      const hash = stableHash(`${scenario.id}:${category.name}:${candidateIndex}`);
      const variance = ((hash % 6) - 3) / 100;
      const landedTotal = Math.max(1, Math.round(parsed.price * (1 + variance)));
      const unavailable = categoryIndex === unavailableCategory && candidateIndex === 0;
      return {
        name: parsed.name,
        merchant: merchants[(hash >>> 4) % merchants.length],
        listPrice: parsed.price,
        landedTotal,
        availability: unavailable ? "unavailable" : hash % 5 === 0 ? "limited" : "available",
      };
    });
    const availableQuotes = quotes.map((quote, index) => ({ quote, index })).filter(({ quote }) => quote.availability !== "unavailable");
    const preferred = availableQuotes.find(({ index }) => index === 0);
    const priorityRatio = allocations[categoryIndex] / Math.max(1, category.estimatedAllocation);
    const premiumCandidates = availableQuotes.filter(({ quote }) => quote.landedTotal <= allocations[categoryIndex]);
    const premium = premiumCandidates.reduce<typeof availableQuotes[number] | undefined>((best, current) => !best || current.quote.listPrice > best.quote.listPrice ? current : best, undefined);
    const selected = !category.isUpgradeTarget && priorityRatio >= 1.15 && premium
      ? premium
      : preferred ?? availableQuotes.reduce((best, current) => current.quote.landedTotal < best.quote.landedTotal ? current : best);
    const selectedProduct = selected.index === 0 ? category.productName : selected.quote.name;
    const details = buildLineItems({
      product: selectedProduct,
      listPrice: selected.quote.listPrice,
      capturedTotal: selected.quote.landedTotal,
      credit: 0,
      seed: `${scenario.id}:${category.name}:base`,
    });
    return {
      categoryIndex,
      categoryName: category.name,
      icon: category.icon,
      allocation: allocations[categoryIndex],
      quotes,
      selectedProduct,
      selectedMerchant: selected.quote.merchant,
      selectedCandidateIndex: selected.index,
      preferredUnavailable: quotes[0].availability === "unavailable",
      substituted: quotes[0].availability === "unavailable" && selected.index !== 0,
      upgraded: false,
      ...details,
    };
  });

  const targetIndex = scenario.categories.findIndex(category => category.isUpgradeTarget);
  const targetCategory = scenario.categories[targetIndex];
  const otherBaseTotal = baseOrders.reduce((sum, order, index) => sum + (index === targetIndex ? 0 : order.capturedTotal), 0);
  const upgradeHash = stableHash(`${scenario.id}:upgrade`);
  const upgradePreCredit = targetCategory.upgradedPrice ? Math.round(targetCategory.upgradedPrice * (0.95 + (upgradeHash % 3) * 0.01)) : 0;
  const upgradeCredit = scenario.checkoutCredit ?? 0;
  const upgradeCaptured = Math.max(0, upgradePreCredit - upgradeCredit);
  const targetPriority = allocations[targetIndex] / Math.max(1, targetCategory.estimatedAllocation);
  const canUpgrade = Boolean(targetCategory.upgradedPrice && targetCategory.upgradedProductName)
    && targetPriority >= 0.78
    && otherBaseTotal + upgradeCaptured <= scenario.totalBudget;

  const orders = baseOrders.map((order, index) => {
    if (index !== targetIndex || !canUpgrade || !targetCategory.upgradedPrice || !targetCategory.upgradedProductName) return order;
    const details = buildLineItems({
      product: targetCategory.upgradedProductName,
      listPrice: targetCategory.upgradedPrice,
      capturedTotal: upgradeCaptured,
      credit: upgradeCredit,
      seed: `${scenario.id}:${targetCategory.name}:upgrade`,
    });
    return {
      ...order,
      selectedProduct: targetCategory.upgradedProductName,
      selectedMerchant: merchants[(upgradeHash >>> 5) % merchants.length],
      upgraded: true,
      substituted: false,
      ...details,
    };
  });

  const sources = orders
    .map(order => ({ name: order.categoryName, amount: Math.max(0, order.allocation - order.capturedTotal) }))
    .filter(source => source.amount > 0);
  if (unallocatedReserve > 0) sources.push({ name: "Unallocated reserve", amount: unallocatedReserve });
  const deficits = orders
    .map(order => ({ name: order.categoryName, amount: Math.max(0, order.capturedTotal - order.allocation) }))
    .filter(deficit => deficit.amount > 0);
  const transfers: ReallocationTransfer[] = [];
  let sourceIndex = 0;
  deficits.forEach(deficit => {
    let remainingDeficit = deficit.amount;
    while (remainingDeficit > 0 && sourceIndex < sources.length) {
      const source = sources[sourceIndex];
      const amount = Math.min(source.amount, remainingDeficit);
      if (amount > 0) transfers.push({ from: source.name, to: deficit.name, amount });
      source.amount -= amount;
      remainingDeficit -= amount;
      if (source.amount <= 0) sourceIndex += 1;
    }
  });

  const totalSpent = orders.reduce((sum, order) => sum + order.capturedTotal, 0);
  const totalReallocated = transfers.reduce((sum, transfer) => sum + transfer.amount, 0);
  const totalFees = orders.reduce((sum, order) => sum + order.shipping + order.tax, 0);
  const totalDiscounts = orders.reduce((sum, order) => sum + order.discount + order.credit, 0);
  const runHash = stableHash(`${scenario.id}:${allocations.join(":")}:${orders.map(order => order.capturedTotal).join(":")}`).toString(36).toUpperCase().padStart(6, "0").slice(0, 6);

  return {
    id: `VM-${runHash}`,
    scenario,
    budget: scenario.totalBudget,
    allocations,
    allocatedTotal,
    unallocatedReserve,
    orders,
    transfers,
    totalReallocated,
    totalSpent,
    remaining: scenario.totalBudget - totalSpent,
    totalFees,
    totalDiscounts,
    quoteCount: orders.reduce((sum, order) => sum + order.quotes.length, 0) + (canUpgrade ? 1 : 0),
  };
};
