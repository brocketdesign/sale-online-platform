import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

interface PurchaseConfirmationEmailProps {
  buyerName: string
  productTitle: string
  productBannerUrl?: string | null
  sellerName: string
  amountPaid: number
  currency: string
  libraryUrl: string
  downloadUrl: string
  siteUrl: string
}

export function PurchaseConfirmationEmail({
  buyerName,
  productTitle,
  productBannerUrl,
  sellerName,
  amountPaid,
  currency,
  libraryUrl,
  downloadUrl,
  siteUrl,
}: PurchaseConfirmationEmailProps) {
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amountPaid / 100)

  const reviewDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <Html>
      <Head />
      <Preview>Your purchase of {productTitle} is confirmed! Access it in your library.</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={logo}>Sellify</Heading>
          </Section>

          {/* Hero */}
          <Section style={heroSection}>
            <Text style={checkmark}>✅</Text>
            <Heading style={h1}>Payment Confirmed!</Heading>
            <Text style={subtitle}>
              Hi {buyerName || 'there'}, your purchase is ready to access.
            </Text>
          </Section>

          {/* Product Card */}
          <Section style={productCard}>
            {productBannerUrl && (
              <Img
                src={productBannerUrl}
                alt={productTitle}
                width="560"
                height="200"
                style={bannerImage}
              />
            )}
            <Section style={productInfo}>
              <Text style={productFormat}>Digital Product</Text>
              <Heading style={productTitle_style}>{productTitle}</Heading>
              <Text style={sellerText}>by {sellerName}</Text>
              <Row>
                <Text style={amountText}>{formattedAmount}</Text>
              </Row>
            </Section>
          </Section>

          {/* CTA */}
          <Section style={ctaSection}>
            <Button href={libraryUrl} style={primaryButton}>
              Go to My Library →
            </Button>
            <Text style={ctaSubtext}>
              or{' '}
              <Link href={downloadUrl} style={linkStyle}>
                download directly
              </Link>
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Review reminder */}
          <Section style={infoSection}>
            <Text style={infoHeading}>📝 Share your thoughts</Text>
            <Text style={infoText}>
              Loving the content? You can leave a review starting on{' '}
              <strong>{reviewDate}</strong>. We want to make sure you&apos;ve had time to
              explore everything before sharing your feedback!
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              You received this email because you made a purchase at{' '}
              <Link href={siteUrl} style={linkStyle}>
                Sellify
              </Link>
              .
            </Text>
            <Text style={footerText}>
              © {new Date().getFullYear()} Sellify. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

/* ─── Styles ────────────────────────────────────────────────────────────── */

const main: React.CSSProperties = {
  backgroundColor: '#f4f0e8',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
}

const container: React.CSSProperties = {
  maxWidth: '600px',
  margin: '0 auto',
  padding: '20px 0 48px',
}

const header: React.CSSProperties = {
  padding: '24px 32px',
  backgroundColor: '#1a1a1a',
  borderRadius: '16px 16px 0 0',
}

const logo: React.CSSProperties = {
  color: '#FF007A',
  fontSize: '24px',
  fontWeight: '800',
  margin: '0',
  letterSpacing: '-0.5px',
}

const heroSection: React.CSSProperties = {
  backgroundColor: '#ffffff',
  padding: '40px 32px 32px',
  textAlign: 'center',
}

const checkmark: React.CSSProperties = {
  fontSize: '48px',
  margin: '0 0 16px',
}

const h1: React.CSSProperties = {
  color: '#1a1a1a',
  fontSize: '28px',
  fontWeight: '700',
  margin: '0 0 8px',
}

const subtitle: React.CSSProperties = {
  color: '#6b7280',
  fontSize: '16px',
  margin: '0',
}

const productCard: React.CSSProperties = {
  backgroundColor: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: '12px',
  margin: '16px 32px',
  overflow: 'hidden',
}

const bannerImage: React.CSSProperties = {
  width: '100%',
  height: '200px',
  objectFit: 'cover',
  display: 'block',
}

const productInfo: React.CSSProperties = {
  padding: '20px 24px',
}

const productFormat: React.CSSProperties = {
  color: '#FF007A',
  fontSize: '11px',
  fontWeight: '600',
  textTransform: 'uppercase',
  letterSpacing: '0.8px',
  margin: '0 0 6px',
}

const productTitle_style: React.CSSProperties = {
  color: '#1a1a1a',
  fontSize: '20px',
  fontWeight: '700',
  margin: '0 0 4px',
}

const sellerText: React.CSSProperties = {
  color: '#9ca3af',
  fontSize: '13px',
  margin: '0 0 12px',
}

const amountText: React.CSSProperties = {
  color: '#1a1a1a',
  fontSize: '18px',
  fontWeight: '700',
  margin: '0',
}

const ctaSection: React.CSSProperties = {
  padding: '24px 32px',
  backgroundColor: '#ffffff',
  textAlign: 'center',
}

const primaryButton: React.CSSProperties = {
  backgroundColor: '#FF007A',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  padding: '14px 32px',
  borderRadius: '12px',
  textDecoration: 'none',
  display: 'inline-block',
}

const ctaSubtext: React.CSSProperties = {
  color: '#9ca3af',
  fontSize: '13px',
  margin: '12px 0 0',
}

const divider: React.CSSProperties = {
  borderColor: '#e5e7eb',
  margin: '0 32px',
}

const infoSection: React.CSSProperties = {
  backgroundColor: '#ffffff',
  padding: '24px 32px',
}

const infoHeading: React.CSSProperties = {
  color: '#1a1a1a',
  fontSize: '15px',
  fontWeight: '600',
  margin: '0 0 8px',
}

const infoText: React.CSSProperties = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0',
}

const footer: React.CSSProperties = {
  padding: '24px 32px 0',
  textAlign: 'center',
}

const footerText: React.CSSProperties = {
  color: '#9ca3af',
  fontSize: '12px',
  margin: '4px 0',
}

const linkStyle: React.CSSProperties = {
  color: '#FF007A',
  textDecoration: 'none',
}
