import { Suspense, lazy, useEffect, useState } from 'react'
import { AppShell } from './components/shared/AppShell'
import { ThemeToggle } from './components/shared/ThemeToggle'
import { TopNav } from './components/shared/TopNav'
import { FullPageLoader } from './components/ui/FullPageLoader'
import { useAppRoute } from './hooks/useAppRoute'
import { useAuthSession } from './hooks/useAuthSession'
import { CustomerPage } from './pages/customer/CustomerPage'
import { logout } from './services/supabase/authService'
import { withBasePath } from './utils/appPath'

const AdminDashboard = lazy(() =>
  import('./pages/admin/AdminDashboard').then((module) => ({
    default: module.AdminDashboard,
  })),
)
const ForgotPasswordPage = lazy(() =>
  import('./pages/auth/ForgotPasswordPage').then((module) => ({
    default: module.ForgotPasswordPage,
  })),
)
const LoginPage = lazy(() =>
  import('./pages/auth/LoginPage').then((module) => ({
    default: module.LoginPage,
  })),
)
const SignupPage = lazy(() =>
  import('./pages/auth/SignupPage').then((module) => ({
    default: module.SignupPage,
  })),
)
const ContactUsPage = lazy(() =>
  import('./pages/info/ContactUsPage').then((module) => ({
    default: module.ContactUsPage,
  })),
)
const ForBusinessesPage = lazy(() =>
  import('./pages/info/ForBusinessesPage').then((module) => ({
    default: module.ForBusinessesPage,
  })),
)
const HowItWorksPage = lazy(() =>
  import('./pages/info/HowItWorksPage').then((module) => ({
    default: module.HowItWorksPage,
  })),
)
const InfoPage = lazy(() =>
  import('./pages/info/InfoPage').then((module) => ({
    default: module.InfoPage,
  })),
)
const SuperAdminDashboard = lazy(() =>
  import('./pages/super-admin/SuperAdminDashboard').then((module) => ({
    default: module.SuperAdminDashboard,
  })),
)

function App() {
  const { navigateTo, route } = useAppRoute()
  const { isAuthenticated, isLoadingSession, profile, session } =
    useAuthSession()
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false)
  const dashboardPath =
    profile?.role === 'customer'
      ? '/customer/dashboard'
      : profile?.role === 'business'
        ? '/admin/dashboard'
        : profile?.role === 'super_admin'
          ? '/super-admin/dashboard'
          : null
  const showWorkspaceMenuButton =
    isAuthenticated &&
    (route === 'customer-dashboard' ||
      route === 'admin-dashboard' ||
      route === 'super-admin-dashboard')
  const handleLogout = () => {
    setIsWorkspaceMenuOpen(false)
    void logout().finally(() => {
      window.location.replace(withBasePath('/customer'))
    })
  }

  useEffect(() => {
    setIsWorkspaceMenuOpen(false)
  }, [isAuthenticated, route])

  useEffect(() => {
    if (isLoadingSession) {
      return
    }

    if (route === 'customer-dashboard' && (!isAuthenticated || profile?.role !== 'customer')) {
      navigateTo('/login?reason=customer')
      return
    }

    if (route === 'admin-dashboard' && (!isAuthenticated || profile?.role !== 'business')) {
      navigateTo('/login?reason=business')
      return
    }

    if (
      route === 'super-admin-dashboard' &&
      (!isAuthenticated || profile?.role !== 'super_admin')
    ) {
      navigateTo('/login?reason=super-admin')
      return
    }

    if (!isAuthenticated || !profile) {
      return
    }

    if (profile.role === 'customer' && route === 'admin-dashboard') {
      navigateTo('/customer/dashboard')
    }

    if (profile.role === 'customer' && route === 'super-admin-dashboard') {
      navigateTo('/customer/dashboard')
    }

    if (profile.role === 'business' && route === 'customer-dashboard') {
      navigateTo('/admin/dashboard')
    }

    if (profile.role === 'super_admin' && route === 'customer-dashboard') {
      navigateTo('/super-admin/dashboard')
    }

    if (profile.role !== 'super_admin' && route === 'super-admin-dashboard') {
      navigateTo(dashboardPath ?? '/customer')
    }
  }, [dashboardPath, isAuthenticated, isLoadingSession, navigateTo, profile, route])

  return (
    <AppShell>
      <TopNav
        dashboardPath={isAuthenticated ? dashboardPath : null}
        isAuthenticated={isAuthenticated}
        isMenuOpen={isWorkspaceMenuOpen}
        onLogout={handleLogout}
        onMenuToggle={() => setIsWorkspaceMenuOpen((isOpen) => !isOpen)}
        onNavigate={navigateTo}
        showMenuButton={showWorkspaceMenuButton}
        user={session?.user ?? null}
      />
      <Suspense fallback={<FullPageLoader />}>
        {route === 'auth-login' && <LoginPage onNavigate={navigateTo} />}
        {route === 'auth-signup' && <SignupPage onNavigate={navigateTo} />}
        {route === 'auth-forgot-password' && (
          <ForgotPasswordPage onNavigate={navigateTo} />
        )}
        {route === 'contact-us' && <ContactUsPage />}
        {route === 'for-businesses' && <ForBusinessesPage />}
        {route === 'customer' && (
          <CustomerPage
            isAuthenticated={isAuthenticated}
            isMobileNavOpen={isWorkspaceMenuOpen}
            mode="public"
            onCloseMobileNav={() => setIsWorkspaceMenuOpen(false)}
            onLogout={handleLogout}
            onNavigate={navigateTo}
            profileLocation={profile?.location ?? null}
            profileRole={profile?.role ?? null}
            user={session?.user ?? null}
          />
        )}
        {route === 'how-it-works' && <HowItWorksPage />}
        {route === 'privacy-policy' && (
          <InfoPage
            ctaHref="mailto:support@queueskip.co.za"
            ctaLabel="Contact support"
            description="QueueSkip respects your privacy. We only use the account, queue, and location information needed to help customers find nearby queues and help businesses manage service flow."
            eyebrow="Legal"
            title="Privacy Policy"
          />
        )}
        {route === 'customer-dashboard' &&
          (isAuthenticated && profile?.role === 'customer' ? (
            <CustomerPage
              isAuthenticated={isAuthenticated}
              isMobileNavOpen={isWorkspaceMenuOpen}
              mode="dashboard"
              onCloseMobileNav={() => setIsWorkspaceMenuOpen(false)}
              onLogout={handleLogout}
              onNavigate={navigateTo}
              profileLocation={profile?.location ?? null}
              profileRole={profile?.role ?? null}
              user={session?.user ?? null}
            />
          ) : null)}
        {route === 'admin-dashboard' &&
          (isAuthenticated &&
          profile?.role === 'business' ? (
            <AdminDashboard
              isMobileNavOpen={isWorkspaceMenuOpen}
              onCloseMobileNav={() => setIsWorkspaceMenuOpen(false)}
              onLogout={handleLogout}
              user={session?.user ?? null}
            />
          ) : null)}
        {route === 'super-admin-dashboard' &&
          (isAuthenticated && profile?.role === 'super_admin' ? (
            <SuperAdminDashboard user={session?.user ?? null} />
          ) : null)}
        {route === 'terms-of-service' && (
          <InfoPage
            ctaHref="mailto:support@queueskip.co.za"
            ctaLabel="Request full terms"
            description="By using QueueSkip, customers and businesses agree to use the platform responsibly, provide accurate information, and follow applicable service and queue-management rules."
            eyebrow="Legal"
            title="Terms of Service"
          />
        )}
      </Suspense>
      <ThemeToggle />
    </AppShell>
  )
}

export default App
