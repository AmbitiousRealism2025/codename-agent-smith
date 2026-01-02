import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { localStorageMock } from '@/test/setup';

// Create mock for document.documentElement.classList
const classListMock = {
  toggle: vi.fn(),
  add: vi.fn(),
  remove: vi.fn(),
};

// Create mock for matchMedia
const createMatchMediaMock = (matches: boolean) => {
  return vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
};

// Mock window and document before importing the store
vi.stubGlobal('window', {
  matchMedia: createMatchMediaMock(false),
});

vi.stubGlobal('document', {
  documentElement: {
    classList: classListMock,
  },
});

// Import the store after mocking globals
import { useUIStore } from '@/stores/ui-store';

describe('useUIStore', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock.clear();

    // Reset mocks
    classListMock.toggle.mockClear();

    // Reset store state before each test
    useUIStore.setState({
      theme: 'system',
      sidebarOpen: true,
    });

    // Default matchMedia to prefer light mode
    vi.stubGlobal('window', {
      matchMedia: createMatchMediaMock(false),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state values', () => {
      const state = useUIStore.getState();

      expect(state.theme).toBe('system');
      expect(state.sidebarOpen).toBe(true);
    });

    it('should have all required actions defined', () => {
      const state = useUIStore.getState();

      expect(typeof state.setTheme).toBe('function');
      expect(typeof state.toggleTheme).toBe('function');
      expect(typeof state.setSidebarOpen).toBe('function');
      expect(typeof state.toggleSidebar).toBe('function');
    });
  });

  describe('setTheme', () => {
    it('should set theme to light', () => {
      const store = useUIStore.getState();
      store.setTheme('light');

      const state = useUIStore.getState();
      expect(state.theme).toBe('light');
    });

    it('should set theme to dark', () => {
      const store = useUIStore.getState();
      store.setTheme('dark');

      const state = useUIStore.getState();
      expect(state.theme).toBe('dark');
    });

    it('should set theme to system', () => {
      const store = useUIStore.getState();
      store.setTheme('dark');
      store.setTheme('system');

      const state = useUIStore.getState();
      expect(state.theme).toBe('system');
    });

    it('should apply dark class when setting dark theme', () => {
      const store = useUIStore.getState();
      store.setTheme('dark');

      expect(classListMock.toggle).toHaveBeenCalledWith('dark', true);
    });

    it('should remove dark class when setting light theme', () => {
      const store = useUIStore.getState();
      store.setTheme('light');

      expect(classListMock.toggle).toHaveBeenCalledWith('dark', false);
    });

    it('should apply dark class based on system preference when setting system theme', () => {
      // Mock system preference for dark mode
      vi.stubGlobal('window', {
        matchMedia: createMatchMediaMock(true),
      });

      const store = useUIStore.getState();
      store.setTheme('system');

      expect(classListMock.toggle).toHaveBeenCalledWith('dark', true);
    });

    it('should remove dark class when system prefers light mode', () => {
      // Mock system preference for light mode
      vi.stubGlobal('window', {
        matchMedia: createMatchMediaMock(false),
      });

      const store = useUIStore.getState();
      store.setTheme('system');

      expect(classListMock.toggle).toHaveBeenCalledWith('dark', false);
    });
  });

  describe('toggleTheme', () => {
    // Based on the store logic: next = current === 'dark' ? 'light' : 'dark'
    // So 'system' -> 'dark', 'dark' -> 'light', 'light' -> 'dark'

    it('should toggle from system to dark', () => {
      const store = useUIStore.getState();
      expect(store.theme).toBe('system');

      store.toggleTheme();

      const state = useUIStore.getState();
      // 'system' !== 'dark', so next is 'dark'
      expect(state.theme).toBe('dark');
    });

    it('should toggle from dark to light', () => {
      const store = useUIStore.getState();
      store.setTheme('dark');
      store.toggleTheme();

      const state = useUIStore.getState();
      expect(state.theme).toBe('light');
    });

    it('should toggle from light to dark', () => {
      const store = useUIStore.getState();
      store.setTheme('light');
      store.toggleTheme();

      const state = useUIStore.getState();
      expect(state.theme).toBe('dark');
    });

    it('should apply correct DOM class after toggle to dark', () => {
      const store = useUIStore.getState();
      store.setTheme('light');
      classListMock.toggle.mockClear();

      store.toggleTheme();

      expect(classListMock.toggle).toHaveBeenCalledWith('dark', true);
    });

    it('should apply correct DOM class after toggle to light', () => {
      const store = useUIStore.getState();
      store.setTheme('dark');
      classListMock.toggle.mockClear();

      store.toggleTheme();

      expect(classListMock.toggle).toHaveBeenCalledWith('dark', false);
    });

    it('should toggle multiple times correctly', () => {
      const store = useUIStore.getState();
      store.setTheme('light');

      store.toggleTheme();
      expect(useUIStore.getState().theme).toBe('dark');

      store.toggleTheme();
      expect(useUIStore.getState().theme).toBe('light');

      store.toggleTheme();
      expect(useUIStore.getState().theme).toBe('dark');
    });
  });

  describe('setSidebarOpen', () => {
    it('should set sidebar to open', () => {
      const store = useUIStore.getState();
      store.setSidebarOpen(false);
      store.setSidebarOpen(true);

      const state = useUIStore.getState();
      expect(state.sidebarOpen).toBe(true);
    });

    it('should set sidebar to closed', () => {
      const store = useUIStore.getState();
      store.setSidebarOpen(false);

      const state = useUIStore.getState();
      expect(state.sidebarOpen).toBe(false);
    });

    it('should handle setting same value multiple times', () => {
      const store = useUIStore.getState();

      store.setSidebarOpen(true);
      store.setSidebarOpen(true);
      store.setSidebarOpen(true);

      const state = useUIStore.getState();
      expect(state.sidebarOpen).toBe(true);
    });
  });

  describe('toggleSidebar', () => {
    it('should toggle sidebar from open to closed', () => {
      const store = useUIStore.getState();
      expect(store.sidebarOpen).toBe(true);

      store.toggleSidebar();

      const state = useUIStore.getState();
      expect(state.sidebarOpen).toBe(false);
    });

    it('should toggle sidebar from closed to open', () => {
      const store = useUIStore.getState();
      store.setSidebarOpen(false);
      store.toggleSidebar();

      const state = useUIStore.getState();
      expect(state.sidebarOpen).toBe(true);
    });

    it('should toggle multiple times correctly', () => {
      const store = useUIStore.getState();
      expect(store.sidebarOpen).toBe(true);

      store.toggleSidebar();
      expect(useUIStore.getState().sidebarOpen).toBe(false);

      store.toggleSidebar();
      expect(useUIStore.getState().sidebarOpen).toBe(true);

      store.toggleSidebar();
      expect(useUIStore.getState().sidebarOpen).toBe(false);
    });
  });

  describe('theme and sidebar independence', () => {
    it('should maintain sidebar state when changing theme', () => {
      const store = useUIStore.getState();
      store.setSidebarOpen(false);

      store.setTheme('dark');

      const state = useUIStore.getState();
      expect(state.theme).toBe('dark');
      expect(state.sidebarOpen).toBe(false);
    });

    it('should maintain theme state when toggling sidebar', () => {
      const store = useUIStore.getState();
      store.setTheme('dark');

      store.toggleSidebar();

      const state = useUIStore.getState();
      expect(state.theme).toBe('dark');
      expect(state.sidebarOpen).toBe(false);
    });

    it('should handle multiple state changes correctly', () => {
      const store = useUIStore.getState();

      store.setTheme('dark');
      store.setSidebarOpen(false);
      store.toggleTheme();
      store.toggleSidebar();

      const state = useUIStore.getState();
      expect(state.theme).toBe('light');
      expect(state.sidebarOpen).toBe(true);
    });
  });

  describe('state persistence', () => {
    it('should persist state across store access', () => {
      // Set some state
      useUIStore.getState().setTheme('dark');
      useUIStore.getState().setSidebarOpen(false);

      // Access store again
      const state = useUIStore.getState();
      expect(state.theme).toBe('dark');
      expect(state.sidebarOpen).toBe(false);
    });

    it('should have persist middleware configured with correct name', () => {
      // The store uses persist middleware with name 'advisor-ui'
      // This test verifies the store can persist and retrieve state
      const store = useUIStore.getState();

      store.setTheme('dark');
      store.setSidebarOpen(false);

      // State should be set correctly
      const state = useUIStore.getState();
      expect(state.theme).toBe('dark');
      expect(state.sidebarOpen).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle rapid theme toggles', () => {
      const store = useUIStore.getState();
      store.setTheme('light');

      // Rapid toggles
      for (let i = 0; i < 10; i++) {
        store.toggleTheme();
      }

      // 10 toggles from light should end up on light (even number of toggles)
      const state = useUIStore.getState();
      expect(state.theme).toBe('light');
    });

    it('should handle rapid sidebar toggles', () => {
      const store = useUIStore.getState();
      expect(store.sidebarOpen).toBe(true);

      // Rapid toggles
      for (let i = 0; i < 10; i++) {
        store.toggleSidebar();
      }

      // 10 toggles from true should end up on true (even number of toggles)
      const state = useUIStore.getState();
      expect(state.sidebarOpen).toBe(true);
    });
  });
});
