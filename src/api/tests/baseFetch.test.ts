import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import baseFetch from '../baseFetch';

describe('baseFetch', () => {
  const mockFetch = vi.fn();
  const mockAbortController = {
    signal: 'mock-signal',
    abort: vi.fn(),
  };
  const mockSetTimeout = vi.fn();
  const mockClearTimeout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();

    Object.defineProperty(window, 'fetch', {
      writable: true,
      value: mockFetch,
    });
    Object.defineProperty(window, 'AbortController', {
      writable: true,
      value: vi.fn(() => mockAbortController),
    });
    Object.defineProperty(window, 'setTimeout', {
      writable: true,
      value: mockSetTimeout,
    });
    Object.defineProperty(window, 'clearTimeout', {
      writable: true,
      value: mockClearTimeout,
    });

    mockSetTimeout.mockReturnValue('timeout-id');
    mockClearTimeout.mockReturnValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('constructs URL correctly with baseURL and path', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({ data: 'test' }),
    };
    mockFetch.mockResolvedValue(mockResponse);

    await baseFetch('/test-path', { baseURL: 'https://api.example.com' });

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/test-path',
      expect.objectContaining({
        signal: 'mock-signal',
      })
    );
  });

  it('uses default timeout when none specified', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({ data: 'test' }),
    };
    mockFetch.mockResolvedValue(mockResponse);

    await baseFetch('/test');

    expect(mockSetTimeout).toHaveBeenCalledWith(expect.any(Function), 20000);
    expect(mockClearTimeout).toHaveBeenCalledWith('timeout-id');
  });

  it('applies custom timeout when specified', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({ data: 'test' }),
    };
    mockFetch.mockResolvedValue(mockResponse);

    await baseFetch('/test', { timeout: 5000 });

    expect(mockSetTimeout).toHaveBeenCalledWith(expect.any(Function), 5000);
  });

  it('sets default headers correctly', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({ data: 'test' }),
    };
    mockFetch.mockResolvedValue(mockResponse);

    await baseFetch('/test');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      })
    );
  });

  it('merges custom headers with default headers', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({ data: 'test' }),
    };
    mockFetch.mockResolvedValue(mockResponse);

    await baseFetch('/test', { headers: { Authorization: 'Bearer token' } });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          Authorization: 'Bearer token',
        },
      })
    );
  });

  it('handles successful response correctly', async () => {
    const mockData = { data: 'success' };
    const mockResponse = { ok: true, json: () => Promise.resolve(mockData) };
    mockFetch.mockResolvedValue(mockResponse);

    const result = await baseFetch('/test');

    expect(result).toEqual(mockData);
    expect(mockClearTimeout).toHaveBeenCalledWith('timeout-id');
  });

  it('throws error for non-ok response with error description', async () => {
    const mockErrorData = { errorDescription: 'Custom error message' };
    const mockResponse = {
      ok: false,
      statusText: 'Bad Request',
      json: () => Promise.resolve(mockErrorData),
    };
    mockFetch.mockResolvedValue(mockResponse);

    await expect(baseFetch('/test')).rejects.toThrow('Custom error message');
    expect(mockClearTimeout).toHaveBeenCalledWith('timeout-id');
  });

  it('throws error for non-ok response without error description', async () => {
    const mockResponse = {
      ok: false,
      statusText: 'Not Found',
      json: () => Promise.resolve({}),
    };
    mockFetch.mockResolvedValue(mockResponse);

    await expect(baseFetch('/test')).rejects.toThrow('Not Found');
  });

  it('handles timeout errors correctly', async () => {
    const timeoutError = new Error('Request timed out');
    timeoutError.name = 'AbortError';
    mockFetch.mockRejectedValue(timeoutError);

    await expect(baseFetch('/test', { timeout: 1000 })).rejects.toThrow(
      'Request timed out'
    );
    expect(mockClearTimeout).toHaveBeenCalledWith('timeout-id');
  });

  it('handles unknown errors and preserves original error', async () => {
    const originalError = new Error('Network error');
    mockFetch.mockRejectedValue(originalError);

    await expect(baseFetch('/test')).rejects.toThrow('Network error');
    expect(mockClearTimeout).toHaveBeenCalledWith('timeout-id');
  });
});
