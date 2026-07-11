import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Layout from './components/layout/Layout'

import Home from './pages/Home'
import Categories from './pages/Categories'
import Category from './pages/Category'
import Activity from './pages/Activity'
import SearchResults from './pages/SearchResults'
import Workshop from './pages/Workshop'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Favorites from './pages/Favorites'
import Journal from './pages/Journal'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/categorias" element={<Categories />} />
          <Route path="/categoria/:slug" element={<Category />} />
          <Route path="/actividad/:slug" element={<Activity />} />
          <Route path="/buscar" element={<SearchResults />} />
          <Route path="/taller" element={<Workshop />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />
          <Route path="/perfil" element={<Profile />} />
          <Route path="/favoritos" element={<Favorites />} />
          <Route path="/bitacora" element={<Journal />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
