import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): Redis => {
        const host = configService.get<string>('REDIS_HOST');
        const port = configService.get<number>('REDIS_PORT');

        if (!host || !port) {
          throw new Error('Redis configuration is missing');
        }

        return new Redis({
          host,
          port,
        });
      },
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisClientModule {}
