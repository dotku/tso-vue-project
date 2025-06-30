from mangum import Mangum
import sys
import os

# Add the current directory to Python path for imports
sys.path.append(os.path.dirname(__file__))

from main import app

# Create the Mangum handler for Vercel
handler = Mangum(app)
