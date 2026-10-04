import { MetadataRoute } from 'next';
import { AI_TOOLS, AI_CATEGORIES } from '@/lib/ai-tools';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://castov.com';

  const sitemapEntries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/ai`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  // Add categories
  AI_CATEGORIES.forEach((category) => {
    sitemapEntries.push({
      url: `${baseUrl}/ai/${category}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  });

  // Add all tools
  AI_TOOLS.forEach((tool) => {
    sitemapEntries.push({
      url: `${baseUrl}/ai/${tool.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    });
  });

  return sitemapEntries;
}
