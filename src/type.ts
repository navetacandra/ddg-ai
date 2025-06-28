import { EventEmitter } from "./event";
export type DDGHash = { DDG_BE_VERSION: string; DDG_FE_CHAT_HASH: string };
export type Listener = (data?: any) => void;

export type RequestMethod = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

export type Model = {
  model: string;
  modelName: string;
  inputCharLimit: string;
  createdBy: string;
  isOpenSource: boolean;
};

export type Message = {
  role: "user" | "assistant";
  content: string;
};

export type VqdHashData = {
  server_hashes: string[];
  client_hashes: string[];
  signals: {};
  meta: {
    v: string;
    challenge_id: string;
    timestamp: string;
  };
};

export type CompletionConfig = {
  model: string;
  streamController: EventEmitter<"completion" | "error" | "done">;
  vqd?: VqdHashData;
  request?: RequestMethod;
  tools?: {
    LocalSearch: boolean;
    NewsSearch: boolean;
    VideoSearch: boolean;
    WeatherForecast: boolean;
  };
};

export type CompletionResponse = {
  vqd: VqdHashData;
  message: Message;
};
