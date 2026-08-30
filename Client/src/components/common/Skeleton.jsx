import React from 'react'

export const Skeleton = ({ className = '', variant = 'rect' }) => {
  const baseClasses = 'animate-pulse bg-slate-200 dark:bg-slate-800'
  const variantClasses =
    variant === 'circle'
      ? 'rounded-full'
      : variant === 'text'
      ? 'rounded h-4 my-1'
      : 'rounded-xl'

  return <div className={`${baseClasses} ${variantClasses} ${className}`} />
}

export const TailorCardSkeleton = () => (
  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
    <Skeleton className="aspect-[4/3] w-full" />
    <div className="flex items-center gap-3">
      <Skeleton variant="circle" className="h-12 w-12 shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" className="w-3/4 h-5" />
        <Skeleton variant="text" className="w-1/2 h-3" />
      </div>
    </div>
    <div className="flex justify-between items-center pt-2">
      <Skeleton variant="text" className="w-1/3 h-4" />
      <Skeleton className="w-24 h-9 rounded-lg" />
    </div>
  </div>
)

export default Skeleton
