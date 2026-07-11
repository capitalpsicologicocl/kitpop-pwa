import { useState } from 'react'
import { Outlet } from 'react-router-dom'

import Topbar from './Topbar'
import Sidebar from './Sidebar'
import Footer from './Footer'

export default function Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  function openMenu() {
    setIsMenuOpen(true)
  }

  function closeMenu() {
    setIsMenuOpen(false)
  }

  return (
    <>
      <Topbar onOpenMenu={openMenu} />
      <Outlet />
      <Footer />
      <Sidebar isOpen={isMenuOpen} onClose={closeMenu} />
    </>
  )
}