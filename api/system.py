from http.server import BaseHTTPRequestHandler
import json
import urllib.parse

class handler(BaseHTTPRequestHandler):
    def _set_cors_headers(self):
        """Set CORS headers for all responses"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self._set_cors_headers()
        self.end_headers()
    
    def do_GET(self):
        # Parse the URL path
        parsed_path = urllib.parse.urlparse(self.path)
        path = parsed_path.path
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self._set_cors_headers()
        self.end_headers()
        
        # Handle different system endpoints
        if path.endswith('/status'):
            response = {
                "configured": True,  # Set to True to skip setup
                "status": "running",
                "message": "System is configured and running"
            }
        else:
            response = {
                "message": "System API endpoint",
                "status": "success",
                "available_endpoints": ["/status"]
            }
        
        self.wfile.write(json.dumps(response).encode())
    
    def do_POST(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = {}
            
            if content_length > 0:
                body = self.rfile.read(content_length)
                try:
                    post_data = json.loads(body.decode('utf-8'))
                except json.JSONDecodeError:
                    post_data = {"raw_body": body.decode('utf-8')}
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self._set_cors_headers()
            self.end_headers()
            
            response = {
                "message": "System configuration updated",
                "status": "success",
                "received_data": post_data
            }
            
            self.wfile.write(json.dumps(response).encode())
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self._set_cors_headers()
            self.end_headers()
            
            error_response = {
                "message": "Internal server error",
                "status": "error",
                "error": str(e)
            }
            
            self.wfile.write(json.dumps(error_response).encode())
