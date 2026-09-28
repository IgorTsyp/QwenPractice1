import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
let HOST = '127.0.0.1'
let PORT = 3000
let MODEL = 'qwen3:4b-instruct'
let PAGE = new URL('./html/index.html', import.meta.url)
function sendJson(response,status,value) {
    response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify(value));
}
let server = createServer(async (req, response) => {
    
    if (req.method === 'GET' && req.url === '/ok') {
        return sendJson(response, 200, {ok: true})
    }
    if (req.method === 'GET' && req.url === '/') {
        try {
            const html = await readFile(PAGE);
            response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            return response.end(html);
        } catch {
            return sendJson(response, 500, { error: 'Страница не найдена.' });
        }
    }
})
server.listen(PORT, HOST, function(){
    console.log("I am ready!")
})