import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

interface Params {
  params: Promise<{ purchaseId: string }>
}

export async function GET(_request: Request, { params }: Params) {
  const { purchaseId } = await params

  // Verify caller is authenticated
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  type PurchaseFetched = {
    id: string
    buyer_id: string | null
    buyer_email: string
    product: {
      id: string
      seller_id: string
      product_files: Array<{ id: string; file_name: string; file_url: string }>
    } | null
  }

  const serviceClient = createServiceClient()
  const { data: purchaseRaw } = await serviceClient
    .from('purchases')
    .select(`
      id,
      buyer_id,
      buyer_email,
      product:products (
        id,
        seller_id,
        product_files (
          id,
          file_name,
          file_url
        )
      )
    `)
    .eq('id', purchaseId)
    .maybeSingle()

  const purchase = purchaseRaw as unknown as PurchaseFetched | null

  if (!purchase) {
    return NextResponse.json({ error: 'Purchase not found' }, { status: 404 })
  }

  const product = purchase.product
  const isBuyer = purchase.buyer_id === user.id || purchase.buyer_email === user.email
  const isSeller = product?.seller_id === user.id

  if (!isBuyer && !isSeller) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const files = product?.product_files ?? []
  if (files.length === 0) {
    return NextResponse.json({ error: 'No files attached to this product' }, { status: 404 })
  }

  // Generate signed URL for inline viewing (no download disposition)
  const { data: signedData, error } = await serviceClient.storage
    .from('product-files')
    .createSignedUrl(files[0].file_url, 3600)

  if (error || !signedData) {
    return NextResponse.json({ error: 'Could not generate view link' }, { status: 500 })
  }

  return NextResponse.json({ url: signedData.signedUrl })
}
