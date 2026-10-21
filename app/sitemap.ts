import type { MetadataRoute } from 'next'

const SITE_URL = 'https://allthecharts.xyz'

const ROUTES = [
  '/',
  '/social-trends',
  '/birth-rates',
  '/crime/london',
  '/crime/rape-gangs',
]

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((route) => ({ url: `${SITE_URL}${route}` }))
}
