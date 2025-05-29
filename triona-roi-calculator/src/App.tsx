import React, { useState, useEffect } from 'react';
import './App.css';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

const defaultInputs = {
  numTrucks: 8,
  avgRevenue: 145000,
  monthlyMiles: 8000,
  fuelPrice: 3.85,
  mpg: 6.2,
  brokerDependency: 65,
  factoringRate: 3.5,
  backOfficeHours: 25,
};

type Inputs = typeof defaultInputs;

type Results = {
  gpoSavings: number;
  factoringSavings: number;
  efficiencySavings: number;
  loadOptimization: number;
  totalSavings: number;
  trionaMembershipCost: number;
  netSavings: number;
  roiPercentage: number;
  equityValue: number;
  aloneOperatingCost: number;
  utmOperatingCost: number;
  growthOpportunity: number;
  missedBrokerFees: number;
  missedTimeCost: number;
  smallFleetPenalty: number;
};

function calculateResults(inputs: Inputs): Results {
  const {
    numTrucks,
    avgRevenue,
    monthlyMiles,
    fuelPrice,
    mpg,
    brokerDependency,
    factoringRate,
    backOfficeHours,
  } = inputs;
  const annualMiles = monthlyMiles * 12;
  const totalFleetRevenue = numTrucks * avgRevenue;

  // 1. GPO Savings (eliminate small fleet premiums)
  const insuranceCostPerMile = 0.099;
  const maintenanceCostPerMile = 0.202;
  const fuelCostPerMile = 0.55;
  const equipmentCostPerMile = 0.36;
  const insurancePremium = 0.22;
  const fuelPremium = 0.04;
  const maintenancePremium = 0.17;
  const equipmentPremium = 0.12;
  const gpoInsuranceSavings = (insuranceCostPerMile * insurancePremium) * annualMiles * numTrucks;
  const gpoFuelSavings = (fuelCostPerMile * fuelPremium) * annualMiles * numTrucks;
  const gpoMaintenanceSavings = (maintenanceCostPerMile * maintenancePremium) * annualMiles * numTrucks;
  const gpoEquipmentSavings = (equipmentCostPerMile * equipmentPremium) * annualMiles * numTrucks;
  const gpoSavings = gpoInsuranceSavings + gpoFuelSavings + gpoMaintenanceSavings + gpoEquipmentSavings;

  // 2. Factoring Reduction (reduce from 70% to 40%)
  const currentFactoredRevenue = totalFleetRevenue * 0.70;
  const newFactoredRevenue = totalFleetRevenue * 0.40;
  const factoringReduction = currentFactoredRevenue - newFactoredRevenue;
  const factoringSavings = factoringReduction * (factoringRate / 100);

  // 3. Time Savings (15 hours/week × $65/hour)
  const ownerHourlyValue = 65;
  const hoursReduction = backOfficeHours * 0.60;
  const weeklyTimeSavings = hoursReduction * ownerHourlyValue;
  const efficiencySavings = weeklyTimeSavings * 52;

  // 4. Load Optimization ($0.08/mile improvement)
  const loadOptimizationPerMile = 0.08;
  const loadOptimization = loadOptimizationPerMile * annualMiles * numTrucks;

  // Total operational savings (no equity, no double counting)
  const totalSavings = gpoSavings + factoringSavings + efficiencySavings + loadOptimization;

  // Membership cost
  const trionaMembershipCost = totalFleetRevenue * 0.02;
  const netSavings = totalSavings - trionaMembershipCost;
  const roiPercentage = trionaMembershipCost > 0 ? (netSavings / trionaMembershipCost) * 100 : 0;

  // Future Equity Value (separate, not included in savings)
  let initialEquityPercent = 0;
  if (numTrucks <= 5) initialEquityPercent = 0.001;
  else if (numTrucks <= 10) initialEquityPercent = 0.002;
  else if (numTrucks <= 20) initialEquityPercent = 0.004;
  else initialEquityPercent = 0.006;
  const performanceEquityPercent = initialEquityPercent * 3;
  const totalEquityPercent = (initialEquityPercent + performanceEquityPercent) / 100;
  const projectedValuation2032 = 5000000000;
  const equityValue = projectedValuation2032 * totalEquityPercent / 7; // annualized

  // Cost comparison
  const atriCostPerMile = 2.27;
  const currentOperatingCostPerTruck = atriCostPerMile * annualMiles / numTrucks;
  const utmOperatingCostPerTruck = currentOperatingCostPerTruck - (netSavings / numTrucks);

  // Cost of Missing Out
  const growthOpportunity = totalFleetRevenue * 0.25;
  const missedBrokerFees = totalFleetRevenue * (brokerDependency / 100) * 0.15;
  const missedTimeCost = backOfficeHours * 52 * ownerHourlyValue;
  const smallFleetPenalty = gpoSavings;

  return {
    gpoSavings,
    factoringSavings,
    efficiencySavings,
    loadOptimization,
    totalSavings,
    trionaMembershipCost,
    netSavings,
    roiPercentage,
    equityValue,
    aloneOperatingCost: currentOperatingCostPerTruck,
    utmOperatingCost: utmOperatingCostPerTruck,
    growthOpportunity,
    missedBrokerFees,
    missedTimeCost,
    smallFleetPenalty,
  };
}

