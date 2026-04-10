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
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

interface ReviewRequestEmailProps {
  buyerName: string
  productTitle: string
  productBannerUrl?: string | null
  sellerName: string
  reviewUrl: string
  libraryUrl: string
  siteUrl: string
}

export function ReviewRequestEmail({
  buyerName,
  productTitle,
  productBannerUrl,
  sellerName,
  reviewUrl,
  libraryUrl,
  siteUrl,
}: ReviewRequestEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        How are you enjoying {productTitle}? Share your review and help others discover great
        content.
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={logo}>Sellify</Heading>
          </Section>

          {/* Hero */}
          <Section style={heroSection}>
            <Text style={emoji}>⭐️</Text>
            <Heading style={h1}>How are you enjoying it?</Heading>
            <Text style={subtitle}>
              Hi {buyerName || 'there'}, it&apos;s been 3 days since you picked up{' '}
              <strong>{productTitle}</strong>. We hope you&apos;ve had a chance to dig in!
            </Text>
          </Section>

          {/* Product Card */}
          <Section style={productCard}>
            {productBannerUrl && (
              <Img
                src={productBannerUrl}
                alt={productTitle}
                width="560"
                height="180"
                style={bannerImage}
              />
            )}
            <Section style={productInfo}>
              <Heading style={productTitleStyle}>{productTitle}</Heading>
              <Text style={sellerText}>by {sellerName}</Text>
            </Section>
          </Section>

          {/* Why reviews matter */}
          <Section style={whySection}>
            <Text style={whyHeading}>Why your review matters 💬</Text>
            <Text style={whyText}>
              Honest reviews from real buyers help others make better decisions — and help great
              creators grow. It only takes 2 minutes!
            </Text>
          </Section>

          {/* CTA */}
          <Section style={ctaSection}>
            <Button href={reviewUrl} style={primaryButton}>
              Leave a Review →
            </Button>
            <Text style={ctaSubtext}>
              Want to re-read first?{' '}
              <Link href={libraryUrl} style={linkStyle}>
                Go to your library
              </Link>
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              You received this email because you purchased a product at{' '}
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

const emoji: React.CSSProperties = {
  fontSize: '48px',
  margin: '0 0 16px',
}

const h1: React.CSSProperties = {
  color: '#1a1a1a',
  fontSize: '26px',
  fontWeight: '700',
  margin: '0 0 12px',
}

const subtitle: React.CSSProperties = {
  color: '#6b7280',
  fontSize: '15px',
  lineHeight: '1.6',
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
  objectFit: 'cover',
  display: 'block',
}

const productInfo: React.CSSProperties = {
  padding: '16px 24px',
}

const productTitleStyle: React.CSSProperties = {
  color: '#1a1a1a',
  fontSize: '18px',
  fontWeight: '700',
  margin: '0 0 4px',
}

const sellerText: React.CSSProperties = {
  color: '#9ca3af',
  fontSize: '13px',
  margin: '0',
}

const whySection: React.CSSProperties = {
  backgroundColor: '#FFF8F0',
  margin: '0 32px',
  borderRadius: '12px',
  padding: '20px 24px',
}

const whyHeading: React.CSSProperties = {
  color: '#1a1a1a',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 6px',
}

const whyText: React.CSSProperties = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0',
}

const ctaSection: React.CSSProperties = {
  padding: '28px 32px',
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
