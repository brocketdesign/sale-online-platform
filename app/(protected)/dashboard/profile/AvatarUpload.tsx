'use client'

import { useRef, useState, useTransition } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { updateAvatar } from './actions'
import { Camera, Loader2 } from 'lucide-react'

interface Props {
  currentUrl: string | null
  displayName: string | null
}

export default function AvatarUpload({ currentUrl, displayName }: Props) {
  const [preview, setPreview] = useState<string | null>(currentUrl)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  const initials = (displayName ?? '?').charAt(0).toUpperCase()

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be under 2 MB.')
      return
    }

    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)

    startTransition(async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setError('Not authenticated'); return }

      const ext = file.name.split('.').pop()
      const path = `${user.id}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, contentType: file.type })

      if (uploadError) { setError(uploadError.message); return }

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)

      const result = await updateAvatar(publicUrl)
      if (result.error) setError(result.error)
    })
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="relative group w-24 h-24 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF007A]"
        disabled={isPending}
        aria-label="Upload avatar"
      >
        {preview ? (
          <Image
            src={preview}
            alt="Avatar"
            fill
            className="rounded-full object-cover"
            sizes="96px"
            unoptimized={preview.startsWith('blob:')}
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-[#FF90E8]/30 flex items-center justify-center text-3xl font-black text-[#FF007A]">
            {initials}
          </div>
        )}

        <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          {isPending
            ? <Loader2 className="w-6 h-6 text-white animate-spin" />
            : <Camera className="w-6 h-6 text-white" />
          }
        </div>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleFile}
      />

      <p className="text-xs text-gray-400">Click to upload · max 2 MB</p>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
