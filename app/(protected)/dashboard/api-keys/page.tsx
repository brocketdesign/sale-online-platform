'use client'

import { useState, useEffect, useCallback } from 'react'
import { Key, Plus, Trash2, Copy, Eye, EyeOff, AlertCircle, CheckCircle2, Clock } from 'lucide-react'
import Link from 'next/link'

interface ApiKey {
  id: string
  name: string
  key_prefix: string
  last_used_at: string | null
  is_active: boolean
  created_at: string
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [newKeyValue, setNewKeyValue] = useState<string | null>(null)
  const [newKeyVisible, setNewKeyVisible] = useState(true)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchKeys = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/v1/keys')
      const json = await res.json()
      setKeys(json.data ?? [])
    } catch {
      setError('Failed to load API keys')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchKeys() }, [fetchKeys])

  async function createKey(e: React.FormEvent) {
    e.preventDefault()
    if (!newKeyName.trim()) return
    setCreating(true)
    setError(null)
    try {
      const res = await fetch('/api/v1/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName.trim() }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error ?? 'Failed to create key'); return }
      setNewKeyValue(json.data.key)
      setNewKeyName('')
      setShowForm(false)
      setNewKeyVisible(true)
      setCopied(false)
      await fetchKeys()
    } catch {
      setError('Failed to create API key')
    } finally {
      setCreating(false)
    }
  }

  async function deleteKey(id: string) {
    if (!confirm('Delete this API key? Any integrations using it will stop working immediately.')) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/v1/keys/${id}`, { method: 'DELETE' })
      if (!res.ok) { setError('Failed to delete key'); return }
      setKeys(prev => prev.filter(k => k.id !== id))
    } catch {
      setError('Failed to delete key')
    } finally {
      setDeletingId(null)
    }
  }

  async function copyKey(text: string) {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-[#FF007A]/10 rounded-xl">
                <Key className="w-5 h-5 text-[#FF007A]" />
              </div>
              <h1 className="text-3xl font-black text-gray-900">API Keys</h1>
            </div>
            <p className="text-gray-500 mt-1">
              Create keys to access your data from external tools, agents, or scripts.{' '}
              <Link href="/dashboard/api-docs" className="text-[#FF007A] hover:underline font-medium">
                View API docs →
              </Link>
            </p>
          </div>
          <button
            onClick={() => { setShowForm(v => !v); setError(null) }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF007A] text-white font-semibold rounded-xl hover:bg-[#e0006e] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New key
          </button>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">✕</button>
          </div>
        )}

        {/* Newly created key — show once */}
        {newKeyValue && (
          <div className="mb-8 p-6 bg-amber-50 border-2 border-amber-300 rounded-2xl">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-amber-800 mb-1">API key created — copy it now!</p>
                <p className="text-sm text-amber-700 mb-4">
                  This key will <strong>never be shown again</strong>. Store it securely.
                </p>
                <div className="flex items-center gap-3">
                  <code className="flex-1 bg-white border border-amber-300 rounded-lg px-4 py-3 font-mono text-sm text-gray-800 break-all select-all">
                    {newKeyVisible ? newKeyValue : '•'.repeat(Math.min(newKeyValue.length, 40))}
                  </code>
                  <button
                    onClick={() => setNewKeyVisible(v => !v)}
                    className="p-2.5 rounded-lg border border-amber-300 hover:bg-amber-100 text-amber-700 flex-shrink-0"
                    title={newKeyVisible ? 'Hide' : 'Show'}
                  >
                    {newKeyVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => copyKey(newKeyValue)}
                    className="p-2.5 rounded-lg border border-amber-300 hover:bg-amber-100 text-amber-700 flex-shrink-0"
                    title="Copy"
                  >
                    {copied ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button onClick={() => setNewKeyValue(null)} className="text-amber-400 hover:text-amber-600 flex-shrink-0">✕</button>
            </div>
          </div>
        )}

        {/* Create key form */}
        {showForm && (
          <div className="mb-8 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Create new API key</h2>
            <form onSubmit={createKey} className="flex gap-3">
              <input
                type="text"
                value={newKeyName}
                onChange={e => setNewKeyName(e.target.value)}
                placeholder="e.g. My Agent, Zapier, Production"
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF007A]/30 focus:border-[#FF007A]"
                autoFocus
                maxLength={64}
              />
              <button
                type="submit"
                disabled={creating || !newKeyName.trim()}
                className="px-5 py-2.5 bg-[#FF007A] text-white font-semibold rounded-xl hover:bg-[#e0006e] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {creating ? 'Creating…' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        {/* Keys list */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-400 text-sm">Loading…</div>
          ) : keys.length === 0 ? (
            <div className="p-16 text-center">
              <div className="text-5xl mb-4">🔑</div>
              <h2 className="text-lg font-bold text-gray-700 mb-2">No API keys yet</h2>
              <p className="text-gray-400 text-sm mb-6">Create a key to start integrating with external tools.</p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF007A] text-white font-semibold rounded-xl hover:bg-[#e0006e] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create your first key
              </button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">Name</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">Key</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">Last used</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">Created</th>
                  <th className="px-6 py-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {keys.map(k => (
                  <tr key={k.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-800">{k.name}</td>
                    <td className="px-6 py-4">
                      <code className="bg-gray-100 px-2.5 py-1 rounded-lg font-mono text-xs text-gray-700">
                        {k.key_prefix}…
                      </code>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {k.last_used_at ? (
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {timeAgo(k.last_used_at)}
                        </span>
                      ) : (
                        <span className="text-gray-300">Never</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500">{formatDate(k.created_at)}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => deleteKey(k.id)}
                        disabled={deletingId === k.id}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete key"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Security note */}
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-xl flex gap-3">
          <AlertCircle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-gray-500">
            API keys provide full access to your account data. Never share them publicly or commit them to source control.
            Keys can also be used as{' '}
            <code className="bg-gray-200 px-1 rounded text-xs">Authorization: Bearer &lt;key&gt;</code>{' '}
            headers in HTTP requests.
          </p>
        </div>
      </div>
    </div>
  )
}
