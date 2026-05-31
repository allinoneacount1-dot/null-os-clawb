// src/lib/api-error.ts — API error handling
export class ApiError extends Error {
  statusCode: number;
  code: string;
  details?: unknown;

  constructor(message: string, statusCode = 500, code = "UNKNOWN_ERROR", details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export function handleApiError(error: unknown): { message: string; code: string; statusCode: number } {
  if (error instanceof ApiError) {
    return { message: error.message, code: error.code, statusCode: error.statusCode };
  }
  if (error instanceof Error) {
    // Network errors
    if (error.message.includes("fetch") || error.message.includes("network")) {
      return { message: "CONNECTION LOST — check your network", code: "NETWORK_ERROR", statusCode: 0 };
    }
    // Timeout
    if (error.message.includes("timeout")) {
      return { message: "REQUEST TIMED OUT — server unresponsive", code: "TIMEOUT", statusCode: 408 };
    }
    return { message: error.message, code: "UNKNOWN_ERROR", statusCode: 500 };
  }
  return { message: "An unexpected error occurred", code: "UNKNOWN_ERROR", statusCode: 500 };
}

interface RequestOptions extends RequestInit {
  timeout?: number;
  retries?: number;
}

export async function createApiClient(url: string, options: RequestOptions = {}): Promise<Response> {
  const { timeout = 10000, retries = 1, ...fetchOptions } = options;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
        credentials: "include",
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const body = await response.json().catch(() => ({})) as { error?: string; message?: string };
        throw new ApiError(
          body.error || body.message || `HTTP ${response.status}`,
          response.status,
          body.error ? "API_ERROR" : `HTTP_${response.status}`,
        );
      }

      return response;
    } catch (error) {
      if (attempt === retries) throw error;
      // Wait before retry (exponential backoff)
      await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 1000));
    }
  }

  throw new ApiError("Max retries exceeded", 500, "MAX_RETRIES");
}
