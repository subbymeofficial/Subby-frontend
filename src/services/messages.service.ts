import apiClient, { unwrap } from "@/lib/api-client";

export interface Message {
  _id: string;
  conversationId: string;
  senderId: { _id: string; name?: string; avatar?: string; profileImage?: { url: string } };
  text: string;
  attachments: Array<{ public_id: string; url: string; fileType: string }>;
  read: boolean;
  createdAt: string;
}

export interface CreateMessageData {
  conversationId: string;
  text?: string;
}

export const messagesService = {
  async create(data: CreateMessageData, attachments?: File[]): Promise<Message> {
    const formData = new FormData();
    formData.append("conversationId", data.conversationId);
    if (data.text) formData.append("text", data.text);
    attachments?.forEach((f) => formData.append("attachments", f));

    const res = await apiClient.post("/messages", formData);
    return unwrap(res);
  },

  async getByConversation(
    conversationId: string,
    page = 1,
    limit = 50
  ): Promise<{
    messages: Message[];
    total: number;
    page: number;
    limit: number;
  }> {
    const res = await apiClient.get(`/messages/conversation/${conversationId}`, {
      params: { page, limit },
    });
    return unwrap(res);
  },

  async markAsRead(conversationId: string, messageIds?: string[]): Promise<void> {
    await apiClient.post("/messages/mark-read", {
      conversationId,
      messageIds,
    });
  },
};
