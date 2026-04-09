import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface Params { params: Promise<{ id: string }> }

// PATCH /api/testimonials/[id]
export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()

  // Only allow updating own testimonials
  const { data, error } = await supabase
    .from('chat_testimonials')
    .update(body)
    .eq('id', id)
    .eq('seller_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}

// DELETE /api/testimonials/[id]
export async function DELETE(request: Request, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase
    .from('chat_testimonials')
    .delete()
    .eq('id', id)
    .eq('seller_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
