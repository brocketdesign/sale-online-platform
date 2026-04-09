import { Users } from 'lucide-react'

export default function LiveSalesBadge({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-2 bg-blue-50 text-blue-700 rounded-lg px-3 py-2">
      <Users className="w-4 h-4 flex-shrink-0" />
      <span className="text-sm font-medium">
        <strong className="font-bold">{count.toLocaleString()}</strong>{' '}{count === 1 ? 'sale' : 'sales'}
      </span>
    </div>
  )
}
