import React from 'react'
import {
  Home,
  Store,
  Scissors,
  Ruler,
  Zap,
  Truck,
  Shirt,
  Sparkles,
  CheckCircle2,
  Clock,
  Package,
  ShieldCheck,
} from 'lucide-react'

export const WORK_CONDITIONS_CONFIG = [
  {
    key: 'homeVisitAvailable',
    label: 'Home Visit Available',
    description: 'Expert master tailor visits your doorstep for measurement & trials.',
    icon: Home,
    colorClass: 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300',
  },
  {
    key: 'shopVisitAvailable',
    label: 'Studio Visit Available',
    description: 'Visit the bespoke studio for personal fittings and consultations.',
    icon: Store,
    colorClass: 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-300',
  },
  {
    key: 'customMeasurements',
    label: 'Custom Measurements',
    description: 'Precision body profile saving for lifelong bespoke fits.',
    icon: Ruler,
    colorClass: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300',
  },
  {
    key: 'customStitching',
    label: 'Custom Stitching',
    description: 'Handcrafted artisan stitching with canvas reinforcement.',
    icon: Scissors,
    colorClass: 'text-indigo-600 bg-indigo-50 border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-300',
  },
  {
    key: 'expressDelivery',
    label: 'Express 48h Delivery',
    description: 'Priority stitching turnaround available for urgent events.',
    icon: Zap,
    colorClass: 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-950/40 dark:border-orange-800 dark:text-orange-300',
  },
  {
    key: 'normalDelivery',
    label: 'Standard Doorstep Delivery',
    description: 'Complimentary safe delivery with sanitized garment packaging.',
    icon: Truck,
    colorClass: 'text-sky-600 bg-sky-50 border-sky-200 dark:bg-sky-950/40 dark:border-sky-800 dark:text-sky-300',
  },
  {
    key: 'alterationAvailable',
    label: 'Free Fitting Alterations',
    description: 'Free alteration guarantee until your outfit fits 100% perfectly.',
    icon: Sparkles,
    colorClass: 'text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-950/40 dark:border-purple-800 dark:text-purple-300',
  },
  {
    key: 'fabricProvided',
    label: 'Premium Fabrics Available',
    description: 'Italian wool, Mulberry silk, Giza cotton directly available.',
    icon: Shirt,
    colorClass: 'text-teal-600 bg-teal-50 border-teal-200 dark:bg-teal-950/40 dark:border-teal-800 dark:text-teal-300',
  },
  {
    key: 'customerFabricAccepted',
    label: 'Your Fabric Accepted',
    description: 'Provide your own cloth/material for bespoke custom tailoring.',
    icon: Package,
    colorClass: 'text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300',
  },
  {
    key: 'pickupAvailable',
    label: 'Cloth Pickup From Home',
    description: 'Delivery associate picks up your fabric from your home.',
    icon: Clock,
    colorClass: 'text-cyan-600 bg-cyan-50 border-cyan-200 dark:bg-cyan-950/40 dark:border-cyan-800 dark:text-cyan-300',
  },
  {
    key: 'deliveryAvailable',
    label: 'Pan-India Insured Transit',
    description: 'Tracked & insured doorstep transit with live order updates.',
    icon: ShieldCheck,
    colorClass: 'text-lime-600 bg-lime-50 border-lime-200 dark:bg-lime-950/40 dark:border-lime-800 dark:text-lime-300',
  },
]

export function WorkConditionBadge({ conditionKey }) {
  const item = WORK_CONDITIONS_CONFIG.find((c) => c.key === conditionKey)
  if (!item) return null
  const Icon = item.icon

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold shadow-sm transition-all hover:scale-105 ${item.colorClass}`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{item.label}</span>
    </span>
  )
}

export function WorkConditionCard({ condition, active = true }) {
  const Icon = condition.icon

  return (
    <div
      className={`relative flex flex-col p-4 rounded-2xl border transition-all duration-200 hover:shadow-md ${
        active
          ? 'bg-white border-slate-200 shadow-sm dark:bg-slate-800/90 dark:border-slate-700'
          : 'bg-slate-50/60 border-slate-200/50 opacity-60 dark:bg-slate-900/40 dark:border-slate-800'
      }`}
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className={`p-2.5 rounded-xl border ${condition.colorClass}`}>
          <Icon className="w-5 h-5" />
        </div>
        {active && (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Active
          </span>
        )}
      </div>
      <h4 className="font-bold text-slate-900 text-sm dark:text-white">{condition.label}</h4>
      <p className="mt-1 text-xs text-slate-500 line-clamp-2 dark:text-slate-400">
        {condition.description}
      </p>
    </div>
  )
}

export function WorkConditionsGrid({ workConditions = {} }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
      {WORK_CONDITIONS_CONFIG.map((condition) => {
        const isActive = workConditions[condition.key] !== false
        return <WorkConditionCard key={condition.key} condition={condition} active={isActive} />
      })}
    </div>
  )
}

export default WorkConditionCard
