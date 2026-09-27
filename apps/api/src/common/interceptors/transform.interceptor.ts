import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  data: T;
  pagination?: any;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map((res) => {
        // If the service response already has success structure or pagination, preserve it
        if (res && typeof res === 'object' && 'success' in res) {
          return res;
        }

        if (res && typeof res === 'object' && 'data' in res && 'pagination' in res) {
          return {
            success: true,
            data: res.data,
            pagination: res.pagination,
          };
        }

        return {
          success: true,
          data: res,
        };
      }),
    );
  }
}
