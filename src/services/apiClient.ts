const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333'

let authToken: string | null = null

export const setAuthToken = (token: string | null) => {
  authToken = token
}

const getAuthHeaders = (): Record<string, string> => {
  if (!authToken) return {}
  return {
    Authorization: `Bearer ${authToken}`,
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
}

const parseResponse = async (response: Response) => {
  const contentType = response.headers.get('Content-Type') ?? ''
  if (contentType.includes('application/json')) {
    return response.json()
  }

  const text = await response.text()
  return text.length ? text : null
}

const request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const { body, headers, ...rest } = options
  const hasBody = typeof body !== 'undefined'

  const requestHeaders = new Headers({
    Accept: 'application/json',
    ...getAuthHeaders(),
  })

  if (hasBody && !(body instanceof FormData)) {
    requestHeaders.set('Content-Type', 'application/json')
  }

  if (headers) {
    if (headers instanceof Headers) {
      headers.forEach((value, key) => requestHeaders.set(key, value))
    } else if (Array.isArray(headers)) {
      headers.forEach(([key, value]) => requestHeaders.set(key, value))
    } else {
      Object.entries(headers).forEach(([key, value]) => {
        if (typeof value !== 'undefined') {
          requestHeaders.set(key, value as string)
        }
      })
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: requestHeaders,
    body: hasBody
      ? body instanceof FormData
        ? body
        : JSON.stringify(body)
      : undefined,
  })

  const parsed = await parseResponse(response)

  if (!response.ok) {
    const message =
      typeof parsed === 'string'
        ? parsed
        : (parsed as { message?: string })?.message ?? 'Erro na comunicação com a API.'
    throw new Error(message)
  }

  return parsed as T
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'POST', body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PUT', body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'DELETE' }),
}

export type ApiClient = typeof apiClient
