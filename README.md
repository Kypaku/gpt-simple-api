# gpt-simple-api
A simple client GPT API written in Typescript.

# Install
```
npm i gpt-simple-api-ts
```

# Sample:

```
const SimpleAPI = require('gpt-simple-api-ts')

SimpleAPI.setApiKey(process.env.OPENAI_API_KEY)

async function main () {
    const res = await SimpleAPI.getFirst("Give me a reason")
    console.log("main", res)
}

main()
```

## Methods:

# setApiKey(key: string)

Sets the key
To get an API KEY you need to register new OPEN API account and then visit https://platform.openai.com/account/api-keys

# async get(promt: string, opts?: CreateCompletionRequest): Promise<null | string[]>

Get text completions

# async getFirst(promt: string, opts?: CreateCompletionRequest): Promise<string | undefined>

Get one text completion

# async getCode(promt: string, opts?: CreateCompletionRequest): Promise<null | string[]>

Get code completions

# async getCodeFirst(promt: string, opts?: CreateCompletionRequest): Promise<string | undefined>

Get one code complettion
