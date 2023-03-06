import { Configuration, OpenAIApi, CreateCompletionRequest, CreateCompletionResponse, CreateImageRequestSizeEnum } from "openai";

export default class SimpleGPT {
    protected _key: string
    protected _configuration: Configuration | null
    protected _openai: OpenAIApi | null

    public get chatGPTQuery(): CreateCompletionRequest {
        return {
            max_tokens: 1000,
            model:"gpt-3.5-turbo-0301",
            temperature: 0.8,
            top_p: 1,
            presence_penalty: 1,
            stop: ["<|endoftext|>"],
            prompt: "Instructions:\nYou are ChatGPT, a large language model trained by OpenAI.\nCurrent date: 2023-02-24<|endoftext|>\n\nUser:\n\nTEXT<|endoftext|>\n\nChatGPT:\n",
            stream: false
        }
    }

    constructor ({key}: {key: string}) {
        this._key = ""
        this._configuration = null
        this._openai = null
        this.setApiKey(key)
    }

    async chatGPT(prompt: string, opts?: Partial<CreateCompletionRequest>): Promise<string | undefined> {
        return await this.getFirst((this.chatGPTQuery?.prompt as string)?.replace("TEXT", prompt), {...this.chatGPTQuery, ...(opts || {})})
    }

    async get(prompt: string, opts?: Partial<CreateCompletionRequest>): Promise<null | string[]> {
        if (!this._openai) return null;
        const response = await this._openai.createCompletion({
            model: opts?.model || "gpt-3.5-turbo-0301",
            prompt: prompt || opts?.prompt,
            temperature: opts?.temperature || 0,
            max_tokens: opts?.max_tokens || 60,
            top_p: opts?.top_p || 1,
            frequency_penalty: opts?.frequency_penalty || 0.5,
            presence_penalty: opts?.presence_penalty || 0,
        });
        return response.data.choices.map((choice) => choice.text).filter(Boolean) as string[];
    }

    async getFirst(prompt: string, opts?: Partial<CreateCompletionRequest>): Promise<string | undefined> {
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

