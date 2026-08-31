import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { supabase } from '@/lib/supabaseClient'
import { QueryWrapper } from '@/test/queryWrapper'
import { ProductForm } from './ProductForm'

vi.mock('@/lib/supabaseClient', () => ({
  supabase: { from: vi.fn() },
}))

function mockCategories() {
  const order = vi.fn().mockResolvedValue({
    data: [
      { id: 'c1', slug: 'blazers', label: 'Blazers', sort_order: 0 },
      { id: 'c2', slug: 'tops', label: 'Tops', sort_order: 1 },
    ],
    error: null,
  })
  const select = vi.fn().mockReturnValue({ order })
  ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ select })
}

describe('ProductForm', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows a validation error and does not call onSubmit when required fields are missing', async () => {
    mockCategories()
    const onSubmit = vi.fn()
    render(<ProductForm onSubmit={onSubmit} isSubmitting={false} submitLabel="Create" />, { wrapper: QueryWrapper })

    await userEvent.click(screen.getByRole('button', { name: /create/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/name is required/i)
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits a fully-filled form with the correct shape', async () => {
    mockCategories()
    const onSubmit = vi.fn()
    render(<ProductForm onSubmit={onSubmit} isSubmitting={false} submitLabel="Create" />, { wrapper: QueryWrapper })

    await userEvent.type(screen.getByLabelText(/^name$/i), 'Camel Wide-Leg Trousers')
    await userEvent.selectOptions(await screen.findByLabelText(/category/i), 'blazers')
    await userEvent.type(screen.getByLabelText(/price/i), '2800')
    await userEvent.click(screen.getByLabelText('30'))
    await userEvent.click(screen.getByLabelText('32'))
    await userEvent.type(screen.getByLabelText(/colors/i), 'Camel, Sand')
    await userEvent.click(screen.getByRole('button', { name: /create/i }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Camel Wide-Leg Trousers',
        category: 'blazers',
        priceKsh: 2800,
        sizes: [30, 32],
        colors: ['Camel', 'Sand'],
        availability: 'in-stock',
        isNew: false,
        isFeatured: false,
      }),
    )
  })

  it('pre-fills fields from initialValues for editing', async () => {
    mockCategories()
    render(
      <ProductForm
        initialValues={{
          name: 'Espresso Tailored Blazer',
          category: 'blazers',
          priceKsh: 3500,
          sizes: [32, 34],
          colors: ['Espresso Black'],
          availability: 'in-stock',
          isNew: true,
          isFeatured: true,
        }}
        onSubmit={vi.fn()}
        isSubmitting={false}
        submitLabel="Save Changes"
      />,
      { wrapper: QueryWrapper },
    )

    expect(screen.getByLabelText(/^name$/i)).toHaveValue('Espresso Tailored Blazer')
    expect(screen.getByLabelText(/price/i)).toHaveValue(3500)
    expect(screen.getByLabelText('32')).toBeChecked()
    expect(screen.getByLabelText(/^new$/i)).toBeChecked()
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument()
  })
})
