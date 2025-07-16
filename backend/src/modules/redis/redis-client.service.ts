import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisClientService implements OnModuleInit, OnModuleDestroy {
  private redisClient: RedisClientType;

  constructor(private readonly configService: ConfigService) {
    // Chỉ sử dụng password nếu instance không yêu cầu username
    this.redisClient = createClient({
      username: this.configService.get<string>("REDIS_USERNAME"),
      password: this.configService.get<string>("REDIS_PASSWORD"),
      socket: {
        host: this.configService.get<string>('REDIS_SOCKET_HOST'),
        port: this.configService.get<number>('REDIS_SOCKET_PORT'),
        reconnectStrategy: (retries) => {
          const delay = Math.min(retries * 100, 3000);
          console.warn(`Redis reconnect attempt #${retries}, retrying in ${delay}ms`);
          return delay;
        },
      },
    });

    this.redisClient.on('error', err => console.log('Redis Client Error', err));

  }

  async onModuleInit() {
    try {
      await this.redisClient.connect();
      console.log('Redis connected successfully');
    } catch (err) {
      console.error('Failed to connect to Redis:', err);
      // throw err;
    }
  }

  async onModuleDestroy() {
    try {
      await this.redisClient.quit();
      console.log('Redis disconnected');
    } catch (err) {
      console.error('Failed to disconnect Redis:', err);
    }
  }

  async setValue(key: string, value: string, expire?: number): Promise<void> {
    try {
      if (expire) {
        await this.redisClient.set(key, value, { EX: expire });
      } else {
        await this.redisClient.set(key, value);
      }
    } catch (err) {
      console.error(`Failed to set key ${key}:`, err);
      // throw err;
    }
  }

  async getValue(key: string) {
    try {
      return await this.redisClient.get(key);
    } catch (err) {
      console.error(`Failed to get key ${key}:`, err);
      // throw err;
    }
  }

  async delValue(key: string) {
    try {
      return await this.redisClient.del(key);
    } catch (err) {
      console.error(`Failed to delete key ${key}:`, err);
      // throw err;
    }
  }

  async getKeys(pattern: string = '*'){
    try {
      return await this.redisClient.keys(pattern);
    } catch (err) {
      console.error(`Failed to get keys with pattern ${pattern}:`, err);
      // throw err;
    }
  }

  async addOnlineUser(userId: string, socketId: string) {
    await this.redisClient.sAdd('online_users', userId);
    await this.redisClient.sAdd(`user_sockets:${userId}`, socketId);
  }

  async removeOnlineUser(userId: string, socketId: string) {
    await this.redisClient.sRem(`user_sockets:${userId}`, socketId);
    const count = await this.redisClient.sCard(`user_sockets:${userId}`);
    if (count === 0) {
      await this.redisClient.sRem('online_users', userId);
    }
  }

  async getAllOnlineUsers(): Promise<string[]> {
    return this.redisClient.sMembers('online_users');
  }
}