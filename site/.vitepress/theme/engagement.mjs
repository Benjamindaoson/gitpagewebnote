export const engagement = {
  goatCounterCode: '',
  feedbackUrl: 'https://github.com/Benjamindaoson/gitpagewebnote/issues/new/choose',
  giscus: {
    repo: '',
    repoId: '',
    category: '',
    categoryId: '',
    mapping: 'pathname',
    strict: '0',
    reactionsEnabled: '1',
    emitMetadata: '0',
    inputPosition: 'top',
    theme: 'preferred_color_scheme',
    lang: 'zh-CN'
  }
}

export function isGoatCounterEnabled(config = engagement) {
  return Boolean(config.goatCounterCode?.trim())
}

export function isGiscusEnabled(config = engagement) {
  const giscus = config.giscus ?? {}
  return [giscus.repo, giscus.repoId, giscus.category, giscus.categoryId].every((value) => typeof value === 'string' && value.trim())
}
