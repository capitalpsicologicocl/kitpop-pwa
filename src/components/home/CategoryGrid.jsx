import { categories } from '../../data/categories'
import CategoryCard from './CategoryCard'

export default function CategoryGrid() {
  return (
    <>
      <p className="sec-lbl">Explora por categoría</p>

      <section className="cats-grid">
        {categories.map((category) => (
          <CategoryCard key={category.slug} category={category} />
        ))}
      </section>
    </>
  )
}