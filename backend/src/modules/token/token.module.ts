import { MongooseModule} from "@nestjs/mongoose";
import { Module } from "@nestjs/common";
import { Token, TokenSchema } from './schema/token.schema';
import { TokenService } from "./token.service";
@Module({
  imports:[MongooseModule.forFeature([{name:Token.name, schema:TokenSchema}])],
  controllers:[],
  providers:[TokenService],
  exports:[TokenService]
})
export class TokenModule{}