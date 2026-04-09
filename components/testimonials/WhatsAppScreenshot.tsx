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
  /** Unused — kept for API compatibility */
  sellerName?: string
  /** Unused — kept for API compatibility */
  sellerAvatarUrl?: string | null
}

/** Simplified verified-review card: emojis → message bar → avatar + name */
export default function WhatsAppScreenshot({ testimonial, scale = 1 }: Props) {
  const {
    sender_name,
    sender_avatar_url,
    message,
    display_time,
    display_date,
    reactions,
  } = testimonial

  const initials = sender_name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 shadow-sm select-none overflow-hidden"
      style={{
        width: 320 * scale,
        fontFamily:
          '-apple-system, "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: scale !== 1 ? 'top left' : undefined,
      }}
    >
      <div className="p-5">
        {/* Message bar */}
        <div className="bg-gray-50 rounded-xl px-4 py-3 mb-4">
          <p className="text-[13.5px] text-gray-800 leading-relaxed whitespace-pre-wrap break-words">
            {message}
          </p>
        </div>

        {/* Avatar + sender info */}
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0 w-9 h-9 rounded-full overflow-hidden">
            {sender_avatar_url ? (
              <Image
                src={sender_avatar_url}
                alt={sender_name}
                fill
                className="object-cover"
                sizes="36px"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold bg-[#25d366]">
                {initials}
              </div>
            )}
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">{sender_name}</div>
            <div className="text-xs text-gray-400">{display_date} · {display_time}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
