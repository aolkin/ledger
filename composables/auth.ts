import type { AuthAction } from '@auth/core/types'

const config = useRuntimeConfig()

const authUrl = (action: AuthAction | string) =>
  `${config.public.apiOrigin}/auth/${action}`

const authFetch = async (
  action: AuthAction | string,
  options?: RequestInit,
) => {
  const response = await fetch(authUrl(action), {
    ...options,
    headers: {
      ...options?.headers,
      Accept: 'application/json',
    },
    credentials: 'include',
  })
  console.log(response)
  if (response.status === 302) {
    return await response.json()
  } else if (response.status !== 302) {
    return await response.json()
  }
}

const authPost = async (
  action: AuthAction | string,
  data?: Record<string, string>,
) => {
  const csrf = await authFetch('csrf')
  return authFetch(action, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    method: 'POST',
    body: new URLSearchParams({
      ...data,
      csrfToken: csrf.csrfToken,
    }).toString(),
  })
}

async function login() {
  const result = await authPost('signin/google', {
    callbackUrl: location.toString(),
  })
  if (result.redirect) {
    location.assign(result.redirect)
  } else {
    throw new Error(result.error)
  }
}

async function logout() {
  await authPost('signout')
}

export const useAuth = () => ({ login, logout })
