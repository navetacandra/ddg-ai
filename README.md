# `@navetacandra/ddg-ai`

## Introduction

`@navetacandra/ddg-ai` is a JavaScript library that provides an interface to interact with DuckDuckGo's AI chat features. It allows you to generate completions, retrieve available AI models, and handle streaming responses.

## Installation

You can install the package using npm or yarn:

```bash
npm install @navetacandra/ddg-ai
# or
yarn add @navetacandra/ddg-ai
```

## Usage

This library can be used in various JavaScript environments, including Node.js (CommonJS and ES Modules) and browsers.

### JavaScript (ESM)

```javascript
import { getVqdHash, getModels, generateCompletion, EventEmitter } from '@navetacandra/ddg-ai';

// Example usage:
(async () => {
  try {
    // Get VQD Hash
    const vqdHash = await getVqdHash();
    console.log('VQD Hash:', vqdHash);

    // Get Models
    const models = await getModels();
    console.log('Available Models:', models);

    // Generate Completion
    const streamController = new EventEmitter();

    streamController.on('completion', (data) => {
      process.stdout.write(data);
    });

    streamController.on('done', (data) => {
      console.log('\nCompletion Done:', data.message.content);
      console.log('Final VQD Hash:', data.vqd);
    });

    streamController.on('error', (error) => {
      console.error('Stream Error:', error);
    });

    const messages = [{ role: 'user', content: 'Hello, how are you?' }];
    const config = {
      model: models[0]?.model || 'gpt-3.5-turbo', // Use an available model
      streamController,
      vqd: vqdHash,
      tools: {
        LocalSearch: true,
        NewsSearch: false,
        VideoSearch: false,
        WeatherForecast: false,
      },
    };

    await generateCompletion(messages, config);

  } catch (error) {
    console.error('Error:', error.message);
  }
})();
```

### TypeScript

```typescript
import {
  getVqdHash,
  getModels,
  generateCompletion,
  EventEmitter,
  Message,
  CompletionConfig,
  Model,
  VqdHashData
} from '@navetacandra/ddg-ai';

// Example usage:
(async () => {
  try {
    // Get VQD Hash
    const vqdHash: VqdHashData = await getVqdHash();
    console.log('VQD Hash:', vqdHash);

    // Get Models
    const models: Model[] = await getModels();
    console.log('Available Models:', models);

    // Generate Completion
    const streamController = new EventEmitter<'completion' | 'error' | 'done'>();

    streamController.on('completion', (data: string) => {
      process.stdout.write(data);
    });

    streamController.on('done', (data: { vqd: VqdHashData, message: Message }) => {
      console.log('\nCompletion Done:', data.message.content);
      console.log('Final VQD Hash:', data.vqd);
    });

    streamController.on('error', (error: string) => {
      console.error('Stream Error:', error);
    });

    const messages: Message[] = [{ role: 'user', content: 'What is the capital of France?' }];
    const config: CompletionConfig = {
      model: models[0]?.model || 'gpt-3.5-turbo', // Use an available model
      streamController,
      vqd: vqdHash,
      tools: {
        LocalSearch: true,
        NewsSearch: false,
        VideoSearch: false,
        WeatherForecast: false,
      },
    };

    await generateCompletion(messages, config);

  } catch (error: any) {
    console.error('Error:', error.message);
  }
})();
```

### CommonJS (Node.js)

```javascript
const { getVqdHash, getModels, generateCompletion, EventEmitter } = require('@navetacandra/ddg-ai');

// Example usage:
(async () => {
  try {
    // Get VQD Hash
    const vqdHash = await getVqdHash();
    console.log('VQD Hash:', vqdHash);

    // Get Models
    const models = await getModels();
    console.log('Available Models:', models);

    // Generate Completion
    const streamController = new EventEmitter();

    streamController.on('completion', (data) => {
      process.stdout.write(data);
    });

    streamController.on('done', (data) => {
      console.log('\nCompletion Done:', data.message.content);
      console.log('Final VQD Hash:', data.vqd);
    });

    streamController.on('error', (error) => {
      console.error('Stream Error:', error);
    });

    const messages = [{ role: 'user', content: 'Tell me a short story.' }];
    const config = {
      model: models[0]?.model || 'gpt-3.5-turbo',
      streamController,
      vqd: vqdHash,
    };

    await generateCompletion(messages, config);

  } catch (error) {
    console.error('Error:', error.message);
  }
})();
```

### Browser (UMD)

