import { Expose } from "class-transformer";
import { TransformToDTO } from "../../../common/customDecorator/transformToDTO.decorator";
import { ResponseUserDto } from "../../user/dto/responseUser.dto";
import { User } from "../../user/schemas/user.schema";

export class ResLoginDto {
  @Expose()
  accessToken:string;
  @Expose()
  refreshToken:string;
  @Expose()
  @TransformToDTO(ResponseUserDto,{allFields:true})
  user:User;
}