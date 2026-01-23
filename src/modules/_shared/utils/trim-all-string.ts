export function trimAllString<T>(input: T): T {
  if (typeof input === 'string') {
    return input.trim() as T;
  }

  if (Array.isArray(input)) {
    return input.map(item => trimAllString(item)) as T;
  }

  if (
    input !== null &&
    typeof input === 'object' &&
    !(input instanceof Date)
  ) {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(input)) {
      result[key] = trimAllString(value);
    }

    return result as T;
  }

  return input;
}