Include the UMD build in your HTML. The library will be available globally as `DuckDuckGoAI`.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DuckDuckGo AI Chat Example</title>
</head>
<body>
    <h1>DuckDuckGo AI Chat</h1>
    <pre id="output"></pre>

    <script src="dist/ddg-ai.umd.js"></script>
    <script>
        const outputElement = document.getElementById('output');

        const log = (message) => {
            outputElement.textContent += message + '\n';
        };

        (async () => {
            try {
                // Get VQD Hash
                const vqdHash = await DuckDuckGoAI.getVqdHash();
                log('VQD Hash: ' + JSON.stringify(vqdHash, null, 2));

                // Get Models
                const models = await DuckDuckGoAI.getModels();
                log('Available Models: ' + JSON.stringify(models, null, 2));

                // Generate Completion
                const streamController = new DuckDuckGoAI.EventEmitter();

                streamController.on('completion', (data) => {
                    outputElement.textContent += data;
                });

                streamController.on('done', (data) => {
                    log('\nCompletion Done: ' + data.message.content);
                    log('Final VQD Hash: ' + JSON.stringify(data.vqd, null, 2));
                });

                streamController.on('error', (error) => {
                    log('Stream Error: ' + error);
                });

                const messages = [{ role: 'user', content: 'What is the highest mountain in the world?' }];
                const config = {
                    model: models[0]?.model || 'gpt-3.5-turbo',
                    streamController,
                    vqd: vqdHash,
                    tools: {
                        LocalSearch: true,
                        NewsSearch: false,
                        VideoSearch: false,
                        WeatherForecast: false,
                    },
                };

                await DuckDuckGoAI.generateCompletion(messages, config);

            } catch (error) {
                log('Error: ' + error.message);
            }
        })();
    </script>
</body>
</html>
```

## API References

### `getVqdHash(request?: RequestMethod): Promise<VqdHashData>`

Retrieves the VQD hash required for subsequent API calls.

  - `request` (optional): A custom `fetch`-like function. Defaults to global `fetch`.
  - Returns: A `Promise` that resolves to a `VqdHashData` object.

### `getModels(request?: RequestMethod): Promise<Model[]>`

Retrieves a list of available AI models from DuckDuckGo.

  - `request` (optional): A custom `fetch`-like function. Defaults to global `fetch`.
  - Returns: A `Promise` that resolves to an array of `Model` objects.

### `generateCompletion(messages: Message[], config: CompletionConfig): Promise<CompletionResponse>`

Generates a text completion from the DuckDuckGo AI model.

  - `messages`: An array of `Message` objects representing the conversation history.
  - `config`: An object containing configuration for the completion.
      - `model`: The ID of the model to use (e.g., `'gpt-3.5-turbo'`).
      - `streamController`: An `EventEmitter` instance to handle streaming events (`'completion'`, `'error'`, `'done'`).
      - `vqd` (optional): A `VqdHashData` object. If not provided, `getVqdHash` will be called internally.
      - `request` (optional): A custom `fetch`-like function. Defaults to global `fetch`.
      - `tools` (optional): An object to enable or disable specific tools for the AI.
          - `LocalSearch`: `boolean`
          - `NewsSearch`: `boolean`
          - `VideoSearch`: `boolean`
          - `WeatherForecast`: `boolean`
  - Returns: A `Promise` that resolves to a `CompletionResponse` object, containing the final message and updated VQD hash.

### `EventEmitter<T extends string>`

A simple event emitter class used for handling streaming responses.

  - `on(event: T, listener: Listener): void`
    Registers a listener for a specific event.
  - `emit(event: T, data?: any): void`
    Emits an event with optional data.

### Types

  - `DDGHash`: `{ DDG_BE_VERSION: string; DDG_FE_CHAT_HASH: string }`
  - `Listener`: `(data?: any) => void`
  - `RequestMethod`: `(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>`
  - `Model`: `{ model: string; modelName: string; inputCharLimit: string; createdBy: string; isOpenSource: boolean; }`
  - `Message`: `{ role: "user" | "assistant"; content: string; }`
  - `VqdHashData`: `{ server_hashes: string[]; client_hashes: string[]; signals: {}; meta: { v: string; challenge_id: string; timestamp: string; }; }`
  - `CompletionConfig`: `{ model: string; streamController: EventEmitter<"completion" | "error" | "done">; vqd?: VqdHashData; request?: RequestMethod; tools?: { LocalSearch: boolean; NewsSearch: boolean; VideoSearch: boolean; WeatherForecast: boolean; }; }`
  - `CompletionResponse`: `{ vqd: VqdHashData; message: Message; }`

## Note

  - This library interacts with an unofficial API of DuckDuckGo AI Chat. API behavior might change without notice, which could break the library's functionality.
  - The `jsdom` dependency is used for parsing VQD hashes in Node.js environments.
  - The `X-Vqd-Hash-1` header is crucial for authentication and is generated dynamically.
  - The library spoofs user-agent and `X-Forwarded-For` headers to mimic a browser environment.

## License

```
MIT License

Copyright (c) 2025 navetacandra

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

```