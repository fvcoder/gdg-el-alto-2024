import {
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    WsResponse,
  } from '@nestjs/websockets';
  import { from, Observable } from 'rxjs';
  import { map } from 'rxjs/operators';
  import { Server } from 'socket.io';
  
  interface messageProps {
    message: string
    type: "user" | "bot"
}
  
@WebSocketGateway({
    cors: {
      origin: '*',
    },
  })
export class EventsGateway {
    @WebSocketServer()
    server: Server;
  
    @SubscribeMessage('message')
    async identity(@MessageBody() data: messageProps) {
        console.log("message", data);

        this.server.emit('messageRes', {
            type: "bot",
            message: data.message
        });
    }
  }