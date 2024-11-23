import { ChatContainer, MainContainer, Message, MessageInput, MessageList } from "@chatscope/chat-ui-kit-react";
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Automatizaciones" },
  ];
};

export default function GeminiPage() {
  return (
    <div className="w-dvw h-dvh">
      <MainContainer>
        <ChatContainer>       
          <MessageList>
            <Message model={{
              message: "Hello my friend",
              sentTime: "just now",
              sender: "Joe",
              "direction": "outgoing",
              "position": "normal",
            }} />
            </MessageList>
          <MessageInput placeholder="Escribe algo" attachButton={false} />        
        </ChatContainer>
      </MainContainer>
    </div>
  );
}
