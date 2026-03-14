import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { GithubModule } from '../github/github.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [GithubModule, AiModule],
  providers: [WebhookService],
  controllers: [WebhookController],
})
export class WebhookModule {}
