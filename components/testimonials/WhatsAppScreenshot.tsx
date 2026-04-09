'use client'

import Image from 'next/image'

export interface Reaction {
  emoji: string
  count: number
}

export interface ChatTestimonial {
  id: string
  sender_name: string
  sender_avatar_url: string | null
  message: string
  display_time: string
  display_date: string
  reactions: Reaction[]
  likes_count: number
  background_url: string | null
  chat_bg_color: string
}

interface Props {
  testimonial: ChatTestimonial
  /** Scale factor — useful for thumbnails */
  scale?: number
}

/** Pixel-accurate WhatsApp-style chat screenshot */
export default function WhatsAppScreenshot({ testimonial, scale = 1 }: Props) {
  const {
    sender_name,
    sender_avatar_url,
    message,
    display_time,
    display_date,
    reactions,
    background_url,
    chat_bg_color,
  } = testimonial

  const initials = sender_name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div
      className="relative overflow-hidden rounded-[28px] shadow-2xl select-none"
      style={{
        width: 320 * scale,
        fontFamily:
          '-apple-system, "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: scale !== 1 ? 'top left' : undefined,
      }}
    >
      {/* ── Phone chrome ── */}
      <div className="bg-[#111] w-full" style={{ borderRadius: '28px 28px 0 0' }}>
        {/* Status bar */}
        <div className="flex items-center justify-between px-5 pt-3 pb-1 text-white">
          <span className="text-[13px] font-semibold tracking-tight">{display_time}</span>
          <div className="flex items-center gap-1.5">
            {/* Signal bars */}
            <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
              <rect x="0"  y="8" width="3" height="4" rx="0.8" fill="white"/>
              <rect x="4.5"  y="5.5" width="3" height="6.5" rx="0.8" fill="white"/>
              <rect x="9"  y="3" width="3" height="9" rx="0.8" fill="white"/>
              <rect x="13.5" y="0" width="3" height="12" rx="0.8" fill="white" fillOpacity="0.35"/>
            </svg>
            {/* WiFi */}
            <svg width="16" height="12" viewBox="0 0 16 12" fill="white">
              <path d="M8 9.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3z"/>
              <path d="M3.515 6.515a6.5 6.5 0 018.97 0" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
              <path d="M1 4a10 10 0 0114 0" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeOpacity="0.5"/>
            </svg>
            {/* Battery */}
            <div className="flex items-center gap-0.5">
              <div className="w-[22px] h-[11px] rounded-[3px] border-[1.5px] border-white relative flex items-center px-[1px]">
                <div className="h-[5px] bg-white rounded-[1.5px]" style={{ width: '70%' }} />
              </div>
              <div className="w-[2px] h-[5px] bg-white rounded-r-sm opacity-60" />
            </div>
          </div>
        </div>

        {/* WhatsApp header */}
        <div className="flex items-center px-3 pb-3 pt-1 bg-[#1f1f1f]">
          {/* Back arrow */}
          <svg className="w-5 h-5 text-[#25d366] mr-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>

          {/* Avatar */}
          <div className="relative flex-shrink-0 w-9 h-9 rounded-full overflow-hidden bg-[#2a2a2a] mr-3">
            {sender_avatar_url ? (
              <Image src={sender_avatar_url} alt={sender_name} fill className="object-cover" sizes="36px" unoptimized />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold bg-[#25d366]">
                {initials}
              </div>
            )}
          </div>

          {/* Name + online status */}
          <div className="flex-1 min-w-0">
            <div className="text-white font-semibold text-[14px] truncate">{sender_name}</div>
            <div className="text-[#25d366] text-[11px]">online</div>
          </div>

          {/* Action icons */}
          <div className="flex items-center gap-4 ml-2">
            <svg className="w-5 h-5 text-[#aaa]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.172 3.514a1 1 0 01-.23 1.052L8.78 9.64a16.015 16.015 0 006.586 6.586l1.39-1.39a1 1 0 011.052-.23l3.514 1.172a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
            </svg>
            <svg className="w-5 h-5 text-[#aaa]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
            </svg>
          </div>
        </div>
      </div>

      {/* ── Chat area ── */}
      <div
        className="relative px-3 py-3 min-h-[180px]"
        style={{
          background: background_url
            ? `url(${background_url}) center/cover no-repeat`
            : chat_bg_color,
        }}
      >
        {/* Semi-transparent overlay when background image is set */}
        {background_url && (
          <div className="absolute inset-0 bg-black/10 pointer-events-none" />
        )}

        {/* Date pill */}
        <div className="relative z-10 flex justify-center mb-3">
          <span className="bg-white/80 backdrop-blur-sm text-[#54656f] text-[11px] font-medium px-3 py-0.5 rounded-full shadow-sm">
            {display_date}
          </span>
        </div>

        {/* Message bubble (incoming — left side) */}
        <div className="relative z-10 flex items-end gap-2 max-w-[85%]">
          {/* Avatar beside bubble */}
          <div className="relative flex-shrink-0 w-7 h-7 rounded-full overflow-hidden bg-[#ccc] self-end mb-1">
            {sender_avatar_url ? (
              <Image src={sender_avatar_url} alt={sender_name} fill className="object-cover" sizes="28px" unoptimized />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-[10px] font-bold bg-[#25d366]">
                {initials}
              </div>
            )}
          </div>

          <div className="relative">
            {/* Bubble tail */}
            <div
              className="absolute -left-[6px] top-0 w-0 h-0"
              style={{
                borderTop: '8px solid white',
                borderLeft: '7px solid transparent',
              }}
            />
            {/* Bubble body */}
            <div className="bg-white rounded-[14px] rounded-tl-[2px] px-3 py-[6px] shadow-sm">
              <p className="text-[#111] text-[13.5px] leading-[1.45] whitespace-pre-wrap break-words max-w-[210px]">
                {message}
              </p>
              {/* Time + checkmarks */}
              <div className="flex items-center justify-end gap-1 mt-0.5">
                <span className="text-[#8696a0] text-[11px]">{display_time}</span>
                {/* Double blue tick */}
                <svg width="16" height="11" viewBox="0 0 16 11" fill="none">
                  <path d="M1 6l3 3 5-7" stroke="#53bdeb" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M5 9L11 1" stroke="#53bdeb" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 9l3-3" stroke="#53bdeb" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            {/* Reactions strip */}
            {reactions.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {reactions.map((r, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-0.5 bg-white/90 backdrop-blur-sm rounded-full px-1.5 py-0.5 text-[12px] shadow-sm border border-gray-100"
                  >
                    <span>{r.emoji}</span>
                    {r.count > 1 && (
                      <span className="text-[10px] text-[#54656f] font-medium">{r.count}</span>
                    )}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom input bar ── */}
      <div className="bg-[#f0f2f5] px-3 py-2 flex items-center gap-2" style={{ borderRadius: '0 0 28px 28px' }}>
        <div className="flex-1 bg-white rounded-full px-4 py-1.5 flex items-center gap-2 shadow-sm">
          <svg className="w-4 h-4 text-[#54656f]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
          </svg>
          <span className="text-[#8696a0] text-[13px] flex-1">Message</span>
          <svg className="w-4 h-4 text-[#54656f]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 15a3 3 0 100-6 3 3 0 000 6z M19.94 11A8.994 8.994 0 0013 4.06V2h-2v2.06A8.994 8.994 0 004.06 11H2v2h2.06A8.994 8.994 0 0011 19.94V22h2v-2.06A8.994 8.994 0 0019.94 13H22v-2h-2.06z"/>
          </svg>
        </div>
        <div className="w-9 h-9 rounded-full bg-[#25d366] flex items-center justify-center shadow flex-shrink-0">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </div>
      </div>
    </div>
  )
}
