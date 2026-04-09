/** Format cents to display string: 999 → "$9.99" */
export function formatPrice(cents: number, currency = 'usd'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(cents / 100)
}

/** Slugify a string for use in URLs */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

/** Calculate VAT rate by country code (simplified) */
export function getVatRate(countryCode: string): number {
  const vatRates: Record<string, number> = {
    AT: 0.20, BE: 0.21, BG: 0.20, CY: 0.19, CZ: 0.21,
    DE: 0.19, DK: 0.25, EE: 0.22, ES: 0.21, FI: 0.25,
    FR: 0.20, GR: 0.24, HR: 0.25, HU: 0.27, IE: 0.23,
    IT: 0.22, LT: 0.21, LU: 0.17, LV: 0.21, MT: 0.18,
    NL: 0.21, PL: 0.23, PT: 0.23, RO: 0.19, SE: 0.25,
    SI: 0.22, SK: 0.20, GB: 0.20,
  }
  return vatRates[countryCode.toUpperCase()] ?? 0
}

export const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'JP', name: 'Japan' },
  { code: 'TH', name: 'Thailand' },
  { code: 'SG', name: 'Singapore' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' },
  { code: 'DK', name: 'Denmark' },
  { code: 'FI', name: 'Finland' },
  { code: 'AT', name: 'Austria' },
  { code: 'BE', name: 'Belgium' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'PT', name: 'Portugal' },
  { code: 'PL', name: 'Poland' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
  { code: 'IN', name: 'India' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'KE', name: 'Kenya' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'PH', name: 'Philippines' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'AR', name: 'Argentina' },
  { code: 'CL', name: 'Chile' },
  { code: 'CO', name: 'Colombia' },
  { code: 'OTHER', name: 'Other' },
]

export const FILE_FORMAT_LABELS: Record<string, string> = {
  pdf: 'PDF',
  mp3: 'Audio (MP3)',
  mp4: 'Video (MP4)',
  epub: 'eBook (EPUB)',
  zip: 'ZIP Archive',
  software: 'Software',
  other: 'Other',
}
