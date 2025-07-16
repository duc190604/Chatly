import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Token, TokenDocument } from "./schema/token.schema";
import { Model } from "mongoose";

@Injectable()
export class TokenService {
  constructor(@InjectModel(Token.name) private tokenModel:Model<TokenDocument>) {
  }
  async addToken(token:string, id:string){
    return this.tokenModel.create({token:token,userId:id})
  }
  async findToken(token:string) {
    return this.tokenModel.findOne({token:token})
  }
  async deleteToken(token:string) {
    return await this.tokenModel.deleteOne({token:token})
  }

}