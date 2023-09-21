import { ExecutionContext, Injectable, Logger } from "@nestjs/common";
import { WsStrategy } from "../strategy";
import { AuthGuard } from "@nestjs/passport";
import { verify } from "jsonwebtoken";
import { Socket } from "socket.io";

@Injectable() // 이 데코레이터를 추가하여 싱글톤으로 등록
export class WsAuthGuard extends AuthGuard("jwt") {
  private secretKey: string;

  constructor(private wsStrategy: WsStrategy) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType() !== "ws") {
      return true;
    }
    const client: Socket = context.switchToWs().getClient();
    const { authorization } = client.handshake.headers;
    await this.wsStrategy.validateToken(authorization); // 인증 메서드에 secretKey를 전달
    return false;
  }

  // static async validateToken(client: Socket) {
  //   if (authorization) {
  //     const token: string = authorization.split(" ")[1];
  //     const payload = verify(token, "SAMPLE_FOR_COMMIT");
  //     console.log("validateToken", payload);
  //     return payload;
  //   }
  // }
}