import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, type RenderResult } from 'vitest-browser-react'
import { type Locator, userEvent } from 'vitest/browser'
import { UserAuthForm } from './user-auth-form'

const FORM_MESSAGES = {
  emailEmpty: '请输入账号（邮箱）',
  emailInvalid: '账号格式不正确',
  passwordEmpty: '请输入密码',
} as const

const navigate = vi.fn()
const setUserMock = vi.fn()
const setAccessTokenMock = vi.fn()
const apiPostMock = vi.fn()

vi.mock('@/stores/auth-store', () => ({
  useAuthStore: () => ({
    auth: {
      setUser: setUserMock,
      setAccessToken: setAccessTokenMock,
    },
  }),
}))

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()
  return {
    ...actual,
    useNavigate: () => navigate,
    Link: ({
      children,
      to,
      className,
      ...rest
    }: {
      children?: React.ReactNode
      to: string
      className?: string
    }) => (
      <a href={to} className={className} {...rest}>
        {children}
      </a>
    ),
  }
})

vi.mock('@/lib/api', () => ({
  api: {
    post: (...args: unknown[]) => apiPostMock(...args),
  },
}))

describe('UserAuthForm', () => {
  describe('Rendering', () => {
    let screen: RenderResult
    let emailInput: Locator
    let passwordInput: Locator
    let signInButton: Locator

    beforeEach(async () => {
      vi.clearAllMocks()
      screen = await render(<UserAuthForm />)
      emailInput = screen.getByRole('textbox', { name: /账号/ })
      passwordInput = screen.getByLabelText(/密码/)
      signInButton = screen.getByRole('button', { name: /登录/ })
    })

    it('renders fields and submit button', async () => {
      await expect.element(emailInput).toBeInTheDocument()
      await expect.element(passwordInput).toBeInTheDocument()
      await expect.element(signInButton).toBeInTheDocument()
    })

    it('shows validation messages when submitting empty form', async () => {
      await userEvent.click(signInButton)

      await expect
        .element(screen.getByText(FORM_MESSAGES.emailEmpty))
        .toBeInTheDocument()
      await expect
        .element(screen.getByText(FORM_MESSAGES.passwordEmpty))
        .toBeInTheDocument()
    })

    it('authenticates and navigates to default route on success', async () => {
      apiPostMock.mockResolvedValueOnce({
        data: {
          accessToken: 'jwt-token',
          user: {
            id: 'u1',
            account: 'admin@bartender.ai',
            role: 'admin',
            isDevice: false,
          },
        },
      })

      await userEvent.fill(emailInput, 'admin@bartender.ai')
      await userEvent.fill(passwordInput, 'admin12345')

      await userEvent.click(signInButton)

      await vi.waitFor(() => expect(setUserMock).toHaveBeenCalledOnce())
      expect(setUserMock).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'u1',
          account: 'admin@bartender.ai',
          role: 'admin',
          isDevice: false,
        })
      )
      expect(setAccessTokenMock).toHaveBeenCalledWith('jwt-token')

      await vi.waitFor(() =>
        expect(navigate).toHaveBeenCalledWith({ to: '/', replace: true })
      )
    })
  })

  it('navigates to redirectTo when provided', async () => {
    vi.clearAllMocks()
    apiPostMock.mockResolvedValueOnce({
      data: {
        accessToken: 'jwt-token',
        user: {
          id: 'u1',
          account: 'admin@bartender.ai',
          role: 'admin',
          isDevice: false,
        },
      },
    })

    const { getByRole, getByLabelText } = await render(
      <UserAuthForm redirectTo='/settings' />
    )

    await userEvent.fill(getByRole('textbox', { name: /账号/ }), 'a@b.com')
    await userEvent.fill(getByLabelText(/密码/), '1234567')

    await userEvent.click(getByRole('button', { name: /登录/ }))

    await vi.waitFor(() => expect(setUserMock).toHaveBeenCalledOnce())
    expect(setAccessTokenMock).toHaveBeenCalledOnce()

    await vi.waitFor(() =>
      expect(navigate).toHaveBeenCalledWith({
        to: '/settings',
        replace: true,
      })
    )
  })

  it('shows error on 401', async () => {
    vi.clearAllMocks()
    apiPostMock.mockRejectedValueOnce({
      response: { status: 401 },
    })

    const { getByRole, getByLabelText, getByText } = await render(
      <UserAuthForm />
    )

    await userEvent.fill(getByRole('textbox', { name: /账号/ }), 'a@b.com')
    await userEvent.fill(getByLabelText(/密码/), 'wrong')

    await userEvent.click(getByRole('button', { name: /登录/ }))

    await vi.waitFor(() =>
      expect.element(getByText('账号或密码错误')).toBeInTheDocument()
    )
  })
})
