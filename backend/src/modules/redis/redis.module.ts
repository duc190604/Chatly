// redis.module.ts
import { Module, Global } from '@nestjs/common';
import { RedisClientService } from "./redis-client.service";

@Global()
@Module({
  providers: [RedisClientService],
  exports: [RedisClientService],
})
export class RedisModule {}
