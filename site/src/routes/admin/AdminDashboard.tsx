import { AdminProductList } from '@/components/admin/AdminProductList'
import { AdminCategoryManager } from '@/components/admin/AdminCategoryManager'

export function AdminDashboard() {
  return (
    <div>
      <AdminProductList />
      <AdminCategoryManager />
    </div>
  )
}
