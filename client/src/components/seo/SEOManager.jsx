import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

const DEFAULT_SITE_NAME = 'Nio Tea';
const DEFAULT_TITLE = 'Nio Tea | Premium Tea Trading Company';
const DEFAULT_DESCRIPTION =
  'Nio Tea brings you handpicked premium teas from trusted Indian tea gardens. Explore black, green, oolong, herbal, and specialty collections.';

const STATIC_ROUTES = {
  '/': {
    title: 'Nio Tea | Premium Tea Trading Company',
    description:
      'Nio Tea brings you handpicked premium teas from trusted Indian tea gardens. Explore black, green, oolong, herbal, and specialty collections.',
  },
  '/about': {
    title: 'About Nio Tea | Heritage, Craft, and Quality',
    description:
      'Learn the Nio Tea story, our sourcing philosophy, and our commitment to quality, sustainability, and tea craftsmanship.',
  },
  '/products': {
    title: 'Tea Collection | Nio Tea Products',
    description:
      'Browse the Nio Tea collection and discover premium tea varieties with tasting notes, origins, and brewing guidance.',
  },
  '/contact': {
    title: 'Contact Nio Tea | Enquiries and Support',
    description:
      'Contact Nio Tea for product questions, wholesale enquiries, and support. We are here to help with tea recommendations and orders.',
  },
  '/login': {
    title: 'Login | Nio Tea',
    description: 'Securely log in to your Nio Tea account to manage your profile and preferences.',
  },
  '/rebranding': {
    title: 'Tea Rebranding Services | Nio Tea',
    description:
      'Build or relaunch your tea brand with Nio Tea rebranding services, including private labelling, packaging, and market support.',
  },
};

function setMetaByName(name, content) {
  if (!content) return;
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function setMetaByProperty(property, content) {
  if (!content) return;
  let tag = document.querySelector(`meta[property="${property}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('property', property);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function upsertCanonical(url) {
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

function upsertStructuredData(payload) {
  const id = 'nio-structured-data';
  let script = document.getElementById(id);
  if (!script) {
    script = document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(payload);
}

function buildBreadcrumb(baseUrl, pathname) {
  const cleanPath = pathname === '/' ? [] : pathname.split('/').filter(Boolean);
  const items = [{ name: 'Home', item: `${baseUrl}/` }];

  let cumulative = '';
  cleanPath.forEach((segment) => {
    cumulative += `/${segment}`;
    const label = segment
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (m) => m.toUpperCase());
    items.push({ name: label, item: `${baseUrl}${cumulative}` });
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((entry, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: entry.name,
      item: entry.item,
    })),
  };
}

export default function SEOManager() {
  const location = useLocation();
  const pathname = location.pathname;

  const origin =
    (typeof window !== 'undefined' && window.location && window.location.origin) ||
    import.meta.env.VITE_SITE_URL ||
    'https://niotea.vercel.app';

  const pageSeo = useMemo(() => {
    if (pathname.startsWith('/products/')) {
      return {
        title: 'Product Details | Nio Tea',
        description:
          'Read tea details, origin notes, and brewing recommendations for this Nio Tea product.',
      };
    }

    return STATIC_ROUTES[pathname] || { title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION };
  }, [pathname]);

  useEffect(() => {
    const canonicalUrl = `${origin}${pathname === '/' ? '/' : pathname}`;

    document.title = pageSeo.title;
    setMetaByName('description', pageSeo.description);
    setMetaByName('robots', 'index, follow, max-image-preview:large');
    setMetaByName('author', DEFAULT_SITE_NAME);

    setMetaByProperty('og:type', 'website');
    setMetaByProperty('og:site_name', DEFAULT_SITE_NAME);
    setMetaByProperty('og:title', pageSeo.title);
    setMetaByProperty('og:description', pageSeo.description);
    setMetaByProperty('og:url', canonicalUrl);

    setMetaByName('twitter:card', 'summary_large_image');
    setMetaByName('twitter:title', pageSeo.title);
    setMetaByName('twitter:description', pageSeo.description);

    upsertCanonical(canonicalUrl);

    const websiteSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: DEFAULT_SITE_NAME,
      url: `${origin}/`,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${origin}/products`,
        'query-input': 'required name=search_term_string',
      },
    };

    const organizationSchema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: DEFAULT_SITE_NAME,
      url: `${origin}/`,
      logo: `${origin}/nio-tea-logo.jpg`,
    };

    const breadcrumbSchema = buildBreadcrumb(origin, pathname);

    upsertStructuredData([websiteSchema, organizationSchema, breadcrumbSchema]);
  }, [origin, pathname, pageSeo]);

  return null;
}
