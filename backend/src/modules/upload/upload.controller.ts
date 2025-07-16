import { UploadService } from "./upload.service";
import { Controller, Post, UploadedFile, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { Express } from "express";
import { plainToInstance } from "class-transformer";
import { ResponseUploadDto } from "./dtos/responseUpload.dto";
import { ApiBearerAuth, ApiBody, ApiConsumes } from "@nestjs/swagger";
@Controller('api/uploads')
export class UploadController {
  constructor(private readonly uploadService:UploadService){
  }
  @Post("file")
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const res = await this.uploadService.uploadFile(file);
    return plainToInstance(ResponseUploadDto, res)
  }
  @Post('files')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('files', 10)) // field name là 'files', tối đa 10 file
  async uploadMultipleFiles(@UploadedFiles() files: Express.Multer.File[], ) {
    const res= await this.uploadService.uploadMultipleFiles(files);
    return plainToInstance(ResponseUploadDto, res)
  }
}