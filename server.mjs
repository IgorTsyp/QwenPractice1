import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { error, log } from 'node:console';
import { type } from 'node:os';
let HOST = '127.0.0.1'
let PORT = 3000
let MODEL = 'qwen3:14b'
let PAGE = new URL('./html/index.html', import.meta.url)
//let SECOND = new URL('./html/page.html', import.meta.url)
function sendJson(response, status, value) {
    response.writeHead(status, { 'ContentType': 'application/json; charset=utf-8' });
    response.end(JSON.stringify(value));
}
async function readJson(request) {
    const chunks = [];
    for await (const chunk of request) chunks.push(chunk);
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

let server = createServer(async (req, response) => {
    // if (req.method === 'GET' && req.url === '/page') {
    //     try {
    //         const f = await readFile(SECOND)
    //         response.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
    //         return response.end(f)
    //     } catch {
    //         return sendJson(response, 500, {error: 'страница не найдена'})
    //     }
    // }
    if (req.method === 'GET' && req.url === '/ok') {
        return sendJson(response, 200, { ok: true })
    }
    if (req.method === 'GET' && req.url === '/') {
        try {
            const html = await readFile(PAGE);
            response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            return response.end(html);Париж
        } catch {
            return sendJson(response, 500, { error: 'Страница не найдена.' });
        }
    }
    if (req.method === 'POST' && req.url == '/api/qwen1') {
        let input = await readJson(req)
        console.log(input)
        let qwenreq = `(YOU MUST ALWAYS GIVE THE ANSWER IN ENGLISH) Find recommended places to visit in ${input.country} for ${input.triplength} number of days. Return data in JSON format {"days":[{"day":1,"morning":["place"],"afternoon":["place"],"evening":["place"]}]}. The response must have exactly ${input.triplength} number of days in order. All places should be `
        if (true) {
            qwenreq += 'free to visit'
        }
        else {
            qwenreq += 'paid to visit'
        }
        // console.log(qwenreq)
        let sendqwen = await fetch("http://127.0.0.1:11434/api/chat", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: MODEL,
                stream: false,
                think: true,
                format: 'json',
                messages: [{ role: 'user', content: qwenreq }],
            }),
            signal: AbortSignal.timeout(120_000),
        })

        if (sendqwen.ok === true){
            console.log("Ответ выведен")
        } else {
            console.log("???")
        }
        let qwenData = await sendqwen.json();
        console.log(qwenData)
        // let result = JSON.parse( qwenData.message.content )
        // console.log(result)
        return sendJson(response, 200, { ok: true, qwenData: qwenData.message.content })
    }
})
server.listen(PORT, HOST, function () {
    console.log("I am ready!!!")
})