# gpt-simple-api
A simple client OpenAI API written in Typescript.

# Install
```
npm i gpt-simple-api-ts
```

# Example:

```js
// import SimpleAPI from 'gpt-simple-api-ts'
const SimpleAPI = require('gpt-simple-api-ts')

const api = new SimpleAPI({key: process.env.OPENAI_API_KEY})

async function main () {
    const res = await api.getFirst("Give me a reason")
    console.log("main", res)
}

main()
```

# Methods:

### setApiKey(key: string)

Sets the key
To get an API KEY you need to register new OPEN API account and then visit https://platform.openai.com/account/api-keys

### Others
Get an answer as a ChatGPT:
```ts
async chatGPT(promt: string, opts?: CreateCompletionRequest): Promise<null | string[]> 
```

Get text completions:

```ts
async get(promt: string, opts?: CreateCompletionRequest): Promise<null | string[]> 
```


Get one text completion:

```ts
async getFirst(promt: string, opts?: CreateCompletionRequest): Promise<string | undefined> 
```

Get stream:

```ts
async getStream(promt: string, fData, fEnd, opts): Promise<any> 
```

Get code completions:

```ts
async getCode(promt: string, opts?: CreateCompletionRequest): Promise<null | string[]> 
```


Get one code complettion:

```ts
async getCodeFirst(promt: string, opts?: CreateCompletionRequest): Promise<string | undefined> 
```

Transcribe audio:

```ts
async transcribe(formData): Promise<string | undefined> 
```

# Projects that use it:

[Vue-Gpt-Playground](https://github.com/Kypaku/vue-gpt-example)
[GPT ProjectInsight](https://github.com/Kypaku/gpt-project-insight)
