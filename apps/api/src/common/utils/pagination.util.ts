export interface PaginationResult<T> {
  data: T[];
  pagination: {
    nextCursor: string | null;
    hasMore: boolean;
    total?: number;
  };
}

export function encodeCursor(payload: Record<string, any>): string {
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

export function decodeCursor<T = any>(cursor: string): T | null {
  try {
    return JSON.parse(Buffer.from(cursor, 'base64').toString('utf8'));
  } catch {
    return null;
  }
}
