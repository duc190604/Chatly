import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { plainToInstance } from "class-transformer";

export class PaginationCursorDto {
  @ApiProperty({ example: '66c1...', nullable: true })
  @Expose()
  nextCursor?: string;

  @ApiProperty({ example: true })
  @Expose()
  hasNextPage: boolean;

  static plainToInstance<T>(this: new (...args: any[]) => T, obj: any): T {
    return plainToInstance(this, obj, {
      excludeExtraneousValues:true,
      exposeUnsetFields:true,
      exposeDefaultValues:true,
    });
  }
}
