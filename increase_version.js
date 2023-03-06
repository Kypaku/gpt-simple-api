import fs from 'fs';

const packageFile = __dirname + '/package.json'
const txt = fs.readFileSync(packageFile)
const modified = txt.replace(/\"version\":\s*"(\d).(\d)+.(\d+)\"/, (res, n1, n2, n3) => `"version": "${n1}.${n2}.${+n3 + 1}"`)
fs.writeFile(packageFile, modified)