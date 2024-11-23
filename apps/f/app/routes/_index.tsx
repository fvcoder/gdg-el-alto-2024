import { ChatContainer, MainContainer, Message, MessageInput, MessageList } from "@chatscope/chat-ui-kit-react";
import type { MetaFunction } from "@remix-run/node";
import { useChat } from "~/hooks/useChat";

export const meta: MetaFunction = () => {
  return [
    { title: "Automatizaciones" },
  ];
};

export default function Index() {
  const { sendMessage, messages } = useChat();

  return (
    <div className="w-dvw h-dvh">
      <MainContainer>
        <ChatContainer>       
          <MessageList>
            {messages.map((x, i) => (
              <Message
                key={`message-${i}`}
                model={{
                  message: x.message,
                  sender: x.type,
                  direction: x.type === "user" ? "outgoing" : "incoming",
                  position: "normal",
                }}
              />
            ))}
            </MessageList>
          <MessageInput
            placeholder="Escribe algo"
            attachButton={false}
            onSend={(html, text) => {

              sendMessage({
                type: "user",
                message: text
              })
            }}
          />        
        </ChatContainer>
      </MainContainer>
    </div>
  );
}
