"use client";

import { GitMerge, BrainCircuit, GitPullRequestDraft, ArrowRightLeft } from "lucide-react";

export function AstConflictTelepathyTool() {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-3">
          <BrainCircuit className="w-8 h-8 text-primary" /> AST Conflict Telepathy
        </h2>
        <p className="text-muted max-w-2xl mx-auto">
          Resolve Git conflicts by parsing Abstract Syntax Trees instead of raw text. 
          Understand developer intent and automatically merge logic without breaking syntax.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 h-[500px]">
        <div className="card bg-bg border-danger/30 p-0 flex flex-col overflow-hidden">
          <div className="bg-danger/10 p-3 border-b border-danger/20 font-semibold text-danger text-sm flex items-center gap-2">
            <GitPullRequestDraft className="w-4 h-4" /> Feature Branch (Yours)
          </div>
          <div className="p-4 font-mono text-xs text-fg flex-1 overflow-auto">
            <pre className="text-danger">
{`function calculateTotal(items) {
  // Added discount logic
  const discount = 0.9;
  return items.reduce((a, b) => a + b.price, 0) * discount;
}`}
            </pre>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center p-4">
          <div className="bg-card border border-primary/50 shadow-[0_0_30px_rgba(59,130,246,0.2)] rounded-2xl p-6 text-center">
            <BrainCircuit className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
            <h3 className="font-bold mb-2">AST Semantic Merge</h3>
            <p className="text-xs text-muted mb-4">Parsing intent. Resolving AST node collisions...</p>
            <button className="btn btn-primary w-full gap-2 text-xs">
              <GitMerge className="w-4 h-4" /> Merge Logic
            </button>
          </div>
        </div>

        <div className="card bg-bg border-success/30 p-0 flex flex-col overflow-hidden">
          <div className="bg-success/10 p-3 border-b border-success/20 font-semibold text-success text-sm flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4" /> Main Branch (Theirs)
          </div>
          <div className="p-4 font-mono text-xs text-fg flex-1 overflow-auto">
            <pre className="text-success">
{`function calculateTotal(items) {
  // Added tax logic
  const tax = 1.2;
  return items.reduce((a, b) => a + b.price, 0) * tax;
}`}
            </pre>
          </div>
        </div>
      </div>

      <div className="card border-primary/30 bg-primary/5 mt-6">
        <div className="p-4 border-b border-line font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-success" /> AI AST Merged Result
        </div>
        <div className="p-4 font-mono text-sm text-fg">
          <pre>
{`function calculateTotal(items) {
  // Merged: Added discount and tax logic
  const discount = 0.9;
  const tax = 1.2;
  return items.reduce((a, b) => a + b.price, 0) * discount * tax;
}`}
          </pre>
        </div>
      </div>
    </div>
  );
}

function CheckCircle(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
}
