import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { UserService } from "../user/user.service";
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from "../user/schemas/user.schema";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { TokenService } from "../token/token.service";
import { generateVerificationCode } from "../../common/util/util";
import { MailerService } from "../mailer/mailer.service";
import { RedisClientService } from "../redis/redis-client.service";
@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private tokenService: TokenService,
    private mailerService: MailerService,
    private redisService: RedisClientService,
  ) {}
  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userService.findByEmail(email);
    if (user) {
      if (await bcrypt.compare(password, user.password)) return user;
      else throw new UnauthorizedException("Invalid password");
    } else {
      throw new NotFoundException("Email not found");
    }
  }
  async login(user: User) {
    const accessToken = await this.jwtService.signAsync(
      { sub: user.id, type: "access" },
      {
        secret: this.configService.get<string>("JWT_ACCESS_SECRET"),
        expiresIn: "1h",
      },
    );
    const refreshToken = await this.jwtService.signAsync(
      { sub: user.id, type: "refresh" },
      {
        secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
        expiresIn: "30d",
      },
    );
    await this.tokenService.addToken(refreshToken, user.id.toString());
    const { password, ...safeUser } = user;
    return {
      accessToken,
      refreshToken,
      user: { ...safeUser },
    };
  }
  async register(user:any) {
    const hashPassword = await bcrypt.hash(user.password, 10);
    const newUser = await this.userService.createUser({
      ...user,
      status:user?.status || "Normal",
      password: hashPassword,
    });
    const accessToken = await this.jwtService.signAsync(
      { sub: newUser._id, type: "access" },
      {
        secret: this.configService.get<string>("JWT_ACCESS_SECRET"),
        expiresIn: "1h",
      },
    );
    const refreshToken = await this.jwtService.signAsync(
      { sub: newUser._id, type: "refresh" },
      {
        secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
        expiresIn: "30d",
      },
    );
    await this.tokenService.addToken(refreshToken, newUser._id.toString());
    const { password, ...safeUser } = newUser;
    return {
      accessToken,
      refreshToken,
      user: { ...safeUser },
    };
  }
  async sendCertificationEmail(email: string) {
    const exist = await this.userService.findByEmail(email);
    if (exist) {
      throw new ConflictException("Email already exists");
    }
    const code = generateVerificationCode();
    await this.mailerService.sendVerifyEmail(email, code);
    await this.redisService.setValue(email, code.toString(), 60 * 30);
  }
  async sendResetPasswordEmail(email: string) {
    const exist = await this.userService.findByEmail(email);
    if (!exist) {
      throw new NotFoundException("Email not found");
    }
    const code = generateVerificationCode();
    await this.mailerService.sendResetPasswordEmail(email, code);
    await this.redisService.setValue(email, code.toString(), 60 * 30);
    return {
      message: "Email sent successfully",
    };
  }
  async verifyEmail(email: string, code: number) {
    // const exist = await this.userService.findByEmail(email);
    // if (exist) {
    //   throw new ConflictException("Email already exists");
    // }
    const value = await this.redisService.getValue(email);
    if (value !== code.toString()) throw new UnauthorizedException("Invalid code");
    const tokenEmail = await this.jwtService.signAsync(
      { sub: email, type: "email" },
      {
        secret: this.configService.get<string>("JWT_ACCESS_SECRET"),
        expiresIn: "1d",
      },
    );
    await this.redisService.delValue(email);
    return tokenEmail;
  }
  async generateAccessToken(refreshToken: string) {
    // throw new Error("Method not implemented.");
    let payload;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
    }
    catch(e){
      throw new UnauthorizedException("Invalid refresh token")
    }
    if(!payload || !payload.sub || payload.type !=="refresh") throw new UnauthorizedException("Invalid refresh token")
    return this.jwtService.signAsync(
      { sub: payload.sub, type: "access" },
      {
        secret: this.configService.get<string>("JWT_ACCESS_SECRET"),
        expiresIn: "1h",
      },
    );
  }
  async logout(refreshToken: string) {
    await this.tokenService.deleteToken(refreshToken);
    return {
      message: "Logout successfully",
    }
  }
  async resetPassword(email:string, password:string) {
   const result = await this.userService.setNewPassword(email,password);
  return result;
  }
}