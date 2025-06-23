from functools import wraps
from flask import request, jsonify
from supabase import create_client
import os
import logging

logger = logging.getLogger(__name__)

def create_supabase_client():
    """Create and return Supabase client"""
    SUPABASE_URL = os.getenv('SUPABASE_URL')
    SUPABASE_KEY = os.getenv('SUPABASE_ANON_KEY')
    
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError("Missing Supabase configuration")
    
    return create_client(SUPABASE_URL, SUPABASE_KEY)

def verify_supabase_token(token):
    """Verify Supabase JWT token and return user"""
    try:
        supabase = create_supabase_client()
        # Use get_user() which accepts the JWT token
        response = supabase.auth.get_user(token)
        
        # Check if we have a valid user response
        if hasattr(response, 'user') and response.user:
            return response.user
        elif isinstance(response, dict) and response.get('user'):
            return response['user']
        else:
            logger.error(f"No user found in token verification response: {response}")
            return None
            
    except Exception as e:
        logger.error(f"Token verification failed: {str(e)}")
        return None

def require_auth(f):
    """Decorator to require authentication for routes"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return jsonify({'error': 'Authorization header required'}), 401
        
        try:
            # Extract token from "Bearer <token>"
            if not auth_header.startswith('Bearer '):
                return jsonify({'error': 'Invalid authorization header format. Use: Bearer <token>'}), 401
                
            token = auth_header.split(' ')[1]
            
            if not token:
                return jsonify({'error': 'Token not provided'}), 401
            
            user = verify_supabase_token(token)
            if not user:
                return jsonify({'error': 'Invalid or expired token'}), 401
            
            # Add user to request context
            request.current_user = user
            return f(*args, **kwargs)
            
        except IndexError:
            return jsonify({'error': 'Invalid authorization header format'}), 401
        except Exception as e:
            logger.error(f"Authentication error: {str(e)}")
            return jsonify({'error': 'Authentication failed'}), 401
    
    return decorated_function