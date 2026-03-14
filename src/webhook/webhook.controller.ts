import { Controller, Post, Body, Headers, HttpCode, HttpStatus } from '@nestjs/common';
import { WebhookService } from './webhook.service';

@Controller('webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('github')
  @HttpCode(HttpStatus.OK)
  async handleGithubWebhook(
    @Headers('x-github-delivery') deliveryId: string,
    @Body() payload: any,
  ) {
    // GitHub expects a response within 10 seconds. Since AI processing and 
    // fetching diffs can take longer, we trigger the processing logic 
    // asynchronously and return an immediate success response to GitHub.
    this.webhookService.handleWebhook(deliveryId, payload).catch(() => {
    });

    return { received: true };
  }
}
