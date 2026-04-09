import { IsUUID, IsString, MaxLength } from 'class-validator';

export class RequestCancellationDto {
  @IsUUID()
  jobPostId: string;

  @IsString()
  @MaxLength(500)
  reason: string;
}
