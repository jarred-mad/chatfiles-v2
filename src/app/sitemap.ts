import { MetadataRoute } from 'next';

const BASE_URL = 'https://chatfiles.org';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/browse`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/photos`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // In production, fetch document IDs from database
  // For now, return static pages only
  // TODO: Add dynamic document pages
  // const documents = await getDocumentIds();
  // const documentPages = documents.map((id) => ({
  //   url: `${BASE_URL}/documents/${id}`,
  //   lastModified: new Date(),
  //   changeFrequency: 'monthly' as const,
  //   priority: 0.6,
  // }));

  // TODO: Add face cluster pages
  // const clusters = await getClusterIds();
  // const clusterPages = clusters.map((id) => ({
  //   url: `${BASE_URL}/photos/person/${id}`,
  //   lastModified: new Date(),
  //   changeFrequency: 'monthly' as const,
  //   priority: 0.5,
  // }));

  return [...staticPages];
}
