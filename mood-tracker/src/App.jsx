import {BrowserRouter, Routes, Route} from 'react-router-dom'
import './App.css'
import { lazy } from 'react'

const Home = lazy(() => import('./pages/Home'))
const LogMood = lazy(() => import('./pages/LogMood'))
const Journal = lazy(() => import('./pages/Journal'))
const History = lazy(() => import('./pages/History'))

function App() {
  

  return (
   <div>
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/LogMood' element={<LogMood />} />
      <Route path='/Journal' element={<Journal />} />
      <Route path='/History' element={<History />} />
    </Routes>
    </BrowserRouter>
   </div>
  )
}

export default App
