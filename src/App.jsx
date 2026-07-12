import { BrowserRouter, Navigate, Routes, Route, useParams } from 'react-router-dom'

import Layout from './components/layout/Layout'

import Home from './pages/Home'
import Categories from './pages/Categories'
import Category from './pages/Category'
import Activity from './pages/Activity'
import SearchResults from './pages/SearchResults'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Favorites from './pages/Favorites'
import Journal from './pages/Journal'
import InteractiveHub from './pages/interactive/InteractiveHub'
import InteractiveSurveys from './pages/interactive/InteractiveSurveys'
import InteractiveLive from './pages/interactive/InteractiveLive'
import ParticipantJoin from './pages/interactive/ParticipantJoin'
import WorkshopEditor from './pages/interactive/WorkshopEditor'
import Workshops from './pages/workshops/Workshops'
import WorkshopSummary from './pages/workshops/WorkshopSummary'

function RedirectLegacyWorkshop() {
  const { id } = useParams()
  return <Navigate to={`/talleres/${id}`} replace />
}

function RedirectLegacyWorkshopSummary() {
  const { id } = useParams()
  return <Navigate to={`/talleres/${id}/resumen`} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/p/:code" element={<ParticipantJoin />} />

        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/categorias" element={<Categories />} />
          <Route path="/categoria/:slug" element={<Category />} />
          <Route path="/actividad/:slug" element={<Activity />} />
          <Route path="/buscar" element={<SearchResults />} />
          <Route path="/taller" element={<Navigate to="/talleres" replace />} />
          <Route path="/talleres" element={<Workshops />} />
          <Route path="/talleres/:id" element={<WorkshopEditor />} />
          <Route path="/talleres/:id/resumen" element={<WorkshopSummary />} />
          <Route path="/interactivo/talleres" element={<Navigate to="/talleres" replace />} />
          <Route path="/interactivo/talleres/:id/resumen" element={<RedirectLegacyWorkshopSummary />} />
          <Route path="/interactivo/talleres/:id" element={<RedirectLegacyWorkshop />} />
          <Route path="/interactivo" element={<InteractiveHub />} />
          <Route path="/interactivo/encuestas" element={<InteractiveSurveys />} />
          <Route path="/interactivo/en-vivo" element={<InteractiveLive />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />
          <Route path="/perfil" element={<Profile />} />
          <Route path="/favoritos" element={<Favorites />} />
          <Route path="/bitacora" element={<Journal />} />
          <Route path="/espacio-interactivo" element={<Navigate to="/interactivo" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
