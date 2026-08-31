import { Route, Routes } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { Home } from '@/routes/Home'
import { Shop } from '@/routes/Shop'
import { ProductDetail } from '@/routes/ProductDetail'
import { NotFound } from '@/routes/NotFound'
import { AdminRouteGuard } from '@/components/admin/AdminRouteGuard'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { AdminLogin } from '@/routes/admin/AdminLogin'
import { AdminDashboard } from '@/routes/admin/AdminDashboard'

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <AdminRouteGuard>
            <AdminLayout />
          </AdminRouteGuard>
        }
      >
        <Route index element={<AdminDashboard />} />
      </Route>
    </Routes>
  )
}
