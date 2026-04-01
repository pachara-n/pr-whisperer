import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class WebhookSignatureGuard implements CanActivate {
  private readonly logger = new Logger(WebhookSignatureGuard.name);

  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const signature = request.headers['x-hub-signature-256'];
    const secret = this.configService.get<string>('GITHUB_WEBHOOK_SECRET');

    if (!secret) {
      this.logger.error(
        'GITHUB_WEBHOOK_SECRET is not defined in environment variables',
      );
      throw new UnauthorizedException('Server configuration error');
    }

    if (!signature) {
      this.logger.warn('Webhook request missing x-hub-signature-256 header');
      throw new UnauthorizedException('Signature is missing');
    }

    // signature validation requires the raw request body as Buffer.
    // ensure 'rawBody: true' is set in main.ts.
    if (!request.rawBody) {
      this.logger.error(
        'rawBody is not available. Ensure rawBody: true is set in main.ts',
      );
      throw new Error('Internal server error: rawBody missing');
    }

    const hmac = crypto.createHmac('sha256', secret);
    const digest = Buffer.from(
      'sha256=' + hmac.update(request.rawBody).digest('hex'),
      'utf8',
    );
    const checksum = Buffer.from(signature, 'utf8');

    // use timingSafeEqual to protect against timing attacks.
    if (
      checksum.length !== digest.length ||
      !crypto.timingSafeEqual(digest, checksum)
    ) {
      this.logger.warn('Invalid webhook signature detected');
      throw new UnauthorizedException('Invalid signature');
    }

    return true;
  }
}
