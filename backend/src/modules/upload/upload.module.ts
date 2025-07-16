import { Module } from "@nestjs/common";
import { UploadController } from "./upload.controller";
import { UploadService } from "./upload.service";
import { MulterModule } from "@nestjs/platform-express";

@Module({
  imports: [MulterModule.register({
    dest: './uploads', // thư mục lưu file tạm
  }),],
  controllers: [UploadController],
  providers: [UploadService],
  exports: []
})
export class UploadModule {}