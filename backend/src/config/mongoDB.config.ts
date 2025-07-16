// mongoose.config.ts
import { MongooseModuleOptions, MongooseOptionsFactory } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MongooseConfigService implements MongooseOptionsFactory {
  constructor(private readonly configService: ConfigService) {}
  createMongooseOptions(): MongooseModuleOptions {
    return {
      uri: this.configService.get<string>('MONGODB_URI'),
      dbName: this.configService.get<string>('MONGODB_DB_NAME'),
      retryAttempts: 2,
      retryDelay: 3000,
      appName: 'NestJSApp',
      connectionFactory: (connection) => {
        console.log('MongoDB connected successfully');
        return connection;
      },
    };
  }
}
