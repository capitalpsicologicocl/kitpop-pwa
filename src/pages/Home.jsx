import Hero from '../components/home/Hero'
import CategoryGrid from '../components/home/CategoryGrid'
import QuickGrid from '../components/home/QuickGrid'

export default function Home() {
  return (
    <main id="home" className="fade-in">
      <Hero />
      <CategoryGrid />
      <QuickGrid />
    </main>
  )
}
