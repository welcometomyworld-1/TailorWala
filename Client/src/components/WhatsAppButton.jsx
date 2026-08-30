import React from 'react'
import { MessageCircle } from 'lucide-react'

export function WhatsAppButton({
  phone = '918789682127',
  message = 'Hello, I would like to know more about your tailoring services.',
}) {
  const href = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl shadow-black/25 transition-transform duration-200 hover:scale-110 active:scale-95 group"
    >
      <MessageCircle className="h-7 w-7 text-white fill-white/20" />
      <span className="absolute left-16 bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
        Chat on WhatsApp (+91 8789682127)
      </span>
    </a>
  )
}

