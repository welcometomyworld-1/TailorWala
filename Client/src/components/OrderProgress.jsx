import React from 'react'
import { ORDER_STAGES } from '../data/mockData.js'

/**
 * Amazon-style order tracking progress bar.
 * currentStage: one of ORDER_STAGES[].key
 */
export function OrderProgress({ currentStage = 'placed' }) {
  const currentIndex = ORDER_STAGES.findIndex((s) => s.key === currentStage)
  const activeIndex = currentIndex === -1 ? 0 : currentIndex
  const percent = (activeIndex / (ORDER_STAGES.length - 1)) * 100

  return (
    <div className="w-full py-6">
      <div className="relative">
        <div className="absolute left-0 top-4 h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700" />
        <div
          className="absolute left-0 top-4 h-1.5 rounded-full bg-blue-600 transition-all duration-700"
          style={{ width: `${percent}%` }}
        />
        <div className="relative flex justify-between">
          {ORDER_STAGES.map((stage, i) => {
            const done = i <= activeIndex
            return (
              <div key={stage.key} className="flex flex-col items-center gap-2" style={{ width: `${100 / ORDER_STAGES.length}%` }}>
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-all ${
                    done
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-slate-300 bg-white text-slate-400 dark:bg-slate-800 dark:border-slate-600'
                  }`}
                >
                  {done ? (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <span className={`text-center text-[11px] font-semibold leading-tight ${done ? 'text-blue-600' : 'text-slate-400'}`}>
                  {stage.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
