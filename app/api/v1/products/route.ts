import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/api-auth'

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { userId, admin } = auth
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') // 'published' | 'draft'
  const limit = Math.min(Number(searchParams.get('limit') ?? '20'), 100)
  const page = Math.max(Number(searchParams.get('page') ?? '1'), 1)
  const offset = (page - 1) * limit

  let query = admin
    .from('products')
    .select('*', { count: 'exact' })
    .eq('seller_id', userId)

  if (status === 'published' || status === 'draft') {
    query = query.eq('status', status)
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data, total: count, page, limit })
}

export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { userId, admin } = auth
  const body = await request.json()
  const { title, slug, description, price, currency, status, tags, product_format, conversion_message } = body

  if (!title || !slug || price === undefined) {
    return NextResponse.json({ error: 'title, slug, and price are required' }, { status: 400 })
  }

  const { data, error } = await admin
    .from('products')
    .insert({
      seller_id: userId,
      title,
      slug,
      description: description ?? null,
      price: Number(price),
      currency: currency ?? 'usd',
      status: status ?? 'draft',
      tags: tags ?? [],
      product_format: product_format ?? 'other',
      conversion_message: conversion_message ?? null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data }, { status: 201 })
}
