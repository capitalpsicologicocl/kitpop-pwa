import { BrowserRouter, Navigate, Routes, Route, useParams } from 'react-router-dom'

import RequireAuth from './components/auth/RequireAuth'
import Layout from './components/layout/Layout'
import { lazyPage } from './routes/lazyPage'

import Home from './pages/Home'
import Categories from './pages/Categories'
import Category from './pages/Category'
import Activity from './pages/Activity'
import SearchResults from './pages/SearchResults'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'

const Workshops = lazyPage(() => import('./pages/workshops/Workshops'))
const WorkshopEditor = lazyPage(() => import('./pages/interactive/WorkshopEditor'))
const WorkshopSummary = lazyPage(() => import('./pages/workshops/WorkshopSummary'))

const InteractiveHub = lazyPage(() => import('./pages/interactive/InteractiveHub'))
const InteractiveSurveys = lazyPage(() => import('./pages/interactive/InteractiveSurveys'))
const SurveyEditor = lazyPage(() => import('./pages/interactive/SurveyEditor'))
const SurveyResults = lazyPage(() => import('./pages/interactive/SurveyResults'))
const InteractiveLive = lazyPage(() => import('./pages/interactive/InteractiveLive'))
const LiveSessionEditor = lazyPage(() => import('./pages/interactive/LiveSessionEditor'))
const ParticipantJoin = lazyPage(() => import('./pages/interactive/ParticipantJoin'))

const Profile = lazyPage(() => import('./pages/Profile'))
const Favorites = lazyPage(() => import('./pages/Favorites'))
const Journal = lazyPage(() => import('./pages/Journal'))
const Admin = lazyPage(() => import('./pages/Admin'))

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
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />
          <Route path="/recuperar-contrasena" element={<ForgotPassword />} />
          <Route path="/restablecer-contrasena" element={<ResetPassword />} />

          <Route path="/categorias" element={<Categories />} />
          <Route path="/categoria/:slug" element={<Category />} />
          <Route path="/actividad/:slug" element={<Activity />} />
          <Route path="/buscar" element={<SearchResults />} />

          <Route element={<RequireAuth />}>
            <Route path="/taller" element={<Navigate to="/talleres" replace />} />
            <Route path="/talleres" element={<Workshops />} />
            <Route path="/talleres/:id" element={<WorkshopEditor />} />
            <Route path="/talleres/:id/resumen" element={<WorkshopSummary />} />
            <Route path="/interactivo/talleres" element={<Navigate to="/talleres" replace />} />
            <Route path="/interactivo/talleres/:id/resumen" element={<RedirectLegacyWorkshopSummary />} />
            <Route path="/interactivo/talleres/:id" element={<RedirectLegacyWorkshop />} />
            <Route path="/interactivo" element={<InteractiveHub />} />
            <Route path="/interactivo/encuestas" element={<InteractiveSurveys />} />
            <Route path="/interactivo/encuestas/:id" element={<SurveyEditor />} />
            <Route path="/interactivo/encuestas/:id/resultados" element={<SurveyResults />} />
            <Route path="/interactivo/en-vivo" element={<InteractiveLive />} />
            <Route path="/interactivo/en-vivo/:id" element={<LiveSessionEditor />} />
            <Route path="/perfil" element={<Profile />} />
            <Route path="/favoritos" element={<Favorites />} />
            <Route path="/bitacora" element={<Journal />} />
            <Route path="/admin" element={<Admin />} />
          </Route>

          <Route path="/espacio-interactivo" element={<Navigate to="/interactivo" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
