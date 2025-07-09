import type {
  CompletionConfig,
  CompletionResponse,
  DDGHash,
  Message,
  Model,
  RequestMethod,
  VqdHashData,
} from "./type";

export { EventEmitter } from "./event";
export type {
  CompletionConfig,
  CompletionResponse,
  DDGHash,
  Message,
  Model,
  RequestMethod,
  VqdHashData,
} from "./type";

const randomIPv4 = (): string =>
  Array.from({ length: 4 })
    .map((_) => Math.floor(Math.random() * 255))
    .join(".");
const randomIPv6Segment = (): string =>
  Math.random().toString(16).slice(2, 6).padStart(4, "0");
const randomIPv6 = (): string =>
  Array.from({ length: 8 })
    .map((_) => randomIPv6Segment())
    .join(":");

const userAgents: string[] = [
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Linux; Android 11; moto g power (2022)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36",
  "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
  "Mozilla/5.0 (Linux; Android 8.0.0; SM-G955U Build/R16NW) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
  "Mozilla/5.0 (Linux; Android 11.0; Surface Duo) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36",
];

let JSDOM: any;
const textDecoder = new TextDecoder();
const textEncoder = new TextEncoder();

const isJson = (json: string): boolean => {
  try {
    return (json && JSON.parse(json)) !== null;
  } catch (_) {
    return false;
  }
};

const setupFetch = (init: RequestInit): RequestInit => {
  return {
    ...(init || {}),
    headers: {
      ...(init.headers || {}),
      "accept-language": "en-US,en;q=0.9,id;q=0.8",
      "content-type": "application/json",
      pragma: "no-cache",
      "user-agent": userAgents[Math.floor(Math.random() * userAgents.length)],
      "x-forwarded-for": `${randomIPv4()}, ${randomIPv6()}`,
      "x-vqd-accept": `1`,
    },
  };
};

const parseVqdHash = async (
  userAgent: string,
  hash: string,
): Promise<VqdHashData> => {
  let currentWindow: any;
  let currentDocument: any;
  let currentNavigator: any;

  if (
    typeof window !== "undefined" &&
    typeof document !== "undefined" &&
    typeof navigator !== "undefined" &&
    "navigator" in window
  ) {
    currentWindow = window;
  } else {
    if (!JSDOM) JSDOM = (await import("jsdom")).JSDOM;
    const jsdom = new JSDOM("", { userAgent });
    currentWindow = jsdom.window;
  }

  currentNavigator = currentWindow.navigator;
  currentDocument = currentWindow.document;

  return new Function(
    "window",
    "navigator",
    "document",
    `return ${atob(hash)}`,
  )(currentWindow, currentNavigator, currentDocument);
};

const parseDDGHash = (html: string): DDGHash => {
  const DDG_BE_VERSION = html.match(/__DDG_BE_VERSION__="([^"]+)"/);
  const DDG_FE_CHAT_HASH = html.match(/__DDG_FE_CHAT_HASH__="([^"]+)"/);

  return {
    DDG_BE_VERSION: (DDG_BE_VERSION && DDG_BE_VERSION[1]) || "",
    DDG_FE_CHAT_HASH: (DDG_FE_CHAT_HASH && DDG_FE_CHAT_HASH[1]) || "",
  };
};

export const getVqdHash = async (request?: RequestMethod) => {
  if (!request) request = fetch;

  const payload = setupFetch({ method: "GET" });
  const response = await request(
    `https://duckduckgo.com/duckchat/v1/status`,
    payload,
  );
  if (!response.ok) throw new Error("Failed get Vqd");

  const vqdHash = response.headers.get("X-Vqd-Hash-1") || "";
  const ua = payload.headers && (payload.headers as any)["user-agent"];

  return await parseVqdHash(ua, vqdHash);
};

export const getModels = async (request?: RequestMethod): Promise<Model[]> => {
  if (!request) request = fetch;

  const payload = setupFetch({ method: "GET" });
  const html = await (
    await request(
      "https://duckduckgo.com/?q=DuckDuckGo+AI+Chat&ia=chat&duckai=1",
      payload,
    )
  ).text();

  const { DDG_FE_CHAT_HASH } = parseDDGHash(html);
  const js = await (
    await request(
      `https://duckduckgo.com/dist/wpm.chat.${DDG_FE_CHAT_HASH}.js`,
      payload,
    )
  ).text();

  const match = js.match(/\$e=\[([^\]]+)\],et=\[(.*)\],tt=/);
  if (!match || !match[1] || !match[2]) throw new Error("Failed get models");

  const supportedTools = new Function(`return [${match[1]}]`)();
  const models = new Function(
    `return [${match[2].replace(/v\.(Free|Internal|Plus)/g, (_, w1) => `"${w1.toUpperCase()}"`).replace(/\$e/g, JSON.stringify(supportedTools))}]`,
  )();
  const availableModels: Model[] = models
    .filter((model: any) => model.availableTo.includes("FREE"))
    .map(
      ({ model, modelName, inputCharLimit, isOpenSource, createdBy }: any) => ({
        model,
        modelName,
        inputCharLimit,
        createdBy,
        isOpenSource: !!isOpenSource,
      }),
    );

  return availableModels;
};

export const generateCompletion = async (
  messages: Message[],
  config: CompletionConfig,
): Promise<CompletionResponse> => {
  if (!config.request) config.request = fetch;
  if (!config.vqd) config.vqd = await getVqdHash(config.request);
  console.log(config.vqd);

  config.vqd = {
    ...config.vqd,
    client_hashes: await Promise.all(
      config.vqd.client_hashes.map(async (c: string) => {
        const encode = textEncoder.encode(c);
        const n = await crypto.subtle.digest("SHA-256", encode);
        const buff = new Uint8Array(n);

        return btoa(buff.reduce((e, t) => e + String.fromCharCode(t), ""));
      }),
    ),
  };

  const bodyPayload = {
    messages,
    model: config.model,
    canUseTools: true,
    metadata: {
      toolChoice: {
        LocalSearch: false,
        NewsSearch: false,
        VideoSearch: false,
        WeatherForecast: false,
        ...(config.tools || {}),
      },
    },
  };

  const payload = setupFetch({
    headers: {
      Accept: "text/event-stream",
      "X-Vqd-Hash-1": btoa(JSON.stringify(config.vqd)),
    },
    method: "POST",
    body: JSON.stringify(bodyPayload),
  });
  const response = await config.request(
    "https://duckduckgo.com/duckchat/v1/chat",
    payload,
  );
  if (!response.ok) {
    config.streamController.emit("error", "Failed get completion");
    throw new Error("Failed get completion");
  }

  const vqd: VqdHashData = await parseVqdHash(
    payload.headers && (payload.headers as any)["user-agent"],
    response.headers.get("X-Vqd-Hash-1") || "",
  );
  const assistantResponse: Message = { role: "assistant", content: "" };
  const reader = response.body?.getReader();

  while (true) {
    const { value, done } = await reader?.read()!;
    if (done) {
      config.streamController.emit("done", { vqd, message: assistantResponse });
      break;
    }

    textDecoder
      .decode(value)
      .split("\n\n")
      .filter((f) => f.startsWith("data: "))
      .map((json: any) => {
        json = json.replace(/^data: /, "");
        if (isJson(json)) {
          json = JSON.parse(json);
          const content = json.message ?? "";
          assistantResponse.content += content;
          config.streamController.emit("completion", content);
        }
      });
  }

  return { vqd, message: assistantResponse };
};
