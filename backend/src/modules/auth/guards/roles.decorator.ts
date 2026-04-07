import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../entities/user.entity';

export const Roles = (...roles: UserRole[]): MethodDecorator & ClassDecorator =>
  SetMetadata('roles', roles);
