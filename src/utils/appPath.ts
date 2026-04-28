const BASE_PATH = import.meta.env.BASE_URL

export function withBasePath(pathname: string) {
  if (!BASE_PATH || BASE_PATH === '/') {
    return pathname
  }

  const normalizedBasePath = BASE_PATH.endsWith('/')
    ? BASE_PATH.slice(0, -1)
    : BASE_PATH

  return `${normalizedBasePath}${pathname}`
}

