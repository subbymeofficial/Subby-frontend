import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import {
  useConversations,
  useMessages,
  useSendMessage,
  useCreateConversation,
  useMarkMessagesRead,
} from "@/hooks/use-api";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, MessageSquare, Send, Paperclip } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import type { Conversation, Message } from "@/services/conversations.service";

function getOtherParticipant(conv: Conversation, myId: string) {
  const participants = conv.participants as { _id: string; name?: string; avatar?: string; profileImage?: { url: string } }[];
  const other = participants.find((p) => p._id !== myId);
  return other;
}

function getAvatar(p: { avatar?: string; profileImage?: { url: string } } | undefined) {
  if (!p) return "https://api.dicebear.com/7.x/avataaars/svg?seed=user";
  return p.profileImage?.url || p.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p}`;
}

export default function Messages() {
  const { user, isAuthenticated } = useAuth();
  const { socket } = useSocket();
  const [searchParams] = useSearchParams();
  const convParam = searchParams.get("c");
  const { data: convData } = useConversations(1, 50);
  const [selectedId, setSelectedId] = useState<string | null>(convParam);
  const [typing, setTyping] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const conversations = convData?.conversations ?? [];

  useEffect(() => {
    if (convParam && conversations.some((c) => c._id === convParam)) {
      setSelectedId(convParam);
    }
  }, [convParam, conversations]);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container-main py-20 text-center">
          <p className="text-muted-foreground">Please log in to view messages.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container-main py-6">
        <h1 className="mb-6 text-2xl font-bold text-foreground">Messages</h1>
        <div className="flex h-[600px] gap-4 rounded-lg border bg-card overflow-hidden">
          <div className="w-80 shrink-0 border-r overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <MessageSquare size={40} className="mx-auto mb-2 opacity-50" />
                <p>No conversations yet</p>
                <p className="text-sm mt-1">Start a chat from a contractor profile</p>
              </div>
            ) : (
              conversations.map((c) => {
                const other = getOtherParticipant(c, user._id);
                return (
                  <button
                    key={c._id}
                    type="button"
                    onClick={() => setSelectedId(c._id)}
                    className={`flex w-full items-center gap-3 border-b p-4 text-left transition-colors hover:bg-muted/50 ${
                      selectedId === c._id ? "bg-muted" : ""
                    }`}
                  >
                    <img
                      src={getAvatar(other)}
                      alt=""
                      className="h-12 w-12 rounded-full object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{other?.name ?? "Unknown"}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {c.lastMessage || "No messages"}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(c.lastMessageAt), { addSuffix: true })}
                    </span>
                  </button>
                );
              })
            )}
          </div>
          <div className="flex-1 flex flex-col min-w-0">
            {selectedId ? (
              <ChatPanel
                conversationId={selectedId}
                userId={user._id}
                socket={socket}
                typing={typing}
                setTyping={setTyping}
                messagesEndRef={messagesEndRef}
                conversations={conversations}
                onBack={() => setSelectedId(null)}
              />
            ) : (
              <div className="flex flex-1 items-center justify-center text-muted-foreground">
                Select a conversation
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatPanel({
  conversationId,
  userId,
  socket,
  typing,
  setTyping,
  messagesEndRef,
  conversations,
  onBack,
}: {
  conversationId: string;
  userId: string;
  socket: ReturnType<typeof useSocket>["socket"];
  typing: string | null;
  setTyping: (v: string | null) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  conversations: Conversation[];
  onBack: () => void;
}) {
  const [text, setText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: msgData, refetch } = useMessages(conversationId);
  const sendMessage = useSendMessage();
  const markRead = useMarkMessagesRead();

  const conv = conversations.find((c) => c._id === conversationId);
  const other = conv ? getOtherParticipant(conv, userId) : null;

  useEffect(() => {
    socket?.emit("join_conversation", { conversationId });
    markRead.mutate({ conversationId });
    return () => {
      socket?.emit("leave_conversation", { conversationId });
    };
  }, [conversationId, socket]);

  useEffect(() => {
    if (!socket) return;
    const onNew = () => refetch();
    const onTyping = (data: { userId: string }) => {
      if (data.userId !== userId) {
        setTyping(data.userId);
        setTimeout(() => setTyping(null), 3000);
      }
    };
    socket.on("new_message", onNew);
    socket.on("typing", onTyping);
    return () => {
      socket.off("new_message", onNew);
      socket.off("typing", onTyping);
    };
  }, [socket, conversationId, refetch, setTyping, userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView();
  }, [msgData?.messages, messagesEndRef]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed && selectedFiles.length === 0) return;
    try {
      await sendMessage.mutateAsync({
        conversationId,
        text: trimmed || undefined,
        attachments: selectedFiles.length > 0 ? selectedFiles : undefined,
      });
      setText("");
      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (e) {
      toast({
        title: "Failed to send",
        description: String(e),
        variant: "destructive",
      });
    }
  };

  const handleTyping = () => {
    socket?.emit("typing", { conversationId });
  };

  const messages = msgData?.messages ?? [];

  return (
    <>
      <div className="flex items-center gap-3 border-b p-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="lg:hidden">
          ←
        </Button>
        <img
          src={getAvatar(other)}
          alt=""
          className="h-10 w-10 rounded-full object-cover"
        />
        <div className="flex-1">
          <p className="font-medium">{other?.name ?? "Chat"}</p>
          {typing && typing !== userId && (
            <p className="text-xs text-muted-foreground">typing...</p>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m) => {
          const isMe = (m.senderId as { _id?: string })?._id === userId;
          return (
            <div
              key={m._id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-lg px-4 py-2 ${
                  isMe ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{m.text || ""}</p>
                {m.attachments?.length ? (
                  <div className="mt-2 space-y-1">
                    {m.attachments.map((a) =>
                      a.fileType.startsWith("image/") ? (
                        <a
                          key={a.public_id}
                          href={a.url}
                          target="_blank"
                          rel="noreferrer"
                          className="block"
                        >
                          <img
                            src={a.url}
                            alt=""
                            className="max-h-40 rounded object-cover"
                          />
                        </a>
                      ) : (
                        <a
                          key={a.public_id}
                          href={a.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs underline"
                        >
                          View attachment
                        </a>
                      )
                    )}
                  </div>
                ) : null}
                <p
                  className={`mt-1 text-xs ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                >
                  {formatDistanceToNow(new Date(m.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex flex-col gap-2 border-t p-3">
        {selectedFiles.length > 0 && (
          <div className="flex flex-wrap gap-1 text-xs text-muted-foreground">
            {selectedFiles.map((f, i) => (
              <span key={i} className="rounded bg-muted px-2 py-0.5">
                {f.name}
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf"
            className="hidden"
            onChange={(e) =>
              setSelectedFiles(Array.from(e.target.files || []))
            }
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip size={18} />
          </Button>
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          onInput={handleTyping}
          placeholder="Type a message..."
          className="flex-1"
        />
        <Button
          onClick={handleSend}
          disabled={
            sendMessage.isPending ||
            (!text.trim() && selectedFiles.length === 0)
          }
        >
          {sendMessage.isPending ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Send size={18} />
          )}
        </Button>
        </div>
      </div>
    </>
  );
}
