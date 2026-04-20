import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import {
  useConversations,
  useMessages,
  useSendMessage,
  useMarkMessagesRead,
} from "@/hooks/use-api";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, MessageSquare, Send, Paperclip, ArrowLeft, Phone } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import type { Conversation } from "@/services/conversations.service";

type Participant = {
  _id: string;
  name?: string;
  phone?: string;
  avatar?: string;
  profileImage?: { url: string };
};

function getOtherParticipant(conv: Conversation, myId: string): Participant | undefined {
  const participants = conv.participants as Participant[];
  return participants.find((p) => p._id !== myId);
}

function getAvatar(p: Participant | undefined) {
  if (!p) return "https://api.dicebear.com/7.x/avataaars/svg?seed=user";
  return (
    p.profileImage?.url ||
    p.avatar ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.name || p._id}`
  );
}

export default function Messages() {
  const { user, isAuthenticated } = useAuth();
  const { socket } = useSocket();
  const [searchParams, setSearchParams] = useSearchParams();
  const convParam = searchParams.get("c");
  const { data: convData, isLoading: convLoading } = useConversations(1, 50);
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

  const handleSelect = (id: string) => {
    setSelectedId(id);
    // Keep the URL in sync so refresh / share keeps the chat open
    setSearchParams({ c: id }, { replace: true });
  };

  const handleBack = () => {
    setSelectedId(null);
    // Remove ?c= when returning to the list on mobile
    searchParams.delete("c");
    setSearchParams(searchParams, { replace: true });
  };

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

  // Fixed heights so the chat input stays on-screen instead of being pushed below the fold.
  // Tailwind arbitrary values: roughly "viewport minus navbar+header" on each breakpoint.
  const containerHeight =
    "h-[calc(100vh-8rem)] md:h-[calc(100vh-10rem)]";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container-main py-4 md:py-6">
        <h1 className="mb-3 md:mb-4 text-xl md:text-2xl font-bold text-foreground">
          Messages
        </h1>
        <div
          className={`flex ${containerHeight} rounded-lg border bg-card overflow-hidden`}
        >
          {/* LIST — hidden on mobile when a conversation is open */}
          <div
            className={`${
              selectedId ? "hidden md:flex" : "flex"
            } w-full md:w-80 shrink-0 border-r flex-col`}
          >
            <div className="shrink-0 border-b p-3 text-sm font-medium text-muted-foreground">
              {conversations.length} conversation
              {conversations.length === 1 ? "" : "s"}
            </div>
            <div className="flex-1 overflow-y-auto">
              {convLoading ? (
                <div className="flex items-center justify-center p-10">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  <MessageSquare size={40} className="mx-auto mb-2 opacity-50" />
                  <p className="font-medium text-foreground">No conversations yet</p>
                  <p className="text-sm mt-1">
                    Tap <span className="font-medium">Message</span> on any contractor
                    card or profile to start a chat.
                  </p>
                </div>
              ) : (
                conversations.map((c) => {
                  const other = getOtherParticipant(c, user._id);
                  return (
                    <button
                      key={c._id}
                      type="button"
                      onClick={() => handleSelect(c._id)}
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
                        <p className="truncate font-medium">
                          {other?.name ?? "Unknown"}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {c.lastMessage || "No messages yet — say hi!"}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(c.lastMessageAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* CHAT — hidden on mobile when nothing selected */}
          <div
            className={`${
              selectedId ? "flex" : "hidden md:flex"
            } flex-1 flex-col min-w-0`}
          >
            {selectedId ? (
              <ChatPanel
                conversationId={selectedId}
                userId={user._id}
                socket={socket}
                typing={typing}
                setTyping={setTyping}
                messagesEndRef={messagesEndRef}
                conversations={conversations}
                onBack={handleBack}
                onError={(msg) =>
                  toast({
                    title: "Failed to send",
                    description: msg,
                    variant: "destructive",
                  })
                }
              />
            ) : (
              <div className="flex flex-1 items-center justify-center p-6 text-center text-muted-foreground">
                <div>
                  <MessageSquare size={36} className="mx-auto mb-2 opacity-50" />
                  <p>Select a conversation to start chatting.</p>
                </div>
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
  onError,
}: {
  conversationId: string;
  userId: string;
  socket: ReturnType<typeof useSocket>["socket"];
  typing: string | null;
  setTyping: (v: string | null) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  conversations: Conversation[];
  onBack: () => void;
  onError: (msg: string) => void;
}) {
  const [text, setText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: msgData, refetch, isLoading } = useMessages(conversationId);
  const sendMessage = useSendMessage();
  const markRead = useMarkMessagesRead();

  const conv = conversations.find((c) => c._id === conversationId);
  const other = conv ? getOtherParticipant(conv, userId) : undefined;

  useEffect(() => {
    socket?.emit("join_conversation", { conversationId });
    markRead.mutate({ conversationId });
    return () => {
      socket?.emit("leave_conversation", { conversationId });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
      onError(e instanceof Error ? e.message : String(e));
    }
  };

  const handleTyping = () => {
    socket?.emit("typing", { conversationId });
  };

  const messages = msgData?.messages ?? [];

  return (
    <>
      {/* Header — includes a Back button on mobile so users can return to the list */}
      <div className="flex shrink-0 items-center gap-3 border-b p-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="md:hidden"
          aria-label="Back to conversation list"
        >
          <ArrowLeft size={20} />
        </Button>
        <img
          src={getAvatar(other)}
          alt=""
          className="h-10 w-10 rounded-full object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{other?.name ?? "Chat"}</p>
          {typing && typing !== userId ? (
            <p className="text-xs text-primary">typing...</p>
          ) : other?.phone ? (
            <a
              href={`tel:${other.phone}`}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <Phone size={12} /> {other.phone}
            </a>
          ) : null}
        </div>
        {other?.phone && (
          <Button
            asChild
            variant="outline"
            size="sm"
            className="hidden sm:inline-flex"
          >
            <a href={`tel:${other.phone}`}>
              <Phone size={14} className="mr-1" /> Call
            </a>
          </Button>
        )}
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center text-sm text-muted-foreground">
            <div>
              <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
              <p>No messages yet.</p>
              <p className="mt-1">Send the first one below 👇</p>
            </div>
          </div>
        ) : (
          messages.map((m) => {
            const isMe = (m.senderId as { _id?: string })?._id === userId;
            return (
              <div
                key={m._id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    isMe
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted rounded-bl-sm"
                  }`}
                >
                  {m.text ? (
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {m.text}
                    </p>
                  ) : null}
                  {m.attachments?.length ? (
                    <div className={`${m.text ? "mt-2" : ""} space-y-1`}>
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
                    className={`mt-1 text-[10px] ${
                      isMe
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    }`}
                  >
                    {formatDistanceToNow(new Date(m.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Composer — sticky at the bottom so it's never pushed off-screen on mobile */}
      <div className="shrink-0 border-t bg-card p-2 md:p-3">
        {selectedFiles.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1 text-xs text-muted-foreground">
            {selectedFiles.map((f, i) => (
              <span key={i} className="rounded bg-muted px-2 py-0.5">
                {f.name}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2">
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
            aria-label="Attach file"
            className="shrink-0"
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
            className="flex-1 min-w-0"
          />
          <Button
            onClick={handleSend}
            disabled={
              sendMessage.isPending ||
              (!text.trim() && selectedFiles.length === 0)
            }
            aria-label="Send message"
            className="shrink-0"
          >
            {sendMessage.isPending ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <Send size={18} className="sm:mr-1" />
                <span className="hidden sm:inline">Send</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </>
  );
}
