"use client";

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, ShieldCheck, Activity, Lock, Download, Server } from 'lucide-react';

interface Transaction {
  id: string;
  amount: number;
  timestamp: string;
  status: string;
  aiSummary: string | null;
}

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLive, setIsLive] = useState(true);

  // Real-time polling simulation
  useEffect(() => {
    if (!isLive) return;
    
    const fetchTransaction = async () => {
      try {
        const res = await fetch('/api/transactions');
        const newTx = await res.json();
        
        setTransactions(prev => {
          const updated = [...prev, newTx];
          return updated.length > 20 ? updated.slice(1) : updated;
        });
      } catch (err) {
        console.error("Failed to fetch transaction stream:", err);
      }
    };

    const interval = setInterval(fetchTransaction, 2500);
    return () => clearInterval(interval);
  }, [isLive]);

  // CSV Export Logic
  const exportLogs = () => {
    if (transactions.length === 0) return alert("No logs to export yet.");

    const headers = ["Transaction ID", "Amount (INR)", "Timestamp", "Status", "AI Summary"];
    const csvRows = [headers.join(",")];

    transactions.forEach(tx => {
      const row = [
        tx.id,
        tx.amount,
        tx.timestamp,
        tx.status,
        `"${tx.aiSummary || 'Verified by baseline'}"`
      ];
      csvRows.push(row.join(","));
    });

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = `Fraud_Audit_Namunesswaran_Siva_Perumal_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const flaggedCount = transactions.filter(t => t.status === 'Flagged').length;

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-200 font-sans p-4 md:p-8 selection:bg-indigo-500/30">
      
      {/* Top Navigation Bar */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-slate-900/50 backdrop-blur-md p-5 rounded-2xl border border-slate-800 shadow-2xl">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
              <Lock className="h-6 w-6 text-indigo-400" />
            </div>
            Sentinel API Gateway
          </h1>
          <div className="flex items-center gap-3 mt-2 text-sm text-slate-400">
            <span className="flex items-center gap-1.5">
              <Server className="h-4 w-4" /> Endpoint: /api/transactions
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* Identity Badge */}
          <span className="hidden lg:flex items-center text-xs font-medium bg-slate-950 text-slate-300 px-4 py-2 rounded-full border border-slate-800 shadow-inner">
            <span className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
            Analyst: Namunesswaran Siva Perumal
          </span>

          <button 
            onClick={exportLogs}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg font-medium transition-all text-sm shadow-sm"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>

          <button 
            onClick={() => setIsLive(!isLive)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all text-sm border shadow-sm ${
              isLive 
                ? 'bg-indigo-600 hover:bg-indigo-500 border-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]' 
                : 'bg-red-950/50 text-red-400 border-red-900/50 hover:bg-red-900/50'
            }`}
          >
            {isLive ? 'Live Stream Active' : 'Stream Paused'}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Stats & Charts */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl"></div>
              <div className="flex items-center gap-3 text-slate-400 mb-2">
                <Activity className="h-5 w-5 text-blue-400" />
                <h3 className="font-semibold tracking-wide text-sm uppercase">Scanned Volume</h3>
              </div>
              <p className="text-4xl font-bold text-white">{transactions.length}</p>
            </div>
            
            <div className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl"></div>
              <div className="flex items-center gap-3 text-slate-400 mb-2">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <h3 className="font-semibold tracking-wide text-sm uppercase">Threats Detected</h3>
              </div>
              <p className="text-4xl font-bold text-red-400">{flaggedCount}</p>
            </div>
          </div>

          {/* Visualization Card */}
          <div className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-800 shadow-xl h-96">
            <h3 className="font-semibold text-slate-300 mb-6 flex items-center gap-2">
              <Activity className="h-4 w-4" /> Network Velocity & Amplitude
            </h3>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={transactions}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="timestamp" stroke="#64748b" fontSize={11} tickMargin={10} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(value) => `₹${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '12px' }}
                  itemStyle={{ color: '#818cf8' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  dot={{ r: 0 }}
                  activeDot={{ r: 6, fill: '#818cf8', strokeWidth: 0, shadowBlur: 10 }}
                  animationDuration={300}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column: AI Alerts Feed */}
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800 shadow-xl p-6 h-[calc(100vh-14rem)] flex flex-col">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
            <h3 className="font-semibold text-slate-300">Live Incident Log</h3>
            <span className="text-xs text-slate-500 font-mono">Real-time</span>
          </div>
          
          <div className="overflow-y-auto pr-2 space-y-4 custom-scrollbar flex-1">
            {transactions.slice().reverse().map((tx, index) => (
              <div 
                key={`${tx.id}-${index}`} 
                className={`p-4 rounded-xl border transition-all duration-300 hover:-translate-y-1 ${
                  tx.status === 'Flagged' 
                    ? 'bg-red-950/20 border-red-900/50 shadow-[0_4px_20px_rgba(220,38,38,0.05)]' 
                    : 'bg-slate-950/50 border-slate-800/50'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="font-mono text-xs text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                    {tx.id}
                  </span>
                  <span className="text-xs text-slate-500">{tx.timestamp}</span>
                </div>
                
                <div className={`text-xl font-bold mb-3 ${tx.status === 'Flagged' ? 'text-red-400' : 'text-slate-200'}`}>
                  ₹{tx.amount.toLocaleString()}
                </div>
                
                {tx.status === 'Flagged' ? (
                  <div className="p-3 bg-red-950/40 rounded-lg border border-red-900/50 text-sm text-red-200 flex gap-3">
                    <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-red-400" />
                    <p className="leading-relaxed">{tx.aiSummary}</p>
                  </div>
                ) : (
                  <div className="text-sm text-emerald-400/80 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    Cleared by baseline heuristic
                  </div>
                )}
              </div>
            ))}
            
            {transactions.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
                <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                <p className="text-sm">Awaiting stream packets...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}