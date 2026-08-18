import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import SilhouetteQuiz from './SilhouetteQuiz.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SilhouetteQuiz />
  </StrictMode>,
)
