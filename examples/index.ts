import SimpleAPI from '../src/index'
import { Blob } from 'buffer';
import fs from 'fs' 


const api = new SimpleAPI({key: process.env.OPENAI_API_KEY || ''})

async function main () {
    // const res = await api.getFirst("Give me a reason")
    // console.log("image", res)
    // const fileName =  FILE_NAME
    // const fileBuffer = fs.readFileSync(fileName )
    // const blob = new Blob([fileBuffer], { type: 'audio/mp3' });
    // const file = new File([blob], fileName, { type: blob.type });
    // const resAudio = await api.transcribe(file)
    // console.log("audio", resAudio)
}

main()