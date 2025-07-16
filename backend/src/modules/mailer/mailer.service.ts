import { createTransport, Transporter } from "nodemailer";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class MailerService {
  private transporter: Transporter;
  constructor(private configService: ConfigService) {
    this.transporter = createTransport({
      service: "smtp",
      host: this.configService.get<string>("SMTP_HOST"),
      port: parseInt(this.configService.get<string>("SMTP_PORT")||"465"),
      secure: true,
      auth: {
        user: this.configService.get<string>("SMTP_USER"), 
        pass: this.configService.get<string>("SMTP_PASS"),
      },
    });
  }
  async onModuleInit() {
    this.transporter.verify((error, success) => {
      if (error) {
        console.error('SMTP Connection Failed:', error);
      } else {
        console.log('SMTP Server connected successfully ');
      }
    });

  }
  async sendVerifyEmail (to:string, code:number)  {
    try {
      const mailOptions = {
        from: '"Chatly Support" <no-reply@chatly.com>',
        to,
        subject: "📧 Xác thực địa chỉ email của bạn",
        html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2>Chào mừng bạn đến với Chatly!</h2>
      <p>Cảm ơn bạn đã đăng ký tài khoản.</p>
      <p>Để hoàn tất quá trình đăng ký, vui lòng sử dụng mã xác thực sau:</p>
      <div style="text-align: center; margin: 20px 0;">
        <span style="font-size: 24px; color: #ff5733; font-weight: bold;">${code}</span>
      </div>
      <p>Mã xác thực có hiệu lực trong vòng <strong>30 phút</strong>.</p>
      <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
      <hr>
      <p style="font-size: 12px; color: #888;">Chatly - Nơi kết nối mọi người.</p>
    </div>
  `
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };
  async sendResetPasswordEmail(to:string, code:number)  {
    try {
      const mailOptions = {
        from: '"Chatly Support" <no-reply@chatly.com>',
        to,
        subject: "Yêu cầu đặt lại mật khẩu của bạn",
        html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2>Yêu cầu đặt lại mật khẩu</h2>
      <p>Xin chào,</p>
      <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
      <p>Mã xác thực của bạn là:</p>
      <div style="text-align: center; margin: 20px 0;">
        <span style="font-size: 24px; color: #ff5733; font-weight: bold;">${code}</span>
      </div>
      <p>Mã này có hiệu lực trong vòng <strong>30 phút</strong>. Vui lòng không chia sẻ mã này với bất kỳ ai.</p>
      <p>Nếu bạn không yêu cầu đặt lại mật khẩu, bạn có thể bỏ qua email này.</p>
      <hr>
      <p style="font-size: 12px; color: #888;">Cảm ơn bạn đã sử dụng Chatly.</p>
    </div>
  `
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };
}