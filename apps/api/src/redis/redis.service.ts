import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;
  private pubClient: Redis;
  private subClient: Redis;
  private readonly logger = new Logger(RedisService.name);

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const redisUrl = this.configService.get<string>('redis.url') || 'redis://localhost:6379';
    const redisOptions = {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      retryStrategy: () => null,
    };
    try {
      this.client = new Redis(redisUrl, redisOptions);
      this.pubClient = new Redis(redisUrl, redisOptions);
      this.subClient = new Redis(redisUrl, redisOptions);

      this.client.on('error', (err) => {
        this.logger.warn(`Redis client offline (fallback active): ${err.message}`);
      });
      this.pubClient.on('error', () => {});
      this.subClient.on('error', () => {});

      this.client.connect().catch((err) => {
        this.logger.warn(`Redis connection failed (non-blocking fallback): ${err.message}`);
      });
    } catch (e: any) {
      this.logger.warn(`Redis initialization error: ${e.message}`);
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.client?.get(key);
    } catch {
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    try {
      if (ttlSeconds) {
        await this.client?.setex(key, ttlSeconds, value);
      } else {
        await this.client?.set(key, value);
      }
    } catch {
      // non-blocking
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client?.del(key);
    } catch {
      // non-blocking
    }
  }

  async publish(channel: string, message: string): Promise<void> {
    try {
      await this.pubClient?.publish(channel, message);
    } catch {
      // non-blocking
    }
  }

  onModuleDestroy() {
    this.client?.disconnect();
    this.pubClient?.disconnect();
    this.subClient?.disconnect();
  }
}
