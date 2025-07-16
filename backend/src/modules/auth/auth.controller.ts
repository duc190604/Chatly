import {
  Body,
  Controller,
  Post,
  UnauthorizedException,
  UseGuards, Delete, HttpCode
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth, ApiOkResponse
} from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dtos/login.dto";
import { RegisterDto } from "./dtos/register.dto";
import { GetUser } from "../../common/customDecorator/get-user.decorator";
import { JwtRefreshGuard } from "./guards/jwt-refresh.guard";
import { VerifyEmailDto } from "./dtos/verify-email.dto";
import { SendCertificationDto } from "./dtos/send-certification.dto";
import { SkipResponseInterceptor } from "../../common/customDecorator/skip-response-interceptor.decorator";
import { plainToInstance } from "class-transformer";
import { ResLoginDto } from "./dtos/resLogin.dto";
import { RefreshTokenDto } from "./dtos/refreshToken.dto";
import { ResVerifyEmailDto } from "./dtos/resVerifyEmail.dto";
import { ResetPasswordDto } from "./dtos/resetPassword.dto";

@ApiTags("Authentication")
@ApiBearerAuth('access-token')
@Controller("api/auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: "User login" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @HttpCode(200)
  @ApiOkResponse({
    description: "Login successful",
    type: ResLoginDto,
  })
  @Post("login")
  async login(@Body() info: LoginDto) :Promise<ResLoginDto|undefined> {
    const user = await this.authService.validateUser(info.email, info.password);
    const res = await this.authService.login(user);
    return plainToInstance(ResLoginDto, res,{
      excludeExtraneousValues:true,
      exposeUnsetFields:true,
      exposeDefaultValues:true,
    });
  }

  @ApiOperation({ summary: "Register new user" })
  @ApiResponse({ status: 201, description: "User registered successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiBearerAuth('email-token')
  @Post("register")
  async register(@Body() info: RegisterDto, @GetUser() user: any) {
    if (user.type !== "email" || user.email !== info.email) {
      throw new UnauthorizedException("Invalid credentials");
    }
    return this.authService.register(info);
  }

  @ApiOperation({ summary: "Send certification email" })
  @ApiResponse({ status: 200, description: "Email sent successfully" })
  @ApiBody({schema:{type:"object",properties:{email:{type:"string"}}}})
  // @SkipResponseInterceptor()
  @Post("send-certification")
  async sendCertification(@Body() {email}: SendCertificationDto) {
    await this.authService.sendCertificationEmail(email);
    return {
      message: "Email sent successfully",
      status: 200,
    };
  }
  @ApiOperation({ summary: "Verify email" })
  @HttpCode(200)
  @Post("verify-email")
  async verify(@Body() { code, email }: VerifyEmailDto) {
    const token = await this.authService.verifyEmail(email, code);
    return plainToInstance(ResVerifyEmailDto, {token})
  }

  @ApiOperation({ summary: "Refresh access token" })
  @ApiResponse({ status: 200, description: "Token refreshed successfully" })
  @ApiBody({schema:{type:"object",properties:{refreshToken:{type:"string"}}}})
  @UseGuards(new JwtRefreshGuard())
  @ApiBearerAuth('refresh-token')
  @Post("refresh-token")
  async refreshToken(@Body() { refreshToken }: { refreshToken: string }) {
    const token = await this.authService.generateAccessToken(refreshToken);
    return {
      accessToken: token,
    };
  }
  @ApiOperation({ summary: "Logout" })
  @Post("logout")
  @HttpCode(200)
  async logout(@Body() { refreshToken }: RefreshTokenDto) {
    return await this.authService.logout(refreshToken);
  }
  @ApiOperation({ summary: "Reset password" })
  @ApiResponse({ status: 201, description: "Reset password successful" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiBearerAuth('email-token')
  @Post("reset-password")
  async resetPassword(@Body() body:ResetPasswordDto, @GetUser() user:any) {
    if (user.type !== "email" || user.email !== body.email) {
      throw new UnauthorizedException("Invalid credentials");
    }
    return await this.authService.resetPassword(body.email,body.newPassword)

  }
  @Post("send-reset-password")
  async sendResetPassword(@Body() body:SendCertificationDto) {
    return await this.authService.sendResetPasswordEmail(body.email)
  }
  @ApiOperation({ summary: "Delete account" })
  @ApiResponse({ status: 200, description: "Account deleted successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiBearerAuth('access-token')
  @Delete("delete-account")
  async deleteAccount(@Body() body:ResetPasswordDto, @GetUser() user:any) {}

}