import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

@Controller()
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  @Get('api/health')
  @HealthCheck()
  check(): Promise<unknown> {
    return this.health.check([
      () => this.db.pingCheck('database', { connection: this.connection }),
    ]);
  }
}
