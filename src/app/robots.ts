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
    sitemap: [
      'https://castov.com/sitemap.xml',
      'https://castov.com/sitemap-unix.xml'
    ],
    host: 'https://castov.com',
  };
}
