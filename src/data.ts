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

export const getPaidPrice = (scenario: Scenario, category: Category) =>
  category.isUpgradeTarget ? (category.upgradedPrice ?? category.actualFound) - (scenario.checkoutCredit ?? 0) : category.actualFound;

export const getTotalSpent = (scenario: Scenario) => scenario.categories.reduce((sum, category) => sum + getPaidPrice(scenario, category), 0);
