const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const PUBLIC_DIR = __dirname;
const TEMPLATE_DIR = path.join(PUBLIC_DIR, 'assets', 'templates');
const IMGS_DIR = path.join(TEMPLATE_DIR, 'thumbs');

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

// Ensure template folders exist
function ensureDirectoriesExist() {
    if (!fs.existsSync(TEMPLATE_DIR)) {
        fs.mkdirSync(TEMPLATE_DIR, { recursive: true });
    }
    if (!fs.existsSync(IMGS_DIR)) {
        fs.mkdirSync(IMGS_DIR, { recursive: true });
    }
}

const server = http.createServer((req, res) => {
    // CORS headers for local environment
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    let pathname = parsedUrl.pathname;

    // --- API: Get Saved Templates ---
    if (pathname === '/api/templates' && req.method === 'GET') {
        ensureDirectoriesExist();
        const registryPath = path.join(TEMPLATE_DIR, 'templates.json');
        
        let templates = [];
        if (fs.existsSync(registryPath)) {
            try {
                const data = fs.readFileSync(registryPath, 'utf8');
                templates = JSON.parse(data);
            } catch (err) {
                console.error("Error reading template registry file:", err);
            }
        }
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(templates));
        return;
    }

    // --- API: Save Template ---
    if (pathname === '/api/save-template' && req.method === 'POST') {
        ensureDirectoriesExist();
        
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            try {
                const payload = JSON.parse(body);
                const { name, width, height, canvas, thumbnail, filename } = payload;
                
                if (!canvas || !thumbnail) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: "Missing canvas objects or thumbnail data." }));
                    return;
                }
                
                const templateId = payload.id ? parseInt(payload.id, 10) : Date.now();
                const cleanName = name ? name.trim() : `Template-${templateId}`;
                const fileBaseName = filename ? filename.trim() : templateId.toString();
                
                // Save thumbnail PNG to imgs folder
                const base64Data = thumbnail.replace(/^data:image\/\w+;base64,/, "");
                const imagePath = path.join(IMGS_DIR, `${fileBaseName}.png`);
                fs.writeFileSync(imagePath, Buffer.from(base64Data, 'base64'));

                // Save canvas JSON source to templates folder as a separate file
                const canvasPath = path.join(TEMPLATE_DIR, `${fileBaseName}.json`);
                const templateFileContent = {
                    name: cleanName,
                    width: width || 595,
                    height: height || 842,
                    canvas: canvas
                };
                fs.writeFileSync(canvasPath, JSON.stringify(templateFileContent, null, 2), 'utf8');
                
                // Read and Update templates.json registry array (metadata index)
                const registryPath = path.join(TEMPLATE_DIR, 'templates.json');
                let templates = [];
                if (fs.existsSync(registryPath)) {
                    try {
                        const fileContent = fs.readFileSync(registryPath, 'utf8');
                        templates = JSON.parse(fileContent);
                    } catch (e) {
                        console.warn("Registry templates.json corrupt, resetting to empty array.");
                        templates = [];
                    }
                }
                
                const newTemplateMeta = {
                    id: templateId,
                    name: cleanName,
                    width: width || 595,
                    height: height || 842,
                    thumbnail: `assets/templates/thumbs/${fileBaseName}.png`,
                    source: `assets/templates/${fileBaseName}.json`
                };
                
                templates.unshift(newTemplateMeta); // Add new template metadata at the beginning
                
                fs.writeFileSync(registryPath, JSON.stringify(templates, null, 2), 'utf8');
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, template: newTemplateMeta }));
            } catch (err) {
                console.error("Error saving template:", err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: "Server error parsing or writing template files." }));
            }
        });
        return;
    }

    // --- Static File Server ---
    // If request has no extension, assume it wants index.html (SPA / index fallback)
    if (pathname === '/' || pathname.endsWith('/')) {
        pathname = '/index.html';
    }

    const safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
    const filePath = path.join(PUBLIC_DIR, safePath);

    // Security check: ensure file is within workspace root
    if (!filePath.startsWith(PUBLIC_DIR)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('403 Forbidden');
        return;
    }

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, { 'Content-Type': contentType });
        const stream = fs.createReadStream(filePath);
        stream.pipe(res);
    });
});

server.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 Pixora Local Server running at http://localhost:${PORT}`);
    console.log(`📂 Serving directory: ${PUBLIC_DIR}`);
    console.log(`======================================================\n`);
});
