import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponse } from '../interfaces/api-response.interface';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as { message?: string | string[] })
                .message instanceof Array
            ? (exceptionResponse as { message: string[] }).message.join(', ')
            : ((exceptionResponse as { message?: string }).message ??
              exception.message);
    }

    // Log the error — but never expose stack traces to the client
    this.logger.error(
      JSON.stringify({
        action: 'EXCEPTION',
        statusCode,
        path: request.url,
        method: request.method,
        message,
      }),
      exception instanceof Error ? exception.stack : String(exception),
    );

    const errorResponse: ApiResponse<null> = {
      statusCode,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      success: false,
      message,
      data: null,
    };

    response.status(statusCode).json(errorResponse);
  }
}
