function withTimeout(ms: number) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  return { controller, clear: () => clearTimeout(id) };
}

export default async function baseFetch(
  path?: string,
  options: RequestInit & { baseURL?: string; timeout?: number } = {}
) {
  const {
    baseURL: optionsBaseURL,
    timeout = 20000,
    headers,
    ...rest
  } = options;

  const url = `${optionsBaseURL}${path}`;
  const { controller, clear } = withTimeout(timeout);

  try {
    const response = await fetch(url, {
      ...rest,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        ...headers,
      },
      signal: controller.signal,
    });

    clear();

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        throw new Error(`Received HTML instead of JSON. URL: ${url}`);
      }

      const data = await response.json().catch(() => ({}));
      const message = data?.errorDescription || response.statusText;
      throw new Error(message);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    } else {
      throw new Error(
        `Expected JSON but received ${contentType || 'unknown content type'}`
      );
    }
  } catch (error: unknown) {
    clear();

    if (error instanceof Error) {
      console.error('baseFetch error:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        url: url,
      });

      if (error.name === 'AbortError') {
        throw new Error('Request timed out');
      }
    } else {
      console.error('baseFetch unknown error:', error);
    }

    throw error;
  }
}
