import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/ai', '/ai/*'],
    },
    sitemap: 'https://castov.com/sitemap.xml',
  };
}
