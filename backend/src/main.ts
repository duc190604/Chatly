import { NestFactory, Reflector } from "@nestjs/core";
import { AppModule } from './app.module';
import { ValidationPipe } from "@nestjs/common";
import { JwtGuard } from "./modules/auth/guards/jwt.guard";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ResponseInterceptor } from "./common/interceptors/response.interceptor";
import { AllExceptionsFilter } from "./common/all-exceptions.filter";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { swaggerConfig } from "./config/swagger.config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      // forbidNonWhitelisted: true, // Báo lỗi nếu có property không được định nghĩa
    })
  )
  app.useGlobalGuards(
    new JwtGuard({
      exclude: [
        { path: "api/auth/login", method: "POST" },
        { path: "api/auth/send-certification", method: "POST" },
        { path: "api/auth/verify-email", method: "POST" },
        {path:"api/auth/refresh-token",method:"POST"},
        {path:"api/auth/logout",method:"POST"},
        {path:"api/uploads/file",method:"POST"},
        {path:"api/uploads/files",method:"POST"},
        { path: "api/auth/send-reset-password", method: "POST" },
      ],
    }),
  );
  app.useGlobalInterceptors(new ResponseInterceptor(new Reflector()));
  app.useGlobalFilters(new AllExceptionsFilter());

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document); // Thiết lập đường dẫn Swagger UI, ví dụ: http://localhost:3000/api
  app.useWebSocketAdapter(new IoAdapter(app));
  const corsOrigin = process.env.CORS_ORIGIN;
  const origins = corsOrigin ? corsOrigin.split(',') : true;
  app.enableCors({
    origin: origins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(process.env.PORT_BE ?? 8017,"0.0.0.0");
  console.log(`App is running on: ${await app.getUrl()}`);

}


bootstrap();
