"use client";

import {
  BarChart3,
  BriefcaseBusiness,
  Building2,
  Check,
  ChevronRight,
  CircleDollarSign,
  Globe2,
  Info,
  Landmark,
  LineChart,
  Loader2,
  Moon,
  Plus,
  RotateCcw,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  BusinessData,
  calculateValuation,
  defaultResearchDomains,
  demoBusiness,
  formatCurrency,
  industryBaselines,
  industryLabels,
  type SupportedIndustry,
} from "@/lib/valuation";

type Stage = "business" | "financials" | "quality" | "market";

type SavedProject = {
  id: string;
  name: string;
  savedAt: string;
  data: BusinessData;
};

type MarketReport = {
  summary: string;
  signals: { title: string; finding: string; source?: string }[];
  citations?: { title: string; url: string }[];
};

type IndustryMatchResponse = {
  industry: SupportedIndustry;
  label: string;
  reason: string;
  error?: string;
};

const STORAGE_KEY = "brokerlens.projects.v1";

const sourceDescriptions: Record<string, string> = {
  "census.gov": "Local population, income, and business counts",
  "bea.gov": "Regional income and economic growth",
  "bls.gov": "Industry employment, wages, and establishment trends",
  "careeronestop.org": "Local wage ranges and hiring outlook",
  "sizeup.com": "Local competitors and business density",
  "bizbuysell.com": "Small-business sales and market multiples",
  "ibba.org": "Broker transaction trends and deal multiples",
};

const stages: { id: Stage; label: string; icon: typeof Building2 }[] = [
  { id: "business", label: "Business", icon: Building2 },
  { id: "financials", label: "Financials", icon: CircleDollarSign },
  { id: "quality", label: "Quality & risk", icon: ShieldCheck },
  { id: "market", label: "Market", icon: Globe2 },
];

const stateOptions = [
  ["AL", "Alabama"],
  ["AK", "Alaska"],
  ["AZ", "Arizona"],
  ["AR", "Arkansas"],
  ["CA", "California"],
  ["CO", "Colorado"],
  ["CT", "Connecticut"],
  ["DE", "Delaware"],
  ["DC", "Washington, D.C."],
  ["FL", "Florida"],
  ["GA", "Georgia"],
  ["HI", "Hawaii"],
  ["ID", "Idaho"],
  ["IL", "Illinois"],
  ["IN", "Indiana"],
  ["IA", "Iowa"],
  ["KS", "Kansas"],
  ["KY", "Kentucky"],
  ["LA", "Louisiana"],
  ["ME", "Maine"],
  ["MD", "Maryland"],
  ["MA", "Massachusetts"],
  ["MI", "Michigan"],
  ["MN", "Minnesota"],
  ["MS", "Mississippi"],
  ["MO", "Missouri"],
  ["MT", "Montana"],
  ["NE", "Nebraska"],
  ["NV", "Nevada"],
  ["NH", "New Hampshire"],
  ["NJ", "New Jersey"],
  ["NM", "New Mexico"],
  ["NY", "New York"],
  ["NC", "North Carolina"],
  ["ND", "North Dakota"],
  ["OH", "Ohio"],
  ["OK", "Oklahoma"],
  ["OR", "Oregon"],
  ["PA", "Pennsylvania"],
  ["RI", "Rhode Island"],
  ["SC", "South Carolina"],
  ["SD", "South Dakota"],
  ["TN", "Tennessee"],
  ["TX", "Texas"],
  ["UT", "Utah"],
  ["VT", "Vermont"],
  ["VA", "Virginia"],
  ["WA", "Washington"],
  ["WV", "West Virginia"],
  ["WI", "Wisconsin"],
  ["WY", "Wyoming"],
] as const;

const demoSignals: MarketReport = {
  summary:
    "Connect an OpenAI API key to research current market conditions from your approved domains. The valuation model below is already live and uses the operating inputs you confirm.",
  signals: [
    {
      title: "Local demand",
      finding: "Use Census and BEA data to measure population, income, and establishment growth.",
      source: "census.gov · bea.gov",
    },
    {
      title: "Labor pressure",
      finding: "Use QCEW wage and employment data to test payroll and hiring risk.",
      source: "bls.gov",
    },
    {
      title: "Transaction evidence",
      finding: "Compare the earnings multiple against closed and listed businesses.",
      source: "bizbuysell.com",
    },
  ],
};

