import SimpleAPI from '../src/index'

const api = new SimpleAPI({key: process.env.OPENAI_API_KEY || ''})

async function main () {
    const res = await api.getImage("Give me a reason")
    console.log("main", res)
}

main()