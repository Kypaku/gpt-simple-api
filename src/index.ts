import { Configuration, OpenAIApi, CreateCompletionRequest, CreateCompletionResponse } from "openai";

export default class SimpleGPT {
    protected _key: string
    protected _configuration: Configuration | null
    protected _openai: OpenAIApi | null
    constructor ({key}: {key: string}) {
        this._key = ""
        this._configuration = null
        this._openai = null
        this.setApiKey(key)
    }
    async get(promt: string, opts?: CreateCompletionRequest): Promise<null | string[]> {
        if (!this._openai) return null;
        const response = await this._openai.createCompletion({
            model: opts?.model || "text-davinci-003",
            prompt: promt || opts?.prompt,
            temperature: opts?.temperature || 0,
            max_tokens: opts?.max_tokens || 60,
            top_p: opts?.top_p || 1,
            frequency_penalty: opts?.frequency_penalty || 0.5,
            presence_penalty: opts?.presence_penalty || 0,
        });
        return response.data.choices.map((choice) => choice.text).filter(Boolean) as string[];
    }
    async getFirst(promt: string, opts?: CreateCompletionRequest): Promise<string | undefined> {
        return (await this.get(promt, opts))?.[0];
    }
    async getCode(promt: string, opts?: CreateCompletionRequest): Promise<null | string[]> {
        if (!this._openai) return null;
        const response = await this._openai.createCompletion({
            model: opts?.model || "code-davinci-002",
            prompt: promt || opts?.prompt,
            temperature: opts?.temperature || 0,
            max_tokens: opts?.max_tokens || 256,
            top_p: opts?.top_p || 1,
            frequency_penalty: opts?.frequency_penalty || 0,
            presence_penalty: opts?.presence_penalty || 0,
        });
        return response.data.choices.map((choice) => choice.text).filter(Boolean) as string[];
    },
    async getCodeFirst(promt: string, opts?: CreateCompletionRequest): Promise<string | undefined> {
        return (await this.getCode(promt, opts))?.[0];
    }
    setApiKey(key: string) {
        this._key = key;
        this._configuration = new Configuration({
            apiKey: this._key,
        });
        this._openai = new OpenAIApi(this._configuration);
    }
}

