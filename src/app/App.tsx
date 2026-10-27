import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { UpdateNotice } from '../components/UpdateNotice'
import { GamePage } from '../pages/GamePage'
import { Lobby } from '../pages/Lobby'
import { NotFound } from '../pages/NotFound'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route path="/games/:slug" element={<GamePage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <UpdateNotice />
    </BrowserRouter>
  )
}
