import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { WebhookSignatureGuard } from '../common/guards/webhook-signature.guard';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

@Controller('webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('github')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @UseGuards(ThrottlerGuard, WebhookSignatureGuard)
  @HttpCode(HttpStatus.OK)
  async handleGithubWebhook(
    @Headers('x-github-delivery') deliveryId: string,
    @Body() payload: any,
  ) {
    // GitHub expects a response within 10 seconds. Since AI processing and
    // fetching diffs can take longer, we trigger the processing logic
    // asynchronously and return an immediate success response to GitHub.
    this.webhookService.handleWebhook(deliveryId, payload).catch(() => {});

    return { received: true };
  }
}
