const fs = require('fs');
const txt = fs.readFileSync('changeClass.txt', 'utf16le');
const match = txt.match(/"ReplacementContent":"(.*?)","StartLine"/s);
if (match) {
    try {
        const parsed = JSON.parse('"' + match[1] + '"');
        fs.writeFileSync('extracted.txt', parsed);
    } catch(e) {
        console.error(e);
    }
}
