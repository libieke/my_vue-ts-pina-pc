import axios from "axios";
const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 60000
});
export interface ChatResponse {
  answer: string;
}
export async function sendMessage(message: string): Promise<ChatResponse> {
  const {
    data
  } = await http.post<ChatResponse>("/api/chat", {
    message
  });
  return data;
}