export type Industry =
  | "home_services"
  | "professional_services"
  | "restaurant"
  | "retail"
  | "manufacturing"
  | "construction"
  | "automotive"
  | "healthcare"
  | "beauty_personal_care"
  | "fitness_recreation"
  | "transportation_logistics"
  | "hospitality"
  | "education_childcare"
  | "technology_software"
  | "wholesale_distribution"
  | "agriculture"
  | "cleaning_maintenance"
  | "real_estate_services"
  | "pet_services"
  | "other";

export type OwnerDependence = "low" | "medium" | "high";

export type BusinessData = {
  name: string;
  industry: Industry;
  customIndustry: string;
  city: string;
  state: string;
  netProfit: number;
  ownerSalary: number;
  interest: number;
  depreciation: number;
  oneTimeAddbacks: number;
  growthRate: number;
  recurringRevenue: number;
  ownerDependence: OwnerDependence;
  largestCustomer: number;
  leaseYears: number;
  localGrowth: number;
  inventory: number;
  excessAssets: number;
  debtAssumed: number;
  sourceDomains: string;
};

export type MultipleAdjustment = {
  label: string;
  value: number;
  explanation: string;
};

export type ValuationResult = {
  sde: number;
  baseMultiple: number;
  adjustedMultiple: number;
  lowMultiple: number;
  highMultiple: number;
  lowValue: number;
  midpointValue: number;
  highValue: number;
  askingPrice: number;
  likelySaleLow: number;
  likelySaleHigh: number;
  adjustments: MultipleAdjustment[];
  confidence: number;
};

export const industryLabels: Record<Industry, string> = {
  home_services: "Home services",
  professional_services: "Professional services",
  restaurant: "Restaurant & food",
  retail: "Retail",
  manufacturing: "Manufacturing",
  construction: "Construction",
  automotive: "Automotive",
  healthcare: "Healthcare",
  beauty_personal_care: "Beauty & personal care",
  fitness_recreation: "Fitness & recreation",
  transportation_logistics: "Transportation & logistics",
  hospitality: "Hospitality",
  education_childcare: "Education & childcare",
  technology_software: "Technology & software",
  wholesale_distribution: "Wholesale & distribution",
  agriculture: "Agriculture",
  cleaning_maintenance: "Cleaning & maintenance",
  real_estate_services: "Real estate services",
  pet_services: "Pet services",
  other: "Other",
};

const baselines: Record<Industry, number> = {
  home_services: 3.1,
  professional_services: 3.4,
  restaurant: 2.5,
  retail: 2.55,
  manufacturing: 3.7,
  construction: 2.9,
  automotive: 2.9,
  healthcare: 2.9,
  beauty_personal_care: 2.9,
  fitness_recreation: 2.9,
  transportation_logistics: 2.9,
  hospitality: 2.9,
  education_childcare: 2.9,
  technology_software: 2.9,
  wholesale_distribution: 2.9,
  agriculture: 2.9,
  cleaning_maintenance: 2.9,
  real_estate_services: 2.9,
  pet_services: 2.9,
  other: 2.9,
};

export const demoBusiness: BusinessData = {
  name: "Desert Air Mechanical",
  industry: "home_services",
  customIndustry: "",
  city: "Phoenix",
  state: "AZ",
  netProfit: 188_000,
  ownerSalary: 115_000,
  interest: 12_000,
  depreciation: 28_000,
  oneTimeAddbacks: 22_000,
  growthRate: 11,
  recurringRevenue: 24,
  ownerDependence: "medium",
  largestCustomer: 7,
  leaseYears: 4,
  localGrowth: 1.8,
  inventory: 62_000,
  excessAssets: 18_000,
  debtAssumed: 35_000,
  sourceDomains: "census.gov, bls.gov, bea.gov, bizbuysell.com",
};

