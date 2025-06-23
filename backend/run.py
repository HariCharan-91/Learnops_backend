#!/usr/bin/env python3
"""
Application runner script for the Flask backend.
This script provides a clean way to start the application with proper configuration.
"""

import os
import sys
from dotenv import load_dotenv

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Load environment variables
load_dotenv()

def check_environment():
    """Check if all required environment variables are set"""
    required_vars = [
        'SUPABASE_URL',
        'SUPABASE_ANON_KEY'
    ]
    
    missing_vars = []
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print(f"Error: Missing required environment variables: {', '.join(missing_vars)}")
        print("Please check your .env file and ensure all required variables are set.")
        return False
    
    return True

def main():
    """Main function to run the Flask application"""
    if not check_environment():
        sys.exit(1)
    
    try:
        from app import app
        
        # Get configuration from environment variables
        host = os.getenv('FLASK_HOST', '0.0.0.0')
        port = int(os.getenv('FLASK_PORT', 5000))
        debug = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
        
        print(f"Starting Flask application on {host}:{port}")
        print(f"Debug mode: {debug}")
        print(f"CORS enabled for: {os.getenv('CORS_ORIGINS', 'http://localhost:3000')}")
        
        app.run(host=host, port=port, debug=debug)
        
    except ImportError as e:
        print(f"Error importing application: {e}")
        print("Make sure all dependencies are installed: pip install -r requirements.txt")
        sys.exit(1)
    except Exception as e:
        print(f"Error starting application: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()