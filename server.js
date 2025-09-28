const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8000;
const HOST = '0.0.0.0';

// MIME types
const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    
    // Handle root path
    if (req.url === '/') {
        req.url = '/simple-demo.html';
    }
    
    // Remove query string
    const filePath = path.join(__dirname, req.url.split('?')[0]);
    
    // Security check - prevent directory traversal
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Forbidden');
        return;
    }
    
    // Check if file exists
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`
                <!DOCTYPE html>
                <html lang="ar" dir="rtl">
                <head>
                    <meta charset="UTF-8">
                    <title>404 - الصفحة غير موجودة</title>
                    <style>
                        body { font-family: Arial; text-align: center; padding: 50px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
                        .container { max-width: 600px; margin: 0 auto; background: rgba(255,255,255,0.1); padding: 30px; border-radius: 15px; }
                        a { color: #fbbf24; text-decoration: none; }
                        a:hover { text-decoration: underline; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>404 - الصفحة غير موجودة</h1>
                        <p>الصفحة المطلوبة غير موجودة</p>
                        <p><a href="/simple-demo.html">العودة للصفحة الرئيسية</a></p>
                    </div>
                </body>
                </html>
            `);
            return;
        }
        
        // Get file extension
        const ext = path.extname(filePath).toLowerCase();
        const contentType = mimeTypes[ext] || 'application/octet-stream';
        
        // Read and serve file
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end('Internal Server Error');
                return;
            }
            
            // Set CORS headers
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        });
    });
});

server.listen(PORT, HOST, () => {
    console.log(`🚀 خادم Adham AgriTech يعمل على http://${HOST}:${PORT}`);
    console.log(`📱 الروابط المتاحة:`);
    console.log(`   • http://localhost:${PORT}/simple-demo.html - عرض سريع`);
    console.log(`   • http://localhost:${PORT}/index.html - الصفحة الرئيسية`);
    console.log(`   • http://localhost:${PORT}/demo.html - واجهة المستخدم`);
    console.log(`   • http://localhost:${PORT}/api-demo.html - Backend API`);
    console.log(`\n✅ جاهز للاستخدام!`);
});

// Handle server errors
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ المنفذ ${PORT} مستخدم بالفعل. جرب منفذ آخر.`);
    } else {
        console.error('❌ خطأ في الخادم:', err);
    }
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 إيقاف الخادم...');
    server.close(() => {
        console.log('✅ تم إيقاف الخادم بنجاح');
        process.exit(0);
    });
});