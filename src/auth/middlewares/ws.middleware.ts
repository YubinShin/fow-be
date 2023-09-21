import { Socket } from "socket.io";
import { WsAuthGuard } from "../guard";

export type SocketIOMiddleware = {
  (client: Socket, next: (err?: Error) => void);
};

export const SocketAuthMiddleware = (): SocketIOMiddleware => {
  return (client, next) => {
    try {
      WsAuthGuard.validateToken(client);
      next();
    } catch (error) {
      next(error);
    }
  };
};
