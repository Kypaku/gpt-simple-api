import { Configuration, OpenAIApi, CreateCompletionRequest, CreateChatCompletionRequest, CreateImageRequestSizeEnum } from "openai-old";
// @ts-ignore
import * as request from "./request/index.js";
import AbortController from "abort-controller";


export default class SimpleGPT {
    protected _key: string
    protected _configuration: Configuration | null
    protected _openai: OpenAIApi | null
    protected req: any
    protected abortController: AbortController = new AbortController();
    protected reader: any


    public get chatModels(): string[] {
        return ["gpt-3.5-turbo", "gpt-3.5-turbo-0301", "gpt-4", "gpt-4-0314"]
    }

    public get defaultOptsGPT(): Partial<CreateCompletionRequest> {
        return {
            model: "gpt-3.5-turbo-0301",
            temperature: 0,
            max_tokens: 60,
            top_p: 1,
            frequency_penalty: 0.5,
            presence_penalty: 0
        }
    }

    constructor ({key}: {key: string}) {
        this._key = ""
        this._configuration = null
        this._openai = null
        this.setApiKey(key)
    }

    async transcribe(formData: FormData) {
        const requestOptions = {
            method: "POST",
            headers: {
                Authorization: `Bearer ${this._key}`,
            },
            body: formData,
        };
        const response = await fetch(
            "https://api.openai.com/v1/audio/transcriptions",
            requestOptions
        ).then((response) => {
            if (response.ok) {
                return response?.json?.();
            } else {
                Promise.reject(response);
            }
        });
        return response.text;
    }

    async getStream(prompt: string, fData: (raw: any, json: {[key: string]: any}, delta: string) => any, fEnd: any, opts?: Partial<CreateCompletionRequest & CreateChatCompletionRequest>): Promise<void> {
        return new Promise((resolve, reject) => {
            const model = opts?.model || this.defaultOptsGPT.model || "";

            const isChatModel = this.chatModels.indexOf(model) >= 0;
            const _prompt = (prompt || opts?.prompt);
            const messages = opts?.messages || [{ role: "user", content: _prompt as string }];

            const endpoint = isChatModel ? "/v1/chat/completions" : "/v1/completions";
            const signal = this.abortController.signal;

            const body = JSON.stringify({
                model,
                prompt: isChatModel ? undefined : _prompt,
                messages: messages,
                temperature: opts?.temperature || this.defaultOptsGPT.temperature,
                max_tokens: opts?.max_tokens || this.defaultOptsGPT.max_tokens || 0,
                top_p: opts?.top_p || 1,
                frequency_penalty: opts?.frequency_penalty || this.defaultOptsGPT.frequency_penalty,
                presence_penalty: opts?.presence_penalty || this.defaultOptsGPT.presence_penalty,
                stream: opts?.stream || true,
            });

            this.req = request({
                url: "https://api.openai.com" + endpoint,
                // hostname: "api.openai.com",
                // port: 443,
                // path: endpoint,
                // signal: signal as any,
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + this._key
                },
                body: body,
            });

            this.req.on("error", (e: any) => {
                console.error("problem with request:" + e.message);
            });

            // req.write(body);
            this.req.on("data", (chunk: any) => {
                try {
                    let delta = "";
                    if (chunk?.toString().match(/^\{\n\s+\"error\"\:/)) {
                        console.error("getStream error:", chunk.toString());
                        reject(JSON.parse(chunk.toString().trim()));
                        return;
                    }
                    const lines = chunk?.toString()?.split("\n") || [];
                    const filtredLines = lines.filter((line: string) => line.trim());
                    const line = filtredLines[filtredLines.length - 1];
                    const data = line.toString().replace("data:", "").replace("[DONE]", "").replace("data: [DONE]", "").trim();
                    if (data) {
                        const json = JSON.parse(data);
                        json.choices.forEach((choice: any) => {
                            delta += choice.text || choice.message?.content || choice.delta?.content || "";
                        });
                        fData(delta, json, chunk.toString());
                    }
                } catch (e) {
                    console.error("getStream handle chunk error:", e, chunk.toString());
                }
            })


            this.req.on("end", () => {
                fEnd?.();
                resolve();
            });

            this.req.on("abort", () => {
                fEnd?.();
                resolve();
            })
        });
    }

    abortStream() {
        this.req?.abort();
    }
    async get(prompt: string, opts?: Partial<CreateCompletionRequest & CreateChatCompletionRequest>): Promise<null | string[]> {
        if (!this._openai) return null;
        const model = opts?.model || this.defaultOptsGPT.model || ''
        const isChatModel = this.chatModels.indexOf(model) >= 0
        const _prompt =  (prompt || opts?.prompt)
        const messages =  opts?.messages || [{role: "user", content: _prompt as string}]
        const response = await this._openai[isChatModel ? "createChatCompletion" : "createCompletion"]({
            model,
            prompt: isChatModel ? undefined : _prompt,
            messages: messages,
            temperature: opts?.temperature || this.defaultOptsGPT.temperature,
            max_tokens: opts?.max_tokens || this.defaultOptsGPT.max_tokens || 0,
            top_p: opts?.top_p || 1,
            frequency_penalty: opts?.frequency_penalty || this.defaultOptsGPT.frequency_penalty,
            presence_penalty: opts?.presence_penalty || this.defaultOptsGPT.presence_penalty,
        });
        return response.data.choices.map((choice: any) => choice.text || choice.message?.content).filter(Boolean) as string[];
    }

    async getFirst(prompt: string, opts?: Partial<CreateCompletionRequest & CreateChatCompletionRequest>): Promise<string | undefined> {
        return (await this.get(prompt, opts))?.[0];
    }

    async getCode(prompt: string, opts?: Partial<CreateCompletionRequest>): Promise<null | string[]> {
        if (!this._openai) return null;
        const response = await this._openai.createCompletion({
            model: opts?.model || "code-davinci-002",
            prompt: prompt || opts?.prompt,
            temperature: opts?.temperature || 0,
            max_tokens: opts?.max_tokens || 256,
            top_p: opts?.top_p || 1,
            frequency_penalty: opts?.frequency_penalty || 0,
            presence_penalty: opts?.presence_penalty || 0,
        });
        return response.data.choices.map((choice) => choice.text).filter(Boolean) as string[];
    }

    async getCodeFirst(prompt: string, opts?: Partial<CreateCompletionRequest>): Promise<string | undefined> {
        return (await this.getCode(prompt, opts))?.[0];
    }

    async getImages(prompt: string, n: number = 1, size: (256 | 512 | 1024) = 512): Promise<string[]> {
        const response = await this._openai?.createImage({
            prompt,
            n,
            size: `${size}x${size}` as CreateImageRequestSizeEnum,
          });
        return response?.data?.data.map((responseOne) => responseOne.url || '') || []
    }

    async getImage(prompt: string, size: (256 | 512 | 1024) = 512): Promise<string | undefined> {
        return (await this.getImages(prompt, 1 , size))?.[0];
    }

    setApiKey(key: string) {
        this._key = key;
        this._configuration = new Configuration({
            apiKey: this._key,
        });
        this._openai = new OpenAIApi(this._configuration);
    }
}

