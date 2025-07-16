import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtGuard extends AuthGuard("jwt") {
  constructor(
    private readonly config?: {
      exclude?: Array<{ path: string; method: string }>;
    },
  ) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const { url, method } = request;

    if (this.config?.exclude) {
      const isExcluded = this.config.exclude.some(
        (item) => item.path === url.slice(1) && item.method === method,
      );
      if (isExcluded) {
        return true;
      }
    }

    return super.canActivate(context);
  }
}