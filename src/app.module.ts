import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RedisModule } from './redis/redis.module';
import { GithubModule } from './github/github.module';
import { AiModule } from './ai/ai.module';
import { WebhookModule } from './webhook/webhook.module';
import { Throttle, ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    RedisModule,
    GithubModule,
    AiModule,
    WebhookModule,
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: 60000,
            limit: 5,
          },
        ],
        storage: new ThrottlerStorageRedisService({
          host: config.get('REDIS_HOST'),
          port: config.get('REDIS_PORT'),
        }),
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
