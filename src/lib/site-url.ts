const DEV_FALLBACK_URL = 'http://localhost:3000'

/**
 * Returns the public base URL of the site, without a trailing slash.
 *
 * Reads SERVER_URL, which is deliberately not prefixed with NEXT_PUBLIC_: public
 * env vars are inlined into the bundle at build time and stop responding to the
 * runtime environment, which would freeze this value to whatever was set during
 * the Docker build. Throws in production rather than silently emitting localhost.
 */
export function getSiteUrl(): string {
  const raw = process.env.SERVER_URL

  if (!raw) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'SERVER_URL env var is required in production. Set it in the runtime environment.',
      )
    }
    return DEV_FALLBACK_URL
  }

  return raw.replace(/\/+$/, '')
}
