import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Octokit } from '@octokit/rest';

@Injectable()
export class GithubService {
  private readonly octokit: Octokit;
  private readonly logger = new Logger(GithubService.name);

  constructor(private configService: ConfigService) {
    this.octokit = new Octokit({
      auth: this.configService.get<string>('GITHUB_PAT'),
    });
  }

  async getPullRequestDiff(
    owner: string,
    repo: string,
    pullNumber: number,
  ): Promise<string> {
    try {
      const response = await this.octokit.rest.pulls.get({
        owner,
        repo,
        pull_number: pullNumber,
        mediaType: {
          format: 'diff',
        },
      });

      return response.data as unknown as string;
    } catch (error) {
      this.logger.error(`Failed to fetch diff for PR #${pullNumber}`, error);
      throw error;
    }
  }

  async createReviewComment(
    owner: string,
    repo: string,
    issueNumber: number,
    body: string,
  ): Promise<void> {
    try {
      const modelName = this.configService.get<string>('GROQ_MODEL') || 'Unknown Model';

      const formattedBody = `
## 🤖 PR Whisperer Intelligence Review

| Feature | Info |
| :--- | :--- |
| **Engine** | \`${modelName}\` |
| **Focus** | Security & Performance |
| **Status** | 🔍 Analysis Complete |

---

### 📝 Review Feedback

${body}

---
> [!TIP]
> This review was generated automatically. Please verify critical changes before merging.
      `.trim();

      await this.octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: issueNumber,
        body: formattedBody,
      });
      this.logger.log(`Successfully posted formatted comment on PR #${issueNumber}`);
    } catch (error) {
      this.logger.error(`Failed to post comment on PR #${issueNumber}`, error);
      throw error;
    }
  }
}
