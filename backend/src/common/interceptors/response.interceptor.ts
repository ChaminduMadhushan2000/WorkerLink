import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';
import { ApiResponse } from '../interfaces/api-response.interface';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest<Request>();
    const statusCode = context
      .switchToHttp()
      .getResponse<{ statusCode: number }>().statusCode;

    return next.handle().pipe(
      map((responseData: { message?: string; data?: T } | T) => {
        const isStructured =
          responseData !== null &&
          typeof responseData === 'object' &&
          'data' in (responseData as object);

        const message = isStructured
          ? ((responseData as { message?: string }).message ?? 'Success')
          : 'Success';

        const data = isStructured
          ? ((responseData as { data?: T }).data ?? null)
          : ((responseData as T) ?? null);

        return {
          statusCode,
          timestamp: new Date().toISOString(),
          path: request.url,
          method: request.method,
          success: true,
          message,
          data,
        };
      }),
    );
  }
}
