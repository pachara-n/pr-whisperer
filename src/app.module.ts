import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RedisModule } from './redis/redis.module';
import { GithubModule } from './github/github.module';
import { AiModule } from './ai/ai.module';
import { WebhookModule } from './webhook/webhook.module';

@Module({
  imports: [RedisModule, GithubModule, AiModule, WebhookModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
