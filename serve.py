#!/usr/bin/env python3
"""
Simple HTTP server to serve the HTML prototype with proper MIME types
"""
import http.server
import socketserver
import os
import mimetypes

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        super().end_headers()
    
    def guess_type(self, path):
        # Ensure proper MIME types
        mimetype, encoding = mimetypes.guess_type(path)
        if path.endswith('.js'):
            return 'application/javascript', encoding
        elif path.endswith('.ts'):
            return 'application/javascript', encoding
        elif path.endswith('.tsx'):
            return 'application/javascript', encoding
        elif path.endswith('.jsx'):
            return 'application/javascript', encoding
        return mimetype, encoding

if __name__ == "__main__":
    PORT = 8090
    
    # Set the directory to serve files from
    os.chdir('/Users/jonathansun/Downloads/rentguy-main')
    
    Handler = CustomHTTPRequestHandler
    
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"🚀 Server running at http://localhost:{PORT}")
        print(f"📂 Serving files from: {os.getcwd()}")
        print(f"🌐 Open: http://localhost:{PORT}/index.html")
        print(f"🧪 Test: http://localhost:{PORT}/test_properties.html")
        print("Press Ctrl+C to stop the server")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n⏹️  Server stopped")