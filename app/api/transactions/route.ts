import { NextResponse } from 'next/server';

// Utility: Modified Boxplot logic for statistical outlier (fraud) detection
const detectAnomaly = (amount: number, historicalData: number[]) => {
  if (historicalData.length < 4) return false;
  const sorted = [...historicalData].sort((a, b) => a - b);
  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];
  const iqr = q3 - q1;
  // Upper fence for extreme outliers
  const upperFence = q3 + (1.5 * iqr); 
  return amount > upperFence;
};

// Mock historical data for the boxplot baseline
const baselineAmounts = [150, 200, 50, 1200, 300, 80, 450, 220, 100];

export async function GET() {
  // Simulate an incoming UPI transaction
  const amount = Math.floor(Math.random() * 5000) + 10;
  const isSuspicious = detectAnomaly(amount, baselineAmounts);
  
  const transaction = {
    id: `UPI-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
    amount: amount,
    timestamp: new Date().toLocaleTimeString(),
    status: isSuspicious ? 'Flagged' : 'Cleared',
    // Simulate AI insight generation for flagged items
    aiSummary: isSuspicious 
      ? `AI ALERT: Transaction volume of ₹${amount} exceeds historical IQR upper bounds. Potential account takeover.` 
      : null
  };

  return NextResponse.json(transaction);
}