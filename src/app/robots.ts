import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
      {
        userAgent: '*',
        disallow: ['/api/', '/admin/', '/search'],
      }
    ],
    sitemap: 'https://castov.com/sitemap.xml',
    host: 'https://castov.com',
  };
}