const roundTo = (value: number, increment = 5_000) =>
  Math.round(value / increment) * increment;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export function calculateValuation(data: BusinessData): ValuationResult {
  const sde = Math.max(
    0,
    data.netProfit +
      data.ownerSalary +
      data.interest +
      data.depreciation +
      data.oneTimeAddbacks,
  );
  const baseMultiple = baselines[data.industry];
  const adjustments: MultipleAdjustment[] = [];

  if (data.growthRate >= 10) {
    adjustments.push({
      label: "Revenue momentum",
      value: 0.25,
      explanation: `${data.growthRate}% annual growth supports a premium.`,
    });
  } else if (data.growthRate >= 5) {
    adjustments.push({
      label: "Revenue momentum",
      value: 0.12,
      explanation: `${data.growthRate}% annual growth is a modest positive.`,
    });
  } else if (data.growthRate < 0) {
    adjustments.push({
      label: "Revenue trend",
      value: -0.3,
      explanation: `${Math.abs(data.growthRate)}% annual decline increases buyer risk.`,
    });
  }

  const recurringAdjustment =
    data.recurringRevenue >= 50
      ? 0.25
      : data.recurringRevenue >= 25
        ? 0.12
        : data.recurringRevenue < 10
          ? -0.08
          : 0;
  if (recurringAdjustment !== 0) {
    adjustments.push({
      label: "Recurring revenue",
      value: recurringAdjustment,
      explanation: `${data.recurringRevenue}% of revenue is contract-like or recurring.`,
    });
  }

  const ownerAdjustment =
    data.ownerDependence === "high"
      ? -0.35
      : data.ownerDependence === "medium"
        ? -0.12
        : 0.1;
  adjustments.push({
    label: "Owner dependence",
    value: ownerAdjustment,
    explanation:
      data.ownerDependence === "high"
        ? "The owner is essential to delivery or sales."
        : data.ownerDependence === "medium"
          ? "Some owner knowledge will need to transfer."
          : "The team can run daily operations with limited owner input.",
  });

  if (data.largestCustomer > 50) {
    adjustments.push({
      label: "Customer concentration",
      value: -0.3,
      explanation: `The largest customer represents ${data.largestCustomer}% of revenue.`,
    });
  } else if (data.largestCustomer > 30) {
    adjustments.push({
      label: "Customer concentration",
      value: -0.18,
      explanation: `The largest customer represents ${data.largestCustomer}% of revenue.`,
    });
  } else if (data.largestCustomer < 15) {
    adjustments.push({
      label: "Customer diversity",
      value: 0.08,
      explanation: "No single customer appears to control the revenue base.",
    });
  }

  if (data.leaseYears < 2) {
    adjustments.push({
      label: "Lease term",
      value: -0.2,
      explanation: "Less than two years remain on the current lease.",
    });
  } else if (data.leaseYears >= 5) {
    adjustments.push({
      label: "Lease stability",
      value: 0.08,
      explanation: "At least five years remain on the current lease.",
    });
  }

  if (data.localGrowth >= 2) {
    adjustments.push({
      label: "Local market",
      value: 0.15,
      explanation: `${data.localGrowth}% local growth suggests a supportive market.`,
    });
  } else if (data.localGrowth >= 1) {
    adjustments.push({
      label: "Local market",
      value: 0.06,
      explanation: `${data.localGrowth}% local growth is a modest tailwind.`,
    });
  } else if (data.localGrowth < 0) {
    adjustments.push({
      label: "Local market",
      value: -0.12,
      explanation: `${data.localGrowth}% local contraction may reduce buyer demand.`,
    });
  }

  const adjustedMultiple = clamp(
    baseMultiple + adjustments.reduce((sum, item) => sum + item.value, 0),
    1.5,
    5.5,
  );
  const lowMultiple = Math.max(1.25, adjustedMultiple - 0.4);
  const highMultiple = adjustedMultiple + 0.4;
  const balanceSheetAdjustment =
    data.inventory + data.excessAssets - data.debtAssumed;
  const lowValue = Math.max(0, roundTo(sde * lowMultiple + balanceSheetAdjustment));
  const midpointValue = Math.max(
    0,
    roundTo(sde * adjustedMultiple + balanceSheetAdjustment),
  );
  const highValue = Math.max(
    0,
    roundTo(sde * highMultiple + balanceSheetAdjustment),
  );

  const completeness = [
    data.name,
    data.city,
    data.industry === "other" ? data.customIndustry?.trim() : data.industry,
    data.netProfit !== 0,
    data.sourceDomains,
  ].filter(Boolean).length;

  return {
    sde,
    baseMultiple,
    adjustedMultiple,
    lowMultiple,
    highMultiple,
    lowValue,
    midpointValue,
    highValue,
    askingPrice: roundTo(highValue * 1.06),
    likelySaleLow: roundTo(lowValue * 1.02),
    likelySaleHigh: roundTo(midpointValue * 1.03),
    adjustments,
    confidence: clamp(56 + completeness * 6, 56, 86),
  };
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value || 0);
}