const inputLabels: { [K in keyof Inputs]: string } = {
  numTrucks: 'Number of Trucks',
  avgRevenue: 'Average Annual Revenue per Truck',
  monthlyMiles: 'Average Monthly Revenue Miles per Truck',
  fuelPrice: 'Current Diesel Price per Gallon',
  mpg: 'Average Miles per Gallon',
  brokerDependency: 'Broker Load Dependency %',
  factoringRate: 'Factoring Rate %',
  backOfficeHours: 'Weekly Hours on Back Office Tasks',
};

const inputProps: { [K in keyof Inputs]?: any } = {
  numTrucks: { min: 1, max: 100 },
  avgRevenue: { min: 50000, max: 300000, step: 1000 },
  monthlyMiles: { min: 4000, max: 12000, step: 100 },
  fuelPrice: { min: 2.0, max: 6.0, step: 0.01 },
  mpg: { min: 4.0, max: 8.0, step: 0.1 },
  brokerDependency: { min: 0, max: 100 },
  factoringRate: { min: 1.0, max: 8.0, step: 0.1 },
  backOfficeHours: { min: 10, max: 60 },
};

const App: React.FC = () => {
  const [inputs, setInputs] = useState<Inputs>(defaultInputs);
  const [results, setResults] = useState<Results>(() => calculateResults(defaultInputs));

  useEffect(() => {
    setResults(calculateResults(inputs));
  }, [inputs]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setInputs((prev) => ({ ...prev, [id]: value === '' ? '' : Number(value) }));
  };

  return (
    <div className="container">
      <h1>Triona UTM ROI Calculator</h1>
      <div className="flex">
        <div className="inputs">
          {Object.entries(inputLabels).map(([key, label]) => (
            <div key={key} style={{ marginBottom: 18 }}>
              <label htmlFor={key}>{label}</label>
              <input
                id={key}
                type="number"
                value={inputs[key as keyof Inputs]}
                onChange={handleInputChange}
                {...inputProps[key as keyof Inputs]}
              />
            </div>
          ))}
        </div>
        <div className="results">
          <div className="result-block">Group Purchasing Power (GPO): <span>{formatCurrency(results.gpoSavings)}</span></div>
          <div className="result-block">Factoring Reduction: <span>{formatCurrency(results.factoringSavings)}</span></div>
          <div className="result-block">Time Savings: <span>{formatCurrency(results.efficiencySavings)}</span></div>
          <div className="result-block">Load Optimization: <span>{formatCurrency(results.loadOptimization)}</span></div>
          <div className="summary">
            <div>Total Operational Savings: <span>{formatCurrency(results.totalSavings)}</span></div>
            <div>Membership Cost: <span>{formatCurrency(results.trionaMembershipCost)}</span></div>
            <div>Net Annual Savings: <span>{formatCurrency(results.netSavings)}</span></div>
            <div>ROI: <span>{results.roiPercentage.toFixed(0)}%</span></div>
          </div>
          <div className="future-value">
            <div>Future Equity Value (not included in savings): <span>{formatCurrency(results.equityValue)}</span></div>
          </div>
          <div className="cost-comparison">
            <div className="cost-card small-fleet-cost">
              <h4>Operating Alone</h4>
              <div className="cost-value">{formatCurrency(results.aloneOperatingCost)}</div>
              <div>per truck annually</div>
            </div>
            <div className="cost-card utm-fleet-cost">
              <h4>With Triona UTM</h4>
              <div className="cost-value">{formatCurrency(results.utmOperatingCost)}</div>
              <div>per truck annually</div>
            </div>
          </div>
          <div className="summary" style={{ background: '#f4f6fb', color: '#2a5298', marginTop: 24 }}>
            <div style={{ fontWeight: 'bold' }}>Cost of Missing Out</div>
            <div>Growth Opportunity (25% YOY): <span>{formatCurrency(results.growthOpportunity)}</span></div>
            <div>Broker Fees (15%): <span>{formatCurrency(results.missedBrokerFees)}</span></div>
            <div>Time Cost: <span>{formatCurrency(results.missedTimeCost)}</span></div>
            <div>Small Fleet Penalty: <span>{formatCurrency(results.smallFleetPenalty)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
