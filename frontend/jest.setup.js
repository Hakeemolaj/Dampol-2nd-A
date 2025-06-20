import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    }
  },
}))

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock environment variables
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3002'

// Mock fetch globally
global.fetch = jest.fn()

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock scrollTo
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: jest.fn(),
})

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
})

// Mock File and FileReader for file upload tests
global.File = class MockFile {
  constructor(parts, filename, properties) {
    this.parts = parts
    this.name = filename
    this.size = parts.reduce((acc, part) => acc + part.length, 0)
    this.type = properties?.type || ''
    this.lastModified = Date.now()
  }
}

global.FileReader = class MockFileReader {
  constructor() {
    this.readyState = 0
    this.result = null
    this.error = null
    this.onload = null
    this.onerror = null
    this.onabort = null
    this.onloadstart = null
    this.onloadend = null
    this.onprogress = null
  }

  readAsDataURL(file) {
    this.readyState = 2
    this.result = `data:${file.type};base64,${btoa(file.parts.join(''))}`
    if (this.onload) {
      this.onload({ target: this })
    }
  }

  readAsText(file) {
    this.readyState = 2
    this.result = file.parts.join('')
    if (this.onload) {
      this.onload({ target: this })
    }
  }

  abort() {
    this.readyState = 2
    if (this.onabort) {
      this.onabort({ target: this })
    }
  }
}

// Mock XMLHttpRequest for file upload tests
global.XMLHttpRequest = jest.fn().mockImplementation(() => ({
  open: jest.fn(),
  send: jest.fn(),
  setRequestHeader: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  upload: {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
  readyState: 4,
  status: 200,
  statusText: 'OK',
  responseText: '{"success": true}',
  response: '{"success": true}',
  abort: jest.fn(),
}))

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = jest.fn(() => 'mocked-url')
global.URL.revokeObjectURL = jest.fn()

// Mock crypto for UUID generation
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: jest.fn(() => 'mocked-uuid-1234-5678-9012'),
    getRandomValues: jest.fn((arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256)
      }
      return arr
    }),
  },
})

// Global test utilities
global.testUtils = {
  // Create mock component props
  createMockProps: (overrides = {}) => ({
    ...overrides,
  }),

  // Create mock API response
  createMockApiResponse: (data, success = true) => ({
    success,
    data,
    message: success ? 'Success' : 'Error',
  }),

  // Wait for async operations
  waitFor: (ms = 0) => new Promise(resolve => setTimeout(resolve, ms)),

  // Mock fetch response
  mockFetchResponse: (data, status = 200) => {
    global.fetch.mockResolvedValueOnce({
      ok: status >= 200 && status < 300,
      status,
      json: async () => data,
      text: async () => JSON.stringify(data),
    })
  },

  // Mock fetch error
  mockFetchError: (error = new Error('Network error')) => {
    global.fetch.mockRejectedValueOnce(error)
  },

  // Reset all mocks
  resetAllMocks: () => {
    jest.clearAllMocks()
    global.fetch.mockClear()
    localStorageMock.getItem.mockClear()
    localStorageMock.setItem.mockClear()
    localStorageMock.removeItem.mockClear()
    localStorageMock.clear.mockClear()
    sessionStorageMock.getItem.mockClear()
    sessionStorageMock.setItem.mockClear()
    sessionStorageMock.removeItem.mockClear()
    sessionStorageMock.clear.mockClear()
  },
}

// Setup and teardown
beforeEach(() => {
  // Reset mocks before each test
  jest.clearAllMocks()
})

afterEach(() => {
  // Clean up after each test
  jest.restoreAllMocks()
})
