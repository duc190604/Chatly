import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from "@nestjs/config";
import { Injectable } from "@nestjs/common";
@Injectable()
export class UploadService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: configService.get<string>("CLOUDINARY_CLOUD_NAME"),
      api_key:  configService.get<string>("CLOUDINARY_API_KEY"),
      api_secret: configService.get<string>("CLOUDINARY_API_SECRET"),
    });
  }
  async uploadFile(file) {
    const result = await cloudinary.uploader.upload(file.path,{
      folder:  this.configService.get<string>("CLOUDINARY_FOLDER"),
      resource_type: "auto",
      public_id: file.originalname || undefined, // Sử dụng tên gốc của file
    });
    return {
      url: result.secure_url, // URL truy cập file
      public_id: result.public_id, // ID file trên Cloudinary
      resource_type: result.resource_type, // Kiểu file (image, video, raw, audio)
    }
  }
  async uploadMultipleFiles(file:any[]) {
    const uploadPromises = file.map(async (file) => {
      const result = await cloudinary.uploader.upload(file.path,{
        folder:  this.configService.get<string>("CLOUDINARY_FOLDER"),
        resource_type: "auto",
        public_id: file.originalname || undefined, // Sử dụng tên gốc của file
      });
      return {
        url: result.secure_url, // URL truy cập file
        public_id: result.public_id, // ID file trên Cloudinary
        resource_type: result.resource_type, // Kiểu file (image, video, raw, audio)
      }
    })
    const results = await Promise.all(uploadPromises);
    return results;
  }


}