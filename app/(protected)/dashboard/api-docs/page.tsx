'use client'

import { useState } from 'react'
import { Copy, CheckCircle2, BookOpen, Key } from 'lucide-react'
import Link from 'next/link'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://your-domain.com'

const API_MARKDOWN = `# API Reference

Base URL: \`${BASE_URL}/api/v1\`

## Authentication

All endpoints accept two forms of authentication:

**API Key (external access)**
Include your API key in the \`Authorization\` header:
\`\`\`
Authorization: Bearer sp_your_api_key_here
\`\`\`

**Session cookie (in-app access)**
If the request is made from within the app (e.g. by an agent running in the browser or server), the active Supabase session cookie is used automatically — no API key needed.

---

## Products

### List products
\`\`\`
GET /api/v1/products
\`\`\`

Query parameters:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| \`status\` | \`published\` \| \`draft\` | all | Filter by status |
| \`page\` | number | 1 | Page number |
| \`limit\` | number | 20 | Results per page (max 100) |

**Response**
\`\`\`json
{
  "data": [...],
  "total": 42,
  "page": 1,
  "limit": 20
}
\`\`\`

---

### Get a product
\`\`\`
GET /api/v1/products/:id
\`\`\`

**Response** \`200\`
\`\`\`json
{
  "data": {
    "id": "uuid",
    "title": "My Product",
    "slug": "my-product",
    "description": "...",
    "price": 1999,
    "currency": "usd",
    "status": "published",
    "tags": ["ebook"],
    "product_format": "pdf",
    "sales_count": 12,
    "created_at": "2025-01-01T00:00:00Z"
  }
}
\`\`\`

---

### Create a product
\`\`\`
POST /api/v1/products
Content-Type: application/json
\`\`\`

**Body**
\`\`\`json
{
  "title": "My New Product",
  "slug": "my-new-product",
  "price": 1999,
  "currency": "usd",
  "description": "A great product",
  "status": "draft",
  "tags": ["ebook", "finance"],
  "product_format": "pdf",
  "conversion_message": "Buy now!"
}
\`\`\`

Required fields: \`title\`, \`slug\`, \`price\`

**Response** \`201\`
\`\`\`json
{ "data": { ...product } }
\`\`\`

---

### Update a product
\`\`\`
PATCH /api/v1/products/:id
Content-Type: application/json
\`\`\`

**Body** — all fields optional
\`\`\`json
{
  "title": "Updated Title",
  "status": "published",
  "price": 2499
}
\`\`\`

Updatable fields: \`title\`, \`slug\`, \`description\`, \`price\`, \`currency\`, \`status\`, \`tags\`, \`product_format\`, \`conversion_message\`, \`banner_url\`, \`show_sales_count\`

**Response** \`200\`
\`\`\`json
{ "data": { ...updatedProduct } }
\`\`\`

---

### Delete a product
\`\`\`
DELETE /api/v1/products/:id
\`\`\`

**Response** \`200\`
\`\`\`json
{ "message": "Product deleted" }
\`\`\`

---

## Reviews

### List reviews for a product
\`\`\`
GET /api/v1/products/:id/reviews
\`\`\`

**Response** \`200\`
\`\`\`json
{
  "data": [
    {
      "id": "uuid",
      "product_id": "uuid",
      "reviewer_id": "uuid",
      "rating": 5,
      "title": "Great product!",
      "body": "Really enjoyed this.",
      "verified_buyer": true,
      "created_at": "2025-01-01T00:00:00Z"
    }
  ]
}
\`\`\`

---

### Add a review
\`\`\`
POST /api/v1/products/:id/reviews
Content-Type: application/json
\`\`\`

**Body**
\`\`\`json
{
  "rating": 5,
  "title": "Excellent!",
  "body": "Very useful content.",
  "verified_buyer": true,
  "reviewer_id": "optional-user-uuid"
}
\`\`\`

Required fields: \`rating\` (1–5)

**Response** \`201\`
\`\`\`json
{ "data": { ...review } }
\`\`\`

---

## Orders

### List orders
\`\`\`
GET /api/v1/orders
\`\`\`

Returns orders that contain at least one of your products.

Query parameters:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| \`page\` | number | 1 | Page number |
| \`limit\` | number | 20 | Results per page (max 100) |

**Response** \`200\`
\`\`\`json
{
  "data": [
    {
      "id": "uuid",
      "buyer_email": "buyer@example.com",
      "buyer_name": "John Doe",
      "total_amount": 2999,
      "currency": "usd",
      "status": "paid",
      "order_items": [...],
      "created_at": "2025-01-01T00:00:00Z"
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 20
}
\`\`\`

---

## Profile

### Get your profile
\`\`\`
GET /api/v1/profile
\`\`\`

**Response** \`200\`
\`\`\`json
{
  "data": {
    "id": "uuid",
    "username": "johndoe",
    "display_name": "John Doe",
    "bio": "...",
    "tagline": "...",
    "avatar_url": "https://...",
    "website_url": "https://...",
    "twitter_url": "https://...",
    "is_pro": false,
    "credits": 0,
    "created_at": "2025-01-01T00:00:00Z"
  }
}
\`\`\`

---

### Update your profile
\`\`\`
PATCH /api/v1/profile
Content-Type: application/json
\`\`\`

**Body** — all fields optional
\`\`\`json
{
  "display_name": "Jane Doe",
  "bio": "Digital creator",
  "tagline": "Making things",
  "username": "janedoe",
  "website_url": "https://janedoe.com",
  "twitter_url": "https://twitter.com/janedoe",
  "avatar_url": "https://..."
}
\`\`\`

**Response** \`200\`
\`\`\`json
{ "data": { ...updatedProfile } }
\`\`\`

---

## API Keys

> Key management endpoints require session auth only (API keys cannot manage other API keys).

### List API keys
\`\`\`
GET /api/v1/keys
\`\`\`

### Create API key
\`\`\`
POST /api/v1/keys
Content-Type: application/json
\`\`\`

\`\`\`json
{ "name": "My Agent" }
\`\`\`

> The response includes the full raw key **once only**. Store it immediately.

### Delete API key
\`\`\`
DELETE /api/v1/keys/:id
\`\`\`

---

## Error Responses

All errors return a JSON body with an \`error\` field:

\`\`\`json
{ "error": "Unauthorized" }
\`\`\`

| Status | Meaning |
|--------|---------|
| \`400\` | Bad request / validation error |
| \`401\` | Missing or invalid credentials |
| \`404\` | Resource not found |
| \`500\` | Internal server error |

---

## Usage with an AI agent

Pass this documentation to your agent along with an API key. Example system prompt:

\`\`\`
You have access to my store's REST API at ${BASE_URL}/api/v1.
Authenticate all requests with: Authorization: Bearer <YOUR_API_KEY>

You can list and create products, add reviews, read orders, and update my profile.
Always confirm destructive actions (DELETE, status changes) before executing.
\`\`\`
`

export default function ApiDocsPage() {
  const [copied, setCopied] = useState(false)

  async function copyMarkdown() {
    await navigator.clipboard.writeText(API_MARKDOWN)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-blue-50 rounded-xl">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <h1 className="text-3xl font-black text-gray-900">API Documentation</h1>
            </div>
            <p className="text-gray-500 mt-1">
              Full reference for the REST API.{' '}
              <Link href="/dashboard/api-keys" className="text-[#FF007A] hover:underline font-medium">
                Manage API keys →
              </Link>
            </p>
          </div>
          <button
            onClick={copyMarkdown}
            className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-gray-200 bg-white text-gray-700 font-semibold rounded-xl hover:border-[#FF007A] hover:text-[#FF007A] transition-colors shadow-sm flex-shrink-0"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-green-600">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy as Markdown
              </>
            )}
          </button>
        </div>

        {/* Agent quick-start banner */}
        <div className="mb-8 p-5 bg-gradient-to-r from-[#FF007A]/5 to-purple-50 border border-[#FF007A]/20 rounded-2xl flex gap-4">
          <div className="p-2 bg-white rounded-xl shadow-sm flex-shrink-0 h-fit">
            <Key className="w-5 h-5 text-[#FF007A]" />
          </div>
          <div>
            <p className="font-bold text-gray-800 mb-1">Using with an AI agent?</p>
            <p className="text-sm text-gray-600">
              Click <strong>Copy as Markdown</strong> above and paste this doc into your agent&apos;s context or system
              prompt. Create an API key in{' '}
              <Link href="/dashboard/api-keys" className="text-[#FF007A] hover:underline">
                API Keys
              </Link>
              , then the agent can manage your products, reviews, and orders on your behalf.
            </p>
          </div>
        </div>

        {/* Docs content */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-8 py-8 prose prose-sm prose-gray max-w-none
            prose-headings:font-bold prose-headings:text-gray-900
            prose-h1:text-2xl prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3
            prose-h3:text-base prose-h3:font-semibold prose-h3:mt-6 prose-h3:mb-2
            prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:text-gray-800 prose-code:before:content-[''] prose-code:after:content-['']
            prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-xl prose-pre:p-4
            prose-table:text-sm prose-th:bg-gray-50 prose-th:font-semibold
            prose-a:text-[#FF007A] prose-a:no-underline hover:prose-a:underline
            prose-hr:border-gray-100 prose-hr:my-8
            prose-blockquote:border-amber-300 prose-blockquote:bg-amber-50 prose-blockquote:text-amber-800 prose-blockquote:rounded-r-lg
          ">
            <DocContent />
          </div>
        </div>
      </div>
    </div>
  )
}

/** Rendered inline to avoid a react-markdown bundle hit on an already-rich page */
function DocContent() {
  return (
    <div className="space-y-2">
      <p className="text-lg text-gray-500 mb-6">
        Base URL: <code>{BASE_URL}/api/v1</code>
      </p>

      <h2>Authentication</h2>
      <p>All endpoints support two authentication methods:</p>
      <ul>
        <li>
          <strong>API key (external)</strong> — pass your key as{' '}
          <code>Authorization: Bearer sp_...</code> header.
        </li>
        <li>
          <strong>Session cookie (in-app)</strong> — if called from within the app your active login session is used automatically. No key needed.
        </li>
      </ul>

      <EndpointGroup title="Products">
        <Endpoint method="GET" path="/products" description="List your products. Query: status, page, limit." />
        <Endpoint method="POST" path="/products" description="Create a product. Body: title*, slug*, price*, description, currency, status, tags, product_format, conversion_message." />
        <Endpoint method="GET" path="/products/:id" description="Get a single product." />
        <Endpoint method="PATCH" path="/products/:id" description="Update product fields." />
        <Endpoint method="DELETE" path="/products/:id" description="Delete a product." />
      </EndpointGroup>

      <EndpointGroup title="Reviews">
        <Endpoint method="GET" path="/products/:id/reviews" description="List reviews for a product." />
        <Endpoint method="POST" path="/products/:id/reviews" description="Add a review. Body: rating* (1–5), title, body, verified_buyer, reviewer_id." />
      </EndpointGroup>

      <EndpointGroup title="Orders">
        <Endpoint method="GET" path="/orders" description="List orders containing your products. Query: page, limit." />
      </EndpointGroup>

      <EndpointGroup title="Profile">
        <Endpoint method="GET" path="/profile" description="Get your profile." />
        <Endpoint method="PATCH" path="/profile" description="Update your profile. Fields: display_name, bio, tagline, username, avatar_url, website_url, twitter_url." />
      </EndpointGroup>

      <EndpointGroup title="API Keys (session only)">
        <Endpoint method="GET" path="/keys" description="List your API keys." />
        <Endpoint method="POST" path="/keys" description="Create a new API key. Body: name*. Returns the raw key once." />
        <Endpoint method="DELETE" path="/keys/:id" description="Delete an API key." />
      </EndpointGroup>

      <h2 className="mt-8">Error Responses</h2>
      <p>Errors return a JSON body with an <code>error</code> string and an appropriate HTTP status code (<code>400</code>, <code>401</code>, <code>404</code>, <code>500</code>).</p>

      <h2 className="mt-8">Using with an AI Agent</h2>
      <p>
        Copy this page&apos;s markdown (button above) and add it to your agent&apos;s system prompt together with an API
        key from the{' '}
        <a href="/dashboard/api-keys">API Keys</a> page. The agent can then create products, add
        reviews, read orders, and more — programmatically.
      </p>
    </div>
  )
}

function EndpointGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-8">
      <h2>{title}</h2>
      <div className="space-y-2 mt-3">{children}</div>
    </div>
  )
}

const methodColors: Record<string, string> = {
  GET: 'bg-blue-100 text-blue-700',
  POST: 'bg-green-100 text-green-700',
  PATCH: 'bg-yellow-100 text-yellow-700',
  DELETE: 'bg-red-100 text-red-700',
}

function Endpoint({ method, path, description }: { method: string; path: string; description: string }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
      <span
        className={`flex-shrink-0 inline-block px-2 py-0.5 rounded-md text-xs font-bold font-mono ${methodColors[method] ?? 'bg-gray-100 text-gray-700'}`}
      >
        {method}
      </span>
      <code className="flex-shrink-0 text-sm font-mono text-gray-800 not-prose">/api/v1{path}</code>
      <span className="text-sm text-gray-500">{description}</span>
    </div>
  )
}
