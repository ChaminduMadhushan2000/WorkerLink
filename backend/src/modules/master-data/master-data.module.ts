import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MasterDataController } from './master-data.controller';
import { MasterDataService } from './master-data.service';
import { Category } from './entities/category.entity';
import { RedisClientModule } from '../../common/redis/redis-client.module';

@Module({
  imports: [TypeOrmModule.forFeature([Category]), RedisClientModule],
  controllers: [MasterDataController],
  providers: [MasterDataService],
  exports: [MasterDataService],
})
export class MasterDataModule {}
