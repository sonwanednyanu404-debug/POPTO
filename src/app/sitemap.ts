import { MetadataRoute } from 'next';
import { getDb } from '@/lib/db';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://popto.in').replace(/\/$/, '');
  const now = new Date();

  // Static routes
  const routes: MetadataRoute.Sitemap = [
    '',
    '/shop',
    '/farmers',
    '/about',
    '/contact',
    '/privacy',
    '/terms',
    '/shipping-policy',
    '/cancellation-policy',
    '/refund-policy',
    '/help',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: route === '' ? 1 : 0.8,
  }));

  try {
    const db = getDb();
    const products = db.prepare('SELECT slug, id, updated_at FROM products WHERE is_active = 1').all() as any[];
    for (const p of products) {
      routes.push({
        url: `${baseUrl}/shop/${p.slug || p.id}`,
        lastModified: p.updated_at ? new Date(p.updated_at) : now,
        changeFrequency: 'weekly',
        priority: 0.9,
      });
    }

    const farmers = db.prepare('SELECT id, updated_at FROM sellers WHERE is_approved = 1').all() as any[];
    for (const f of farmers) {
      routes.push({
        url: `${baseUrl}/farmers/${f.id}`,
        lastModified: f.updated_at ? new Date(f.updated_at) : now,
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }
  } catch (e) {
    console.error('Error generating dynamic sitemap:', e);
  }

  return routes;
}