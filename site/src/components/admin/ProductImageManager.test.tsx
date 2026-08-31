import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { supabase } from '@/lib/supabaseClient'
import { QueryWrapper } from '@/test/queryWrapper'
import { ProductImageManager } from './ProductImageManager'

vi.mock('@/lib/supabaseClient', () => ({
  supabase: { from: vi.fn(), storage: { from: vi.fn() } },
}))

const IMAGES = [
  { id: 'img1', url: 'https://cdn/a.jpg', sort_order: 0 },
  { id: 'img2', url: 'https://cdn/b.jpg', sort_order: 1 },
]

function mockImages(images: typeof IMAGES = IMAGES) {
  const order = vi.fn().mockResolvedValue({ data: images, error: null })
  const eq = vi.fn().mockReturnValue({ order })
  const select = vi.fn().mockReturnValue({ eq })
  ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ select })
}

describe('ProductImageManager', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders existing photos with move and remove controls', async () => {
    mockImages()
    render(<ProductImageManager productId="p1" />, { wrapper: QueryWrapper })

    expect(await screen.findAllByRole('img')).toHaveLength(2)
    expect(screen.getAllByLabelText('Remove photo')).toHaveLength(2)
  })

  it('disables "move left" on the first photo and "move right" on the last photo', async () => {
    mockImages()
    render(<ProductImageManager productId="p1" />, { wrapper: QueryWrapper })

    await screen.findAllByRole('img')
    const leftButtons = screen.getAllByLabelText('Move photo left')
    const rightButtons = screen.getAllByLabelText('Move photo right')

    expect(leftButtons[0]).toBeDisabled()
    expect(rightButtons[rightButtons.length - 1]).toBeDisabled()
    expect(rightButtons[0]).not.toBeDisabled()
  })

  it('uploads a selected file', async () => {
    mockImages([])
    const upload = vi.fn().mockResolvedValue({ error: null })
    const getPublicUrl = vi.fn().mockReturnValue({ data: { publicUrl: 'https://cdn/new.jpg' } })
    ;(supabase.storage.from as ReturnType<typeof vi.fn>).mockReturnValue({ upload, getPublicUrl })
    const insert = vi.fn().mockResolvedValue({ error: null })
    ;(supabase.from as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ order: vi.fn().mockResolvedValue({ data: [], error: null }) }) }),
      insert,
    }))

    render(<ProductImageManager productId="p1" />, { wrapper: QueryWrapper })

    const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' })
    const input = screen.getByLabelText(/add photos/i).parentElement!.querySelector('input[type="file"]')!
    await userEvent.upload(input as HTMLInputElement, file)

    expect(upload).toHaveBeenCalled()
  })

  it('removes a photo', async () => {
    mockImages()
    const del = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) })
    ;(supabase.from as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ order: vi.fn().mockResolvedValue({ data: IMAGES, error: null }) }) }),
      delete: del,
    }))

    render(<ProductImageManager productId="p1" />, { wrapper: QueryWrapper })
    await screen.findAllByRole('img')

    await userEvent.click(screen.getAllByLabelText('Remove photo')[0])

    expect(del).toHaveBeenCalled()
  })

  it('reorders photos when "move right" is clicked', async () => {
    mockImages()
    const update = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) })
    ;(supabase.from as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ order: vi.fn().mockResolvedValue({ data: IMAGES, error: null }) }) }),
      update,
    }))

    render(<ProductImageManager productId="p1" />, { wrapper: QueryWrapper })
    await screen.findAllByRole('img')

    await userEvent.click(screen.getAllByLabelText('Move photo right')[0])

    expect(update).toHaveBeenCalledWith({ sort_order: 0 })
  })
})
