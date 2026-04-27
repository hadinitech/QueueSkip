import { useEffect, useState } from 'react'

export type AppRoute =
  | 'auth-forgot-password'
  | 'auth-login'
  | 'auth-signup'
  | 'contact-us'
  | 'for-businesses'
  | 'customer'
  | 'customer-dashboard'
  | 'admin-dashboard'
  | 'how-it-works'
  | 'privacy-policy'
  | 'super-admin-dashboard'
  | 'terms-of-service'

function getRouteFromPath(pathname: string): AppRoute {
  const normalizedPathname = pathname.split('?')[0]

  if (normalizedPathname === '/forgot-password') {
    return 'auth-forgot-password'
  }

  if (normalizedPathname === '/login') {
    return 'auth-login'
  }

  if (normalizedPathname === '/signup') {
    return 'auth-signup'
  }

  if (normalizedPathname === '/contact-us') {
    return 'contact-us'
  }

  if (normalizedPathname === '/for-businesses') {
    return 'for-businesses'
  }

  if (normalizedPathname === '/how-it-works') {
    return 'how-it-works'
  }

  if (normalizedPathname === '/privacy-policy') {
    return 'privacy-policy'
  }

  if (normalizedPathname === '/terms-of-service') {
    return 'terms-of-service'
  }

  if (normalizedPathname === '/admin/dashboard') {
    return 'admin-dashboard'
  }

  if (normalizedPathname === '/customer/dashboard') {
    return 'customer-dashboard'
  }

  if (normalizedPathname === '/super-admin/dashboard') {
    return 'super-admin-dashboard'
  }

  if (normalizedPathname === '/' || normalizedPathname === '/customer') {
    return 'customer'
  }

  return 'customer'
}

export function useAppRoute() {
  const [route, setRoute] = useState<AppRoute>(() => {
    // Handle GitHub Pages 404 redirect with ?p= query parameter
    const params = new URLSearchParams(window.location.search)
    const redirectPath = params.get('p')
    
    if (redirectPath) {
      // Clean up the URL by removing the query parameter
      window.history.replaceState({}, '', redirectPath)
      return getRouteFromPath(redirectPath)
    }
    
    return getRouteFromPath(window.location.pathname)
  })

  useEffect(() => {
    const handlePopState = () => {
      setRoute(getRouteFromPath(window.location.pathname))
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  function navigateTo(pathname: string) {
    window.history.pushState({}, '', pathname)
    setRoute(getRouteFromPath(pathname))
  }

  return { navigateTo, route }
}
