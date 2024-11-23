import {
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    WsResponse,
  } from '@nestjs/websockets';
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
  import { from, Observable } from 'rxjs';
  import { map } from 'rxjs/operators';
  import { Server } from 'socket.io';
  
  interface messageProps {
    message: string
    type: "user" | "bot"
}

interface flow {
  id: string
  activator?: string
  goToFlow?: string
  response: Array<{
    message: string
    validationType?: 'ci' | 'name' | 'email' | "yesNo"
    errorMessage?: string
    options?: Array<{
      message: string
      value: number;
      goToFlow: string
    }>
  }>
}

interface message {
  id: number
  type: "user" | "bot"
  message: string
  stateFlow: string
  nextFlow?: string
}

interface db {
  messages: message[]
}
  
@WebSocketGateway({
    cors: {
      origin: '*',
    },
  })
export class EventsGateway {
    @WebSocketServer()
    server: Server;
    filePath: string;
    db: db;
    flows: flow[];

    constructor()  {
      this.filePath = join(__dirname, "./../db.json")
      this.loadDb();

      this.flows = [
          {
            id: "1",
            activator: "__WELCOME__",
            goToFlow: "2",
            response: [
              {
                message: "Hola, ¿cómo te llamas?",
                validationType: "name",
                errorMessage: "Por favor, introduce tu nombre",
              }
            ]
          },
          {
            id: "2",
            response: [
              {
                message: "Bienvenido a la GDG El Alto",
              }, {
                message: "¿En que te podemos ayudar?",
                options: [
                  { message: "Conoce el siguiente evento", value: 1, goToFlow: "3" },
                  { message: "Mas información", value: 2, goToFlow: "4" },
                  { message: "Quiero la ayuda de un operador", value: 2, goToFlow: "5" }
                ]
              }
            ]
          },
          {
            id: "3",
            response: [
              { message: "El evento es el GDG El Alto 2024, que se celebrará el 23 de noviembre de 2024" },
            ]
          },
          {
            id: "4",
            response: [
              { message: "Claro, puedes consultar más información en el sitio web de la GDG: https://gdg.community.dev/gdg-el-alto/" },
            ]
          },
          {
            id: "5",
            response: [
              {
                message: "Descuerdo, en unos momentos te contactaremos con un operador",
              }
            ]
          }
        ]
    }
  
    @SubscribeMessage('message')
    async processMessage(@MessageBody() data: messageProps) {
      const message = data.message.toLowerCase();

      const currentFlow = this.getCurrentFlow();


      const dbMessage: Array<message> = [
        {
          id: this.db.messages.length + 1,
          type: "user",
          message: data.message,
          stateFlow: currentFlow.id,
          nextFlow: currentFlow.goToFlow
        }
      ]
      const userResponse: Array<messageProps & {nextFlow?: string}> = []

      currentFlow.response.forEach((m) => {
        userResponse.push({
          type: "bot",
          message: m.message,
        })

        if (m.options) {
          const optionMessage = m.options.map(o => `${o.value}: ${o.message}`).join("\n")

          userResponse.push({
            type: "bot",
            message: optionMessage
          })
        }
      })

      userResponse.forEach(r => {
        dbMessage.push({   
          id: this.db.messages.length + dbMessage.length + 1,
          type: "bot",
          message: r.message,
          stateFlow: currentFlow.id,
        })


        this.server.emit('messageRes', {
            type: "bot",
            message: data.message
        });

        this.saveDb();
      })

    }

    getCurrentFlow() {
      if (this.db.messages.length === 0) {
        return this.flows[0];
      }

      const nextFlow = this.db.messages[this.db.messages.length - 1].nextFlow;
      const flow = this.flows.find(x => x.id === nextFlow);

      if (!flow) {
        return this.flows[0];
      }

      return flow;
    }


    async saveDb() {
      await writeFile(this.filePath, JSON.stringify(this.db, null, 2))
    }


    async loadDb() {
      if (!existsSync(this.filePath)) {
        const data: db = {
          messages: []
        }
        await writeFile(this.filePath, JSON.stringify(data))
        this.db = data;
      }
      return JSON.parse(String(await readFile(this.filePath, 'utf-8')));
    }
  }