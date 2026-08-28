import { Route, Routes } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { NotFound } from '@/routes/NotFound'

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<h1 className="px-4 py-24 text-center font-display text-3xl">Tee Closet</h1>} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
