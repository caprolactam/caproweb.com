import { createPortal } from 'react-dom'
import { useNavigation } from 'react-router'
import { useSpinDelay } from 'spin-delay'

// https://carbondesignsystem.com/components/loading/accessibility/

export function Spinner() {
  const navigation = useNavigation()
  const showSpinner = useSpinDelay(navigation.state === 'loading', {
    delay: 200,
    minDuration: 300,
  })

  return (
    typeof document !== 'undefined' &&
    showSpinner &&
    createPortal(
      <div className='fixed inset-1/2 translate-x-[calc(-50%_-_1.5rem)] translate-y-[calc(-50%_-_1.5rem)]'>
        <div
          title='ローディング中'
          className='mx-auto size-12 animate-spin rounded-full border-4 border-brand-7 border-t-brand-12 duration-850'
        />
      </div>,
      document.body,
    )
  )
}
