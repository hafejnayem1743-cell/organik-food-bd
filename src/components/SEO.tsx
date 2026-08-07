import React, { useEffect } from 'react';
import { Product } from '../types';

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

interface SEOProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogType?: 'website' | 'product';
  ogImage?: string;
  product?: Product | null;
  pageType?: 'home' | 'products' | 'product_details' | 'categories' | 'support' | 'about' | 'contact';
  categoryName?: string;
  breadcrumbs?: { name: string; url: string }[];
}

const DEFAULT_TITLE = "Organik Food BD - Pure Organic Food & Supplements in Bangladesh";
const DEFAULT_DESCRIPTION = "Buy 100% pure organic food, natural cold-pressed mustard oil, pure honey, ghee, food supplements, and premium consumer goods at Organik Food BD. Fast delivery across Bangladesh.";
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200";
const SITE_NAME = "Organik Food BD";

const EMPTY_BREADCRUMBS: { name: string; url: string }[] = [];

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  canonicalUrl,
  ogType = 'website',
  ogImage,
  product,
  pageType = 'home',
  categoryName,
  breadcrumbs = EMPTY_BREADCRUMBS
}) => {
  const breadcrumbsStr = JSON.stringify(breadcrumbs);
  const productId = product?.id || '';
  const productName = product?.name || '';
  const productPrice = product?.price || 0;
  const productStock = product?.stock || 0;

  useEffect(() => {
    const origin = window.location.origin;

    // Clean up previously created dynamic SEO tags to prevent duplicates
    document.head.querySelectorAll('[data-seo-dynamic="true"]').forEach(el => el.remove());

    // Build URL slug if product or page
    let urlPath = window.location.pathname;
    if (product) {
      urlPath = `/products/${slugify(product.name)}`;
    } else if (pageType === 'products') {
      urlPath = categoryName && categoryName !== 'All' ? `/products?category=${encodeURIComponent(categoryName)}` : '/products';
    } else if (pageType === 'categories') {
      urlPath = '/categories';
    } else if (pageType === 'support') {
      urlPath = '/support';
    } else if (pageType === 'about') {
      urlPath = '/about';
    } else if (pageType === 'contact') {
      urlPath = '/contact';
    }

    const currentUrl = canonicalUrl || `${origin}${urlPath}`;

    // Determine Title and Description
    let pageTitle = title;
    let pageDescription = description;
    let pageImage = ogImage || DEFAULT_IMAGE;

    if (product) {
      const prodDesc = product.shortDescription || product.fullDescription || product.caption || '';
      pageTitle = `${product.name} - Pure Organic Food | Organik Food BD`;
      pageDescription = `Buy 100% pure ${product.name} at Organik Food BD for ৳${product.discountPrice || product.price}. ${prodDesc.slice(0, 140)}`;
      pageImage = product.image || (product.images && product.images[0]) || DEFAULT_IMAGE;
    } else if (!pageTitle) {
      switch (pageType) {
        case 'home':
          pageTitle = "Organik Food BD - Pure Organic Food & Supplements in Bangladesh";
          pageDescription = "Shop 100% authentic organic food, natural supplements, pure mustard oil, honey, ghee and dry fruits online in Bangladesh with cash on delivery.";
          break;
        case 'products':
          pageTitle = categoryName && categoryName !== 'All' 
            ? `${categoryName} - Buy Pure Organic ${categoryName} | Organik Food BD`
            : "All Organic Products - Pure Food & Natural Supplements | Organik Food BD";
          pageDescription = categoryName && categoryName !== 'All'
            ? `Browse premium organic ${categoryName} at Organik Food BD. 100% pure quality with fast delivery across Bangladesh.`
            : "Explore our full catalog of 100% pure organic food, supplements, pure mustard oil, honey, ghee and daily healthy essentials.";
          break;
        case 'categories':
          pageTitle = "Product Categories - Food Supplements, Pure Oils & Organic Foods | Organik Food BD";
          pageDescription = "Browse all organic food product categories including Food Supplements, Consumer Goods, Pure Mustard Oil, Honey, and Natural Health Products.";
          break;
        case 'support':
          pageTitle = "Customer Support & Helpline - Organik Food BD";
          pageDescription = "Need help with your organic food order, shipping, or returns? Contact Organik Food BD customer support. Phone: 01724202210.";
          break;
        case 'about':
          pageTitle = "About Us - Pure & Chemical-Free Organic Food Mission | Organik Food BD";
          pageDescription = "Learn about Organik Food BD's journey bringing 100% chemical-free, natural, and authentic organic foods to every household in Bangladesh.";
          break;
        case 'contact':
          pageTitle = "Contact Us - Organik Food BD Mirpur Kushtia Bangladesh";
          pageDescription = "Get in touch with Organik Food BD. Mobile: 01724202210, Email: hafejnayem1743@gmail.com. Located at Main Bazar, Mirpur, Kushtia, Bangladesh.";
          break;
        default:
          pageTitle = DEFAULT_TITLE;
          pageDescription = DEFAULT_DESCRIPTION;
      }
    }

    if (!pageDescription) pageDescription = DEFAULT_DESCRIPTION;

    // 1. Set Document Title
    document.title = pageTitle;

    // Meta Tag Setter
    const addMetaTag = (attrName: string, attrVal: string, content: string) => {
      const meta = document.createElement('meta');
      meta.setAttribute(attrName, attrVal);
      meta.setAttribute('content', content);
      meta.setAttribute('data-seo-dynamic', 'true');
      document.head.appendChild(meta);
    };

    // Link Tag Setter
    const addLinkTag = (rel: string, href: string) => {
      const link = document.createElement('link');
      link.setAttribute('rel', rel);
      link.setAttribute('href', href);
      link.setAttribute('data-seo-dynamic', 'true');
      document.head.appendChild(link);
    };

    // Standard Meta
    addMetaTag('name', 'description', pageDescription);
    addMetaTag('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    addLinkTag('canonical', currentUrl);

    // Open Graph
    addMetaTag('property', 'og:title', pageTitle);
    addMetaTag('property', 'og:description', pageDescription);
    addMetaTag('property', 'og:image', pageImage);
    addMetaTag('property', 'og:url', currentUrl);
    addMetaTag('property', 'og:type', product ? 'product' : ogType);
    addMetaTag('property', 'og:site_name', SITE_NAME);
    addMetaTag('property', 'og:locale', 'en_US');

    // Twitter Cards
    addMetaTag('name', 'twitter:card', 'summary_large_image');
    addMetaTag('name', 'twitter:title', pageTitle);
    addMetaTag('name', 'twitter:description', pageDescription);
    addMetaTag('name', 'twitter:image', pageImage);

    // JSON-LD Schemas
    const jsonLdData: any[] = [];

    // Organization Schema
    jsonLdData.push({
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": SITE_NAME,
      "url": origin,
      "logo": `${origin}/icons/icon-512.png`,
      "description": "Premium 100% authentic organic food, cold-pressed mustard oil, honey, ghee, food supplements in Bangladesh.",
      "telephone": "+8801724202210",
      "email": "hafejnayem1743@gmail.com",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Main Bazar, Mirpur",
        "addressLocality": "Mirpur",
        "addressRegion": "Kushtia",
        "postalCode": "7030",
        "addressCountry": "BD"
      },
      "sameAs": [
        "https://www.facebook.com/organikfoodbd"
      ]
    });

    // WebSite Schema
    jsonLdData.push({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": SITE_NAME,
      "url": origin,
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${origin}/products?search={search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    });

    // Breadcrumbs Schema
    const breadcrumbList: any[] = [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": origin }
    ];

    if (pageType === 'products') {
      breadcrumbList.push({ "@type": "ListItem", "position": 2, "name": categoryName || "Products", "item": `${origin}/products` });
    } else if (pageType === 'categories') {
      breadcrumbList.push({ "@type": "ListItem", "position": 2, "name": "Categories", "item": `${origin}/categories` });
    } else if (pageType === 'support') {
      breadcrumbList.push({ "@type": "ListItem", "position": 2, "name": "Support", "item": `${origin}/support` });
    } else if (pageType === 'about') {
      breadcrumbList.push({ "@type": "ListItem", "position": 2, "name": "About Us", "item": `${origin}/about` });
    } else if (pageType === 'contact') {
      breadcrumbList.push({ "@type": "ListItem", "position": 2, "name": "Contact", "item": `${origin}/contact` });
    } else if (product) {
      breadcrumbList.push({ "@type": "ListItem", "position": 2, "name": "Products", "item": `${origin}/products` });
      breadcrumbList.push({ "@type": "ListItem", "position": 3, "name": product.name, "item": `${origin}/products/${slugify(product.name)}` });
    }

    if (breadcrumbs.length > 0) {
      breadcrumbs.forEach((b, idx) => {
        breadcrumbList.push({
          "@type": "ListItem",
          "position": idx + 2,
          "name": b.name,
          "item": b.url.startsWith('http') ? b.url : `${origin}${b.url}`
        });
      });
    }

    jsonLdData.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbList
    });

    // Product Schema
    if (product) {
      jsonLdData.push({
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": product.name,
        "image": product.images && product.images.length > 0 ? product.images : [product.image || pageImage],
        "description": product.shortDescription || product.fullDescription || product.caption || product.name,
        "sku": product.id,
        "brand": {
          "@type": "Brand",
          "name": SITE_NAME
        },
        "offers": {
          "@type": "Offer",
          "priceCurrency": "BDT",
          "price": product.discountPrice && product.discountPrice < product.price ? product.discountPrice : product.price,
          "priceValidUntil": "2028-12-31",
          "itemCondition": "https://schema.org/NewCondition",
          "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          "seller": {
            "@type": "Organization",
            "name": SITE_NAME
          }
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": (product.rating || 5).toString(),
          "reviewCount": (product.reviewCount || 10).toString()
        }
      });
    }

    // Attach JSON-LD scripts
    jsonLdData.forEach(schemaObj => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-seo-dynamic', 'true');
      script.text = JSON.stringify(schemaObj);
      document.head.appendChild(script);
    });

    return () => {
      document.head.querySelectorAll('[data-seo-dynamic="true"]').forEach(el => el.remove());
    };

  }, [title, description, canonicalUrl, ogType, ogImage, productId, productName, productPrice, productStock, pageType, categoryName, breadcrumbsStr]);

  return null;
};
