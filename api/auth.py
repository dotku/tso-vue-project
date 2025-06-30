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
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self._set_cors_headers()
        self.end_headers()
        
        response = {
            "message": "Auth API endpoint",
            "status": "success",
            "endpoints": ["POST /login", "POST /register", "GET /profile"]
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
            
            # Parse the URL path to determine the action
            parsed_path = urllib.parse.urlparse(self.path)
            path = parsed_path.path
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self._set_cors_headers()
            self.end_headers()
            
            # Simple mock responses for different auth actions
            if path.endswith('/login'):
                response = {
                    "success": True,
                    "message": "Login successful",
                    "token": "mock-jwt-token-12345",
                    "user": {
                        "id": 1,
                        "username": post_data.get("username", "demo"),
                        "email": "demo@example.com"
                    }
                }
            elif path.endswith('/register'):
                response = {
                    "success": True,
                    "message": "Registration successful",
                    "user": {
                        "id": 2,
                        "username": post_data.get("username", "newuser"),
                        "email": post_data.get("email", "newuser@example.com")
                    }
                }
            else:
                response = {
                    "success": True,
                    "message": "Auth action completed",
                    "received_data": post_data
                }
            
            self.wfile.write(json.dumps(response).encode())
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self._set_cors_headers()
            self.end_headers()
            
            error_response = {
                "success": False,
                "message": "Authentication error",
                "error": str(e)
            }
            
            self.wfile.write(json.dumps(error_response).encode())
