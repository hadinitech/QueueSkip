import { AppLoader } from './AppLoader'

export function FullPageLoader() {
  return (
    <section className="grid min-h-[calc(100vh-5rem)] w-full place-items-center px-5 py-8 sm:py-12">
      <AppLoader />
    </section>
  )
}
