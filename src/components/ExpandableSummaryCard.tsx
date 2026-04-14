"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { ChevronDown } from "lucide-react";

interface ExpandableSummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  colorClass: string;
  details: React.ReactNode;
}

export default function ExpandableSummaryCard({
  title,
  value,
  subtitle,
  icon,
  colorClass,
  details,
}: ExpandableSummaryCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300">
      <div 
        className="p-5 cursor-pointer hover:bg-gray-50 flex items-start justify-between group"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4">
          <div className={clsx("w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-inner", colorClass)}>
            {icon}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
              {subtitle && <span className="text-xs font-semibold text-green-500 bg-green-100 px-2 py-0.5 rounded-full">{subtitle}</span>}
            </div>
          </div>
        </div>
        <div className="mt-2 text-gray-400 group-hover:text-blue-500 transition-colors">
          <ChevronDown className={clsx("w-5 h-5 transition-transform duration-300", expanded && "rotate-180")} />
        </div>
      </div>
      
      {/* Expanded Content with Animation */}
      <div 
        className={clsx(
          "bg-slate-50/50 border-t border-gray-100 transition-all duration-500 overflow-hidden",
          expanded ? "max-h-[500px] opacity-100 p-5" : "max-h-0 opacity-0 px-5 py-0"
        )}
      >
        {details}
      </div>
    </div>
  );
}
