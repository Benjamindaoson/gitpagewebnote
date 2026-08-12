function absoluteUrl(siteUrl, path) {
  return `${siteUrl.replace(/\/$/, '')}/${String(path).replace(/^\//, '')}`
}

export function createSeoHead({ siteUrl, path, title, description, image, article } = {}) {
  const canonical = absoluteUrl(siteUrl, path || '/')
  const absoluteImage = image ? absoluteUrl(siteUrl, image) : ''
  const kind = article ? 'article' : 'website'
  const schema = article
    ? { '@context': 'https://schema.org', '@type': 'Article', headline: title, description, datePublished: article.date, dateModified: article.updated, mainEntityOfPage: canonical }
    : { '@context': 'https://schema.org', '@type': 'WebPage', name: title, description, url: canonical }
  const meta = [
    ['meta', { property: 'og:title', content: title }],
    ['meta', { property: 'og:type', content: kind }],
    ['meta', { property: 'og:url', content: canonical }],
    ['meta', { property: 'og:description', content: description }],
    ['meta', { property: 'og:site_name', content: 'Benjamin 的 AI 笔记' }],
    ['meta', { property: 'og:locale', content: 'zh_CN' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: title }],
    ['meta', { name: 'twitter:description', content: description }]
  ]
  if (absoluteImage) meta.push(['meta', { property: 'og:image', content: absoluteImage }], ['meta', { property: 'og:image:alt', content: title }], ['meta', { name: 'twitter:image', content: absoluteImage }])
  return [['link', { rel: 'canonical', href: canonical }], ...meta, ['script', { type: 'application/ld+json' }, JSON.stringify(schema)]]
}
