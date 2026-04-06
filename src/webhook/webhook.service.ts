import { Injectable, Logger } from '@nestjs/common';
import { GithubService } from '../github/github.service';
import { AiService } from '../ai/ai.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);
  
  // Limiting diff size prevents excessive token usage and avoids hitting 
  // the model's context window limits for very large pull requests
  private readonly DIFF_SIZE_LIMIT = 20000;

  constructor(
    private readonly githubService: GithubService,
    private readonly aiService: AiService,
    private readonly redisService: RedisService,
  ) {}

  async handleWebhook(deliveryId: string, payload: any): Promise<void> {
    const { action, pull_request, repository } = payload;

    if (!['opened', 'synchronize'].includes(action)) {
      return;
    }

    // GitHub may retry webhook deliveries if the initial response is slow.
    // We cache the delivery ID to prevent processing the same event multiple times.
    if (await this.redisService.exists(`webhook:${deliveryId}`)) {
      this.logger.warn(`Duplicate webhook detected: ${deliveryId}`);
      return;
    }
    await this.redisService.set(`webhook:${deliveryId}`, 'processed', 86400);

    const owner = repository.owner.login;
    const repo = repository.name;
    const pullNumber = pull_request.number;

    this.logger.log(`Processing PR #${pullNumber} in ${owner}/${repo} (${action})`);

    try {
      const diff = await this.githubService.getPullRequestDiff(owner, repo, pullNumber);

      if (diff.length > this.DIFF_SIZE_LIMIT) {
        this.logger.warn(`PR #${pullNumber} diff is too large (${diff.length} bytes). Skipping.`);
        
        // Informing the user via PR comment ensures they know why the automated review was skipped
        // instead of leaving them wondering why the bot is silent.
        await this.githubService.createReviewComment(
          owner,
          repo,
          pullNumber,
          'This PR diff is too large for automated AI review. Please review manually.',
        );
        return;
      }

      const review = await this.aiService.reviewCodeDiff(diff);
      
      const formattedReview = `### AI Code Review (Security & Performance)\n\n${review}\n\n---\n*Reviewed by **PR Whisperer 🤖***`;

      await this.githubService.createReviewComment(
        owner,
        repo,
        pullNumber,
        formattedReview,
      );
    } catch (error) {
      this.logger.error({
        message: `Failed to process PR #${pullNumber}`,
        repository: `${owner}/${repo}`,
        error: error.message,
      });
    }
  }
}
