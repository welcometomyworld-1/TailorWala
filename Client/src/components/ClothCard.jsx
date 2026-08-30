import React from 'react'
import { Link } from 'react-router-dom'

export function ClothCard({ cloth }) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:shadow-xl">
      <div className="aspect-[4/5] overflow-hidden">
        <img
          src={cloth.image}
          alt={cloth.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-4 left-4">
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900 backdrop-blur-sm shadow-sm">
            {cloth.category}
          </span>
        </div>
      </div>
      
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{cloth.name}</h3>
          <div className="flex items-center text-amber-500">
            <span className="text-sm font-medium">{cloth.rating}</span>
            <svg className="ml-1 h-4 w-4 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        </div>
        
        <p className="mb-4 text-sm text-slate-600 line-clamp-2">{cloth.description}</p>
        
        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-slate-500">Starting from</span>
            <span className="text-xl font-bold text-blue-600">₹{cloth.pricePerMeter}/m</span>
          </div>
          <Link
            to={`/cloth/${cloth._id}`}
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  )
}
