import { Module } from '@nestjs/common';
import { PlatformController } from './platform.controller';
import { PlatformService } from './platform.service';

@Module({
  controllers: [PlatformController],
  providers: [PlatformService],
})
export class PlatformModule {}
```

### 10.5 — Register in AppModule

```typescript
import { PlatformModule } from './modules/platform/platform.module';