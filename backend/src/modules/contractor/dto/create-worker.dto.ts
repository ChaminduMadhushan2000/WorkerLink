import { IsString, IsOptional, MaxLength, MinLength } from 'class-validator';

export class CreateWorkerDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  firstName: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  lastName: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsString()
  @MaxLength(100)
  trade: string;
}