function Field({
  label,
  hint,
  children,
  wide = false,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <label className={`field ${wide ? "field-wide" : ""}`}>
      <span className="field-label">{label}</span>
      {children}
      {hint ? <small>{hint}</small> : null}
    </label>
  );
}

export function BrokerLensApp() {
  const [data, setData] = useState<BusinessData>(demoBusiness);
  const [stage, setStage] = useState<Stage>("business");
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [showProjects, setShowProjects] = useState(false);
  const [marketReport, setMarketReport] = useState<MarketReport>(demoSignals);
  const [hasLiveResearch, setHasLiveResearch] = useState(false);
  const [researching, setResearching] = useState(false);
  const [researchNote, setResearchNote] = useState("");
  const [savedFlash, setSavedFlash] = useState(false);
  const [showGrowthCalculator, setShowGrowthCalculator] = useState(false);
  const [previousRevenue, setPreviousRevenue] = useState("");
  const [currentRevenue, setCurrentRevenue] = useState("");
  const [newSource, setNewSource] = useState("");
  const [sourceError, setSourceError] = useState("");
  const [showResearchSources, setShowResearchSources] = useState(false);
  const [matchingIndustry, setMatchingIndustry] = useState(false);
  const [industryMatchNote, setIndustryMatchNote] = useState("");
  const result = useMemo(() => calculateValuation(data), [data]);
  const researchDomains = data.sourceDomains
    .split(/[\s,;]+/)
    .map((domain) => domain.trim().toLowerCase())
    .filter(Boolean);
  const calculatedGrowth =
    previousRevenue !== "" &&
    currentRevenue !== "" &&
    Number(previousRevenue) > 0
      ? ((Number(currentRevenue) - Number(previousRevenue)) /
          Number(previousRevenue)) *
        100
      : null;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) setSavedProjects(JSON.parse(saved));
      } catch {
        // Local storage can be disabled; the valuation still works without it.
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const update = <K extends keyof BusinessData>(
    key: K,
    value: BusinessData[K],
  ) => setData((current) => ({ ...current, [key]: value }));

  const numberUpdate = (key: keyof BusinessData, value: string) =>
    update(key, (Number(value) || 0) as never);

  const addResearchSource = () => {
    let domain = "";
    try {
      domain = new URL(
        newSource.includes("://") ? newSource : `https://${newSource}`,
      ).hostname
        .toLowerCase()
        .replace(/^www\./, "");
    } catch {
      setSourceError("Enter a valid website, such as example.com.");
      return;
    }

    if (!/^(?:[a-z0-9-]+\.)+[a-z]{2,}$/i.test(domain)) {
      setSourceError("Enter a valid website, such as example.com.");
      return;
    }
    if (researchDomains.includes(domain)) {
      setSourceError("That source is already included.");
      return;
    }
    if (researchDomains.length >= 20) {
      setSourceError("You can use up to 20 research sources.");
      return;
    }

    update("sourceDomains", [...researchDomains, domain].join(", "));
    setNewSource("");
    setSourceError("");
  };

  const removeResearchSource = (domain: string) => {
    if (researchDomains.length <= 1) {
      setSourceError("Keep at least one research source.");
      return;
    }
    update(
      "sourceDomains",
      researchDomains.filter((source) => source !== domain).join(", "),
    );
    setSourceError("");
  };

  const saveProject = () => {
    const project: SavedProject = {
      id: crypto.randomUUID(),
      name: data.name || "Untitled business",
      savedAt: new Date().toISOString(),
      data,
    };
    const next = [project, ...savedProjects].slice(0, 12);
    setSavedProjects(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 1800);
  };

  const deleteProject = (id: string) => {
    const next = savedProjects.filter((project) => project.id !== id);
    setSavedProjects(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const requestIndustryMatch = async () => {
    const customIndustry = data.customIndustry.trim();
    if (!customIndustry) {
      throw new Error("Enter a broad industry before matching it.");
    }

    setMatchingIndustry(true);
    try {
      const response = await fetch("/api/classify-industry", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ customIndustry }),
      });
      const payload = (await response.json()) as IndustryMatchResponse;
      if (!response.ok) throw new Error(payload.error || "Industry matching unavailable");

      setData((current) =>
        current.industry === "other" &&
        current.customIndustry.trim() === customIndustry
          ? { ...current, matchedIndustry: payload.industry }
          : current,
      );
      setIndustryMatchNote(payload.reason);
      return payload.industry;
    } finally {
      setMatchingIndustry(false);
    }
  };

  const matchCustomIndustry = async () => {
    setIndustryMatchNote("");
    try {
      await requestIndustryMatch();
    } catch (error) {
      setIndustryMatchNote(
        error instanceof Error ? error.message : "Industry matching is unavailable.",
      );
    }
  };

  const runResearch = async () => {
    setResearching(true);
    setResearchNote("");
    try {
      let researchData = data;
      if (data.industry === "other") {
        const matchedIndustry =
          data.matchedIndustry ?? (await requestIndustryMatch());
        researchData = { ...data, matchedIndustry };
      }

      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ data: researchData }),
      });
      const payload = (await response.json()) as MarketReport & { error?: string };
      if (!response.ok) throw new Error(payload.error || "Research unavailable");
      setMarketReport(payload);
      setHasLiveResearch(true);
      setResearchNote("Live web research completed from approved sources.");
    } catch (error) {
      setMarketReport(demoSignals);
      setHasLiveResearch(false);
      setResearchNote(
        error instanceof Error
          ? error.message
          : "Research is unavailable. The valuation math is still active.",
      );
    } finally {
      setResearching(false);
    }
  };

  const currentStage = stages.findIndex((item) => item.id === stage);
  const nextStage = () => {
    if (currentStage < stages.length - 1) {
      setStage(stages[currentStage + 1].id);
    }
  };

  const toggleTheme = () => {
    const root = document.documentElement;
    const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = nextTheme;
    root.style.colorScheme = nextTheme;
    localStorage.setItem("brokerlens.theme", nextTheme);
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="BrokerLens home">
          <span className="brand-mark"><LineChart size={19} /></span>
          <span>Broker<span>Lens</span></span>
        </a>
        <div className="topbar-center">
          <span className="status-dot" /> Preliminary valuation workspace
        </div>
        <div className="top-actions">
          <button
            className="theme-toggle"
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            title="Toggle dark mode"
          >
            <Moon className="theme-icon theme-icon-moon" size={16} />
            <Sun className="theme-icon theme-icon-sun" size={16} />
          </button>
          <button className="button button-ghost" onClick={() => setShowProjects(true)}>
            <BriefcaseBusiness size={16} /> Projects
            {savedProjects.length ? <b>{savedProjects.length}</b> : null}
          </button>
          <button className="button button-dark" onClick={saveProject}>
            {savedFlash ? <Check size={16} /> : <Save size={16} />}
            {savedFlash ? "Saved" : "Save analysis"}
          </button>
        </div>
      </header>

      <section className="intro" id="top">
        <div>
          <div className="eyebrow"><Sparkles size={14} /> AI-assisted business valuation</div>
          <h1>Price the business.<br /><em>Show the reasoning.</em></h1>
        </div>
        <p>
          Turn owner financials, deal quality, and local market evidence into a
          defensible asking price—without hiding the assumptions.
        </p>
      </section>

      <nav className="stage-nav" aria-label="Valuation steps">
        {stages.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={stage === item.id ? "stage active" : "stage"}
              onClick={() => setStage(item.id)}
            >
              <span className="stage-number">{index + 1}</span>
              <Icon size={16} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="workspace">
        <section className="input-panel">
          <div className="panel-heading">
            <div>
              <span>Step {currentStage + 1} of {stages.length}</span>
              <h2>{stages[currentStage].label}</h2>
            </div>
            <button
              className="text-button"
              onClick={() => {
                setData(demoBusiness);
                setMarketReport(demoSignals);
                setHasLiveResearch(false);
                setShowGrowthCalculator(false);
                setPreviousRevenue("");
                setCurrentRevenue("");
              }}
            >
              <RotateCcw size={14} /> Load demo
            </button>
          </div>

          {stage === "business" ? (
            <div className="form-grid">
              <Field label="Business name" wide>
                <input value={data.name} onChange={(e) => update("name", e.target.value)} />
              </Field>
              <Field label="Industry" wide>
                <select
                  value={data.industry}
                  onChange={(e) => {
                    setData((current) => ({
                      ...current,
                      industry: e.target.value as BusinessData["industry"],
                      matchedIndustry: null,
                    }));
                    setIndustryMatchNote("");
                  }}
                >
                  {Object.entries(industryLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
                </select>
              </Field>
              {data.industry === "other" ? (
                <Field
                  label="Broad industry"
                  hint="Enter a general industry category, not a detailed business description."
                  wide
                >
                  <input
                    value={data.customIndustry ?? ""}
                    placeholder="Enter the closest broad industry category."
                    onChange={(e) => {
                      const customIndustry = e.target.value;
                      setData((current) => ({
                        ...current,
                        customIndustry,
                        matchedIndustry: null,
                      }));
                      setIndustryMatchNote("");
                    }}
                  />
                  <div className="industry-match">
                    <button
                      className="field-action"
                      type="button"
                      disabled={matchingIndustry || !data.customIndustry.trim()}
                      onClick={matchCustomIndustry}
                    >
                      {matchingIndustry ? (
                        <Loader2 className="spin" size={12} />
                      ) : (
                        <Sparkles size={12} />
                      )}
                      {matchingIndustry
                        ? "Finding closest category…"
                        : data.matchedIndustry
                          ? "Match again"
                          : "Find closest category with AI"}
                    </button>
                    {data.matchedIndustry ? (
                      <span className="industry-match-result">
                        Using <strong>{industryLabels[data.matchedIndustry]}</strong>{" "}
                        at {industryBaselines[data.matchedIndustry].toFixed(2)}×
                      </span>
                    ) : null}
                    {industryMatchNote ? <small>{industryMatchNote}</small> : null}
                  </div>
                </Field>
              ) : null}
              <Field label="City">
                <input value={data.city} onChange={(e) => update("city", e.target.value)} />
              </Field>
              <Field label="State">
                <select value={data.state} onChange={(e) => update("state", e.target.value)}>
                  {stateOptions.map(([code, name]) => (
                    <option value={code} key={code}>{name} ({code})</option>
                  ))}
                </select>
              </Field>
            </div>
          ) : null}

          {stage === "financials" ? (
            <div className="form-grid">
              <div className="section-note field-wide">
                <Info size={17} />
                <span><strong>BrokerLens calculates Seller’s Discretionary Earnings (SDE).</strong> Confirm each add-back so the buyer can reproduce the calculation.</span>
              </div>
              <MoneyField label="Net profit" value={data.netProfit} onChange={(value) => numberUpdate("netProfit", value)} />
              <MoneyField label="Owner salary" value={data.ownerSalary} onChange={(value) => numberUpdate("ownerSalary", value)} />
              <MoneyField label="Interest expense" value={data.interest} onChange={(value) => numberUpdate("interest", value)} />
              <MoneyField label="Depreciation & amortization" value={data.depreciation} onChange={(value) => numberUpdate("depreciation", value)} />
              <MoneyField label="Verified one-time add-backs" value={data.oneTimeAddbacks} onChange={(value) => numberUpdate("oneTimeAddbacks", value)} />
              <div className="field">
                <div className="field-heading">
                  <span className="field-label">Annual revenue growth</span>
                  <button
                    className="field-action"
                    type="button"
                    aria-expanded={showGrowthCalculator}
                    onClick={() => setShowGrowthCalculator((open) => !open)}
                  >
                    Calculate
                    <ChevronRight
                      className={showGrowthCalculator ? "toggle-chevron open" : "toggle-chevron"}
                      size={13}
                    />
                  </button>
                </div>
                <PercentInput value={data.growthRate} onChange={(value) => numberUpdate("growthRate", value)} />
                <small>Most recent year over year</small>
              </div>
              {showGrowthCalculator ? (
                <div className="growth-calculator field-wide">
                  <div className="growth-calculator-fields">
                    <MoneyField
                      label="Previous-year revenue"
                      value={previousRevenue}
                      onChange={setPreviousRevenue}
                    />
                    <MoneyField
                      label="Current-year revenue"
                      value={currentRevenue}
                      onChange={setCurrentRevenue}
                    />
                  </div>
                  <div className="growth-calculator-result">
                    <span>
                      <small>Calculated growth</small>
                      <strong>
                        {calculatedGrowth === null
                          ? "Enter both amounts"
                          : `${calculatedGrowth.toFixed(1)}%`}
                      </strong>
                    </span>
                    <button
                      className="button button-dark"
                      type="button"
                      disabled={calculatedGrowth === null}
                      onClick={() => {
                        if (calculatedGrowth === null) return;
                        numberUpdate("growthRate", calculatedGrowth.toFixed(1));
                        setShowGrowthCalculator(false);
                      }}
                    >
                      Use this rate
                    </button>
                  </div>
                </div>
              ) : null}
              <div className="sde-card field-wide">
                <span>Calculated SDE</span>
                <strong>{formatCurrency(result.sde)}</strong>
                <small>Net profit + owner compensation + interest + D&amp;A + verified one-time add-backs</small>
              </div>
            </div>
          ) : null}

          {stage === "quality" ? (
            <div className="form-grid">
              <Field label="Recurring revenue">
                <PercentInput value={data.recurringRevenue} onChange={(value) => numberUpdate("recurringRevenue", value)} />
              </Field>
              <Field label="Owner dependence">
                <select value={data.ownerDependence} onChange={(e) => update("ownerDependence", e.target.value as BusinessData["ownerDependence"])}>
                  <option value="low">Low — team runs operations</option>
                  <option value="medium">Medium — some transfer needed</option>
                  <option value="high">High — owner is essential</option>
                </select>
              </Field>
              <Field label="Largest customer share">
                <PercentInput value={data.largestCustomer} onChange={(value) => numberUpdate("largestCustomer", value)} />
              </Field>
              <Field label="Years remaining on lease">
                <input type="number" min="0" step="0.5" value={data.leaseYears} onChange={(e) => numberUpdate("leaseYears", e.target.value)} />
              </Field>
              <MoneyField label="Inventory included" value={data.inventory} onChange={(value) => numberUpdate("inventory", value)} />
              <MoneyField label="Excess / non-operating assets" value={data.excessAssets} onChange={(value) => numberUpdate("excessAssets", value)} />
              <MoneyField label="Debt assumed by buyer" value={data.debtAssumed} onChange={(value) => numberUpdate("debtAssumed", value)} />
              <div className="risk-preview field-wide">
                <div><ShieldCheck size={19} /><span><strong>{result.adjustments.length} adjustments</strong><small>Applied to the industry starting multiple</small></span></div>
                <span className="multiple-pill">{result.baseMultiple.toFixed(2)}× → {result.adjustedMultiple.toFixed(2)}×</span>
              </div>
            </div>
          ) : null}

          {stage === "market" ? (
            <div className="market-content">
              <section className="research-sources" aria-labelledby="research-sources-title">
                <button
                  className="research-sources-toggle"
                  type="button"
                  aria-expanded={showResearchSources}
                  aria-controls="research-sources-panel"
                  onClick={() => setShowResearchSources((open) => !open)}
                >
                  <span>
                    <small>AI market research</small>
                    <strong id="research-sources-title">
                      Research in local demand, labor, competition &amp; business sales
                    </strong>
                  </span>
                  <span>
                    {researchDomains.length} websites
                    <ChevronRight
                      className={showResearchSources ? "toggle-chevron open" : "toggle-chevron"}
                      size={15}
                    />
                  </span>
                </button>
                {showResearchSources ? (
                  <div className="research-sources-panel" id="research-sources-panel">
                    <p>
                      BrokerLens searches only these approved websites and uses each one for the purpose shown.
                    </p>
                    <div className="source-list">
                      {researchDomains.map((domain) => (
                        <article className="source-card" key={domain}>
                          <Globe2 size={16} />
                          <span>
                            <strong>{domain}</strong>
                            <small>
                              {sourceDescriptions[domain] ??
                                "Additional user-approved research"}
                            </small>
                          </span>
                          <button
                            type="button"
                            aria-label={`Remove ${domain}`}
                            title={`Remove ${domain}`}
                            onClick={() => removeResearchSource(domain)}
                          >
                            <X size={13} />
                          </button>
                        </article>
                      ))}
                    </div>
                    <form
                      className="add-source"
                      onSubmit={(event) => {
                        event.preventDefault();
                        addResearchSource();
                      }}
                    >
                      <input
                        value={newSource}
                        aria-label="Add a research website"
                        placeholder="Add a website, such as example.com"
                        onChange={(event) => {
                          setNewSource(event.target.value);
                          setSourceError("");
                        }}
                      />
                      <button className="button button-ghost" type="submit">
                        <Plus size={14} /> Add source
                      </button>
                    </form>
                    <div className="research-sources-footer">
                      {sourceError ? (
                        <p className="source-error">{sourceError}</p>
                      ) : (
                        <span />
                      )}
                      <button
                        className="text-button"
                        type="button"
                        onClick={() => {
                          update("sourceDomains", defaultResearchDomains.join(", "));
                          setSourceError("");
                        }}
                      >
                        <RotateCcw size={13} /> Restore defaults
                      </button>
                    </div>
                  </div>
                ) : null}
              </section>
              <button className="research-button" onClick={runResearch} disabled={researching}>
                {researching ? <Loader2 className="spin" size={19} /> : <Search size={19} />}
                <span><strong>{researching ? "Researching approved sources…" : "Run AI market research"}</strong><small>Find demand, labor, competition, and transaction signals</small></span>
                <ChevronRight size={18} />
              </button>
              {researchNote ? <p className="research-note"><Info size={14} /> {researchNote}</p> : null}
              {hasLiveResearch ? (
                <div className="research-summary">
                  <Sparkles size={16} />
                  <p>{marketReport.summary}</p>
                </div>
              ) : null}
              <div className="signal-list">
                {marketReport.signals.map((signal) => (
                  <article className="signal-card" key={signal.title}>
                    <div><Landmark size={17} /><strong>{signal.title}</strong></div>
                    <p>{signal.finding}</p>
                    {signal.source ? <span>{signal.source}</span> : null}
                  </article>
                ))}
              </div>
              {marketReport.citations?.length ? (
                <div className="citations">
                  <span>Sources</span>
                  {marketReport.citations.map((citation) => (
                    <a key={citation.url} href={citation.url} target="_blank" rel="noreferrer">{citation.title}</a>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="panel-footer">
            <span>Changes recalculate instantly</span>
            {currentStage < stages.length - 1 ? (
              <button className="button button-copper" onClick={nextStage}>
                Continue to {stages[currentStage + 1].label} <ChevronRight size={16} />
              </button>
            ) : (
              <button className="button button-copper" onClick={saveProject}>
                <Save size={16} /> Save valuation
              </button>
            )}
          </div>
        </section>

        <aside className="result-panel">
          <div className="result-topline">
            <span><span className="live-dot" /> Live valuation</span>
            <span className="confidence">{result.confidence}% confidence</span>
          </div>
          <div className="value-hero">
            <span>Estimated market value</span>
            <strong>{formatCurrency(result.lowValue)} <i>–</i> {formatCurrency(result.highValue)}</strong>
            <small>Preliminary range · asset sale basis</small>
          </div>
          <div className="deal-prices">
            <div>
              <span>Suggested asking price</span>
              <strong>{formatCurrency(result.askingPrice)}</strong>
              <small>Includes negotiation room</small>
            </div>
            <div>
              <span>Likely sale range</span>
              <strong>{formatCurrency(result.likelySaleLow)}–{formatCurrency(result.likelySaleHigh)}</strong>
              <small>Before fees and taxes</small>
            </div>
          </div>

          <div className="valuation-math">
            <div className="result-section-heading">
              <span>Valuation bridge</span>
              <BarChart3 size={17} />
            </div>
            <div className="math-row"><span>Normalized SDE</span><strong>{formatCurrency(result.sde)}</strong></div>
            <div className="math-row">
              <span>{industryLabels[result.valuationIndustry]} starting multiple</span>
              <strong>{result.baseMultiple.toFixed(2)}×</strong>
            </div>
            <div className="math-row accent"><span>Risk-adjusted multiple</span><strong>{result.adjustedMultiple.toFixed(2)}×</strong></div>
            <div className="range-bar" aria-label={`Multiple range ${result.lowMultiple.toFixed(2)} to ${result.highMultiple.toFixed(2)}`}>
              <span style={{ left: "14%" }} />
              <span className="range-mid" style={{ left: "50%" }} />
              <span style={{ left: "86%" }} />
            </div>
            <div className="range-labels"><span>{result.lowMultiple.toFixed(2)}×</span><span>{result.adjustedMultiple.toFixed(2)}×</span><span>{result.highMultiple.toFixed(2)}×</span></div>
          </div>

          <div className="adjustment-list">
            <div className="result-section-heading"><span>Why the multiple moved</span><Info size={16} /></div>
            {result.adjustments.map((item) => (
              <div className="adjustment" key={`${item.label}-${item.value}`}>
                <span className={item.value >= 0 ? "adjustment-icon positive" : "adjustment-icon negative"}>{item.value >= 0 ? "+" : "−"}</span>
                <div><strong>{item.label}</strong><small>{item.explanation}</small></div>
                <b className={item.value >= 0 ? "positive-text" : "negative-text"}>{item.value >= 0 ? "+" : ""}{item.value.toFixed(2)}×</b>
              </div>
            ))}
          </div>

          <div className="disclaimer">
            <Info size={15} />
            <p><strong>Preliminary broker opinion—not a certified appraisal.</strong> Verify add-backs, assets, debt, tax treatment, and comparable sales before marketing the business.</p>
          </div>
        </aside>
      </div>

      <footer>
        <span>BrokerLens MVP</span>
        <span>Transparent inputs · Reproducible math · Source-aware research</span>
      </footer>

      {showProjects ? (
        <div className="modal-backdrop" onMouseDown={() => setShowProjects(false)}>
          <section className="modal" onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-heading">
              <div><span>Browser database</span><h2>Saved projects</h2></div>
              <button className="icon-button" onClick={() => setShowProjects(false)} aria-label="Close projects"><X size={19} /></button>
            </div>
            <p className="modal-copy">Projects stay in this browser. No account or cloud database is required for the MVP.</p>
            {savedProjects.length ? (
              <div className="project-list">
                {savedProjects.map((project) => (
                  <article key={project.id}>
                    <button className="project-main" onClick={() => {
                      setData({
                        ...project.data,
                        matchedIndustry: project.data.matchedIndustry ?? null,
                      });
                      setIndustryMatchNote("");
                      setMarketReport(demoSignals);
                      setHasLiveResearch(false);
                      setShowProjects(false);
                    }}>
                      <span className="project-icon"><BriefcaseBusiness size={18} /></span>
                      <span><strong>{project.name}</strong><small>{industryLabels[project.data.industry]} · {project.data.city}, {project.data.state}</small></span>
                      <b>{formatCurrency(calculateValuation(project.data).midpointValue)}</b>
                    </button>
                    <button className="icon-button delete" onClick={() => deleteProject(project.id)} aria-label={`Delete ${project.name}`}><X size={16} /></button>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-projects"><Plus size={24} /><strong>No saved projects yet</strong><span>Close this panel and save the demo analysis.</span></div>
            )}
          </section>
        </div>
      ) : null}
    </main>
  );
}

function MoneyField({ label, value, onChange }: { label: string; value: number | string; onChange: (value: string) => void }) {
  return (
    <Field label={label}>
      <div className="input-affix"><span>$</span><input type="number" min="0" step="1000" value={value} onChange={(e) => onChange(e.target.value)} /></div>
    </Field>
  );
}

function PercentInput({ value, onChange }: { value: number; onChange: (value: string) => void }) {
  return <div className="input-affix suffix"><input type="number" step="0.1" value={value} onChange={(e) => onChange(e.target.value)} /><span>%</span></div>;
}
