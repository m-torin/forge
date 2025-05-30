import { useEffect, useState } from 'react'

export const useThemeMode = () => {
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    if (localStorage.theme === 'is-darkmode') {
      toDark()
    } else {
      toLight()
    }
  }, [])

  const toDark = () => {
    setIsDarkMode(true)
    const root = document.querySelector('html')
    if (!root) return
    !root.classList.contains('dark') && root.classList.add('dark')
    localStorage.theme = 'is-darkmode'
  }

  const toLight = () => {
    setIsDarkMode(false)
    const root = document.querySelector('html')
    if (!root) return
    root.classList.remove('dark')
    localStorage.theme = 'is-lightmode'
  }

  function _toogleDarkMode() {
    if (localStorage.theme === 'is-lightmode') {
      toDark()
    } else {
      toLight()
    }
  }

  return {
    isDarkMode,
    toDark,
    toLight,
    _toogleDarkMode,
  }
}
