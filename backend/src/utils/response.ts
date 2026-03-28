import { Response } from 'express';

/**
 * Standardized API response helpers
 */
export function sendSuccess(res: Response, data: any, statusCode = 200) {
  res.status(statusCode).json({
    success: true,
    data,
  });
}

export function sendCreated(res: Response, data: any) {
  sendSuccess(res, data, 201);
}

export function sendError(res: Response, message: string, statusCode = 500, code?: string) {
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      code: code || 'ERROR',
    },
  });
}

export function sendPaginated(
  res: Response,
  data: any[],
  total: number,
  page: number,
  limit: number
) {
  res.status(200).json({
    success: true,
    data,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  });
}
