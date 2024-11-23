import { createContext, useContext, useEffect, useState } from "react";
import socketIO, { Socket } from "socket.io-client";


interface ChatContext {
    sendMessage: (props: messageProps) => void
    messages: messageProps[]
    geminiMessages: messageProps[]
}

const Chat = createContext<ChatContext>(null!)

interface messageProps {
    message: string
    type: "user" | "bot"
}

const socket = socketIO("http://localhost:3000");

export function ChatProvider({ children }: { children: React.ReactNode }) {
    const [messages, setMessages] = useState<messageProps[]>([]);
    const [geminiMessages, setGeminiMessages] = useState<messageProps[]>([]);

    useEffect(() => {
        socket.on("connect", () => {
            console.log("Connected to server");
        })
        socket.on("disconnect", () => {
            if (!socket.connected) {
                socket.connect();
            }
        })

        socket.on('messageRes', (message: messageProps) => {
            setMessages((m) => [...m, message]);
        });

        socket.on('messageGemini', (message) => {
            console.log("messageGemini", message);
        });

        return () => {
            socket.close();
            console.log("socket closed", socket.connected);
        }
    }, [])

    function sendMessage(props: messageProps) {
        socket.emit('message', props);
        setMessages((m) => [...m, props]);
    }

    return (
        <Chat.Provider value={{
            sendMessage,
            messages,
            geminiMessages
        }}>
            {children}
        </Chat.Provider>
    )
}

export function useChat() {
    return useContext(Chat)
}