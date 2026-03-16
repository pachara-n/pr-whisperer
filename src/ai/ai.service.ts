import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Groq } from 'groq-sdk';

@Injectable()
export class AiService {
  private readonly groq: Groq;
  private readonly model: string;
  private readonly logger = new Logger(AiService.name);

  constructor(private configService: ConfigService) {
    this.groq = new Groq({
      apiKey: this.configService.get<string>('GROQ_API_KEY'),
    });
    this.model = this.configService.get<string>('GROQ_MODEL') || 'llama-3.3-70b-versatile';
  }

  async reviewCodeDiff(diff: string): Promise<string> {
    this.logger.debug(`Analyzing diff:\n${diff}`);

    try {
      // We use a low temperature to ensure the AI provides consistent, 
      // objective technical feedback rather than creative suggestions.
      const response = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `You are an expert strict Code Reviewer bot. 
Analyze the provided code diff. 
Focus strictly on finding SECURITY vulnerabilities and PERFORMANCE bottlenecks.
Do not comment on minor styling, best practices, or nitpicks.
Return the result in clear markdown format. If no security or performance issues are found, simply return "No critical issues found."`,
          },
          {
            role: 'user',
            content: `Here is the git diff to review:\n\n${diff}`,
          },
        ],
        model: this.model,
        temperature: 0.1,
      });

      return response.choices[0]?.message?.content || 'No critical issues found.';
    } catch (error) {
      this.logger.error('Failed to communicate with Groq API', error);
      throw error;
    }
  }
}
