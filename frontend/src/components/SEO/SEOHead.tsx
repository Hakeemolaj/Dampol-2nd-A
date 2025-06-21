import Head from 'next/head';
import { useRouter } from 'next/router';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  article?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
  noindex?: boolean;
  canonical?: string;
  alternateLanguages?: { [key: string]: string };
}

const DEFAULT_SEO = {
  title: 'Barangay Dampol 2nd A - Official Website',
  description: 'Official website of Barangay Dampol 2nd A, Pulilan, Bulacan. Access government services, announcements, and community information.',
  keywords: [
    'Barangay Dampol 2nd A',
    'Pulilan Bulacan',
    'Government Services',
    'Community',
    'Philippines',
    'Local Government',
    'Barangay Services',
    'Document Requests',
    'Announcements',
  ],
  image: '/images/barangay-logo.png',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://dampol2nda.gov.ph',
  siteName: 'Barangay Dampol 2nd A',
  locale: 'en_PH',
  type: 'website',
};

export default function SEOHead({
  title,
  description,
  keywords = [],
  image,
  article = false,
  publishedTime,
  modifiedTime,
  author,
  section,
  tags = [],
  noindex = false,
  canonical,
  alternateLanguages = {},
}: SEOProps) {
  const router = useRouter();
  
  const seoTitle = title 
    ? `${title} | ${DEFAULT_SEO.siteName}`
    : DEFAULT_SEO.title;
  
  const seoDescription = description || DEFAULT_SEO.description;
  const seoKeywords = [...DEFAULT_SEO.keywords, ...keywords].join(', ');
  const seoImage = image || DEFAULT_SEO.image;
  const seoUrl = `${DEFAULT_SEO.siteUrl}${router.asPath}`;
  const canonicalUrl = canonical || seoUrl;

  // Generate structured data
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': article ? 'Article' : 'WebPage',
    name: seoTitle,
    description: seoDescription,
    url: seoUrl,
    image: seoImage,
    ...(article && {
      headline: title,
      author: {
        '@type': 'Organization',
        name: author || DEFAULT_SEO.siteName,
      },
      publisher: {
        '@type': 'Organization',
        name: DEFAULT_SEO.siteName,
        logo: {
          '@type': 'ImageObject',
          url: `${DEFAULT_SEO.siteUrl}/images/barangay-logo.png`,
        },
      },
      datePublished: publishedTime,
      dateModified: modifiedTime || publishedTime,
      articleSection: section,
      keywords: tags.join(', '),
    }),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': seoUrl,
    },
  };

  // Organization structured data for homepage
  const organizationData = {
    '@context': 'https://schema.org',
    '@type': 'GovernmentOrganization',
    name: DEFAULT_SEO.siteName,
    alternateName: 'Dampol 2nd A Barangay Hall',
    url: DEFAULT_SEO.siteUrl,
    logo: `${DEFAULT_SEO.siteUrl}/images/barangay-logo.png`,
    description: DEFAULT_SEO.description,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Dampol 2nd A',
      addressLocality: 'Pulilan',
      addressRegion: 'Bulacan',
      addressCountry: 'Philippines',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: process.env.NEXT_PUBLIC_BARANGAY_PHONE || '+63-2-123-4567',
      contactType: 'customer service',
      availableLanguage: ['English', 'Filipino'],
    },
    sameAs: [
      // Add social media links here
      'https://www.facebook.com/dampol2nda',
    ],
  };

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      <meta name="keywords" content={seoKeywords} />
      <meta name="author" content={author || DEFAULT_SEO.siteName} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#2563eb" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Robots */}
      <meta name="robots" content={noindex ? 'noindex,nofollow' : 'index,follow'} />
      <meta name="googlebot" content={noindex ? 'noindex,nofollow' : 'index,follow'} />
      
      {/* Open Graph */}
      <meta property="og:type" content={article ? 'article' : 'website'} />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content={seoImage} />
      <meta property="og:url" content={seoUrl} />
      <meta property="og:site_name" content={DEFAULT_SEO.siteName} />
      <meta property="og:locale" content={DEFAULT_SEO.locale} />
      
      {/* Article specific Open Graph */}
      {article && (
        <>
          <meta property="article:published_time" content={publishedTime} />
          <meta property="article:modified_time" content={modifiedTime || publishedTime} />
          <meta property="article:author" content={author} />
          <meta property="article:section" content={section} />
          {tags.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={seoImage} />
      <meta name="twitter:site" content="@dampol2nda" />
      <meta name="twitter:creator" content="@dampol2nda" />
      
      {/* Alternate Languages */}
      {Object.entries(alternateLanguages).map(([lang, url]) => (
        <link key={lang} rel="alternate" hrefLang={lang} href={url} />
      ))}
      
      {/* Favicon and Icons */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/manifest.json" />
      
      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* DNS Prefetch */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      
      {/* Organization Data for Homepage */}
      {router.pathname === '/' && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationData),
          }}
        />
      )}
      
      {/* Government Website Verification */}
      <meta name="gov-ph-verified" content="true" />
      <meta name="classification" content="government" />
      <meta name="coverage" content="Philippines" />
      <meta name="distribution" content="global" />
      <meta name="rating" content="general" />
      
      {/* Performance Hints */}
      <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      
      {/* Security Headers */}
      <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
      <meta httpEquiv="X-Frame-Options" content="DENY" />
      <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
      
      {/* Cache Control for Static Assets */}
      <meta httpEquiv="Cache-Control" content="public, max-age=31536000" />
      
      {/* Language */}
      <meta httpEquiv="Content-Language" content="en-PH" />
      
      {/* Mobile Optimization */}
      <meta name="format-detection" content="telephone=yes" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content={DEFAULT_SEO.siteName} />
      
      {/* Microsoft Tiles */}
      <meta name="msapplication-TileColor" content="#2563eb" />
      <meta name="msapplication-config" content="/browserconfig.xml" />
      
      {/* Rich Snippets for Government Services */}
      {router.pathname.includes('/services') && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'GovernmentService',
              name: 'Barangay Services',
              description: 'Government services provided by Barangay Dampol 2nd A',
              provider: {
                '@type': 'GovernmentOrganization',
                name: DEFAULT_SEO.siteName,
              },
              areaServed: {
                '@type': 'Place',
                name: 'Dampol 2nd A, Pulilan, Bulacan',
              },
              availableChannel: {
                '@type': 'ServiceChannel',
                serviceUrl: seoUrl,
                serviceType: 'Online',
              },
            }),
          }}
        />
      )}
    </Head>
  );
}
