import { useRef, useState } from 'react'

export function useAnimatedModalClose(onClose: () => void, duration = 220) {
  const timeoutRef = useRef<number | null>(null)
  const [isClosing, setIsClosing] = useState(false)

  function closeWithAnimation() {
    if (isClosing) {
      return
    }

    setIsClosing(true)

    timeoutRef.current = window.setTimeout(() => {
      onClose()
      setIsClosing(false)
    }, duration)
  }

  function resetClosingState() {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    setIsClosing(false)
  }

  return {
    isClosing,
    closeWithAnimation,
    resetClosingState,
  }
}