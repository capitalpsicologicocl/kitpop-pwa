import Hero from '../components/home/Hero'
import CategoryGrid from '../components/home/CategoryGrid'
import QuickGrid from '../components/home/QuickGrid'
import GuestSignupCTA from '../components/auth/GuestSignupCTA'
import { CategoryGridSkeleton } from '../components/ui/Skeleton'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <main id="home" className="fade-in">
        <Hero />
        <p className="sec-lbl">Explora por categoría</p>
        <CategoryGridSkeleton />
      </main>
    )
  }

  return (
    <main id="home" className="fade-in">
      <Hero />
      <CategoryGrid />
      {user ? <QuickGrid /> : <GuestSignupCTA variant="default" />}
    </main>
  )
}
