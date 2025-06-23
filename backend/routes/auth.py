from flask import Blueprint, request, jsonify
from supabase import create_client
import os
import logging
from datetime import datetime
from utils.auth import require_auth

auth_bp = Blueprint('auth', __name__)
logger = logging.getLogger(__name__)

# Initialize Supabase client
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_ANON_KEY')
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

@auth_bp.route('/signup', methods=['POST'])
def signup():
    """User registration"""
    try:
        data = request.get_json() or {}
        email = data.get('email')
        password = data.get('password')
        full_name = data.get('full_name')
        avatar_url = data.get('avatar_url')
        
        if not email or not password:
            return jsonify({'error': 'Email and password required'}), 400
        
        # Prepare user metadata
        user_metadata = {}
        if full_name:
            user_metadata['full_name'] = full_name
        if avatar_url:
            user_metadata['avatar_url'] = avatar_url
        
        # Sign up user with Supabase
        try:
            signup_resp = supabase.auth.sign_up({
                "email": email,
                "password": password,
                "options": {"data": user_metadata} if user_metadata else {}
            })
            
            logger.info(f"Signup response: {signup_resp}")
            
            # Handle different response formats
            if hasattr(signup_resp, 'user') and hasattr(signup_resp, 'session'):
                user = signup_resp.user
                session = signup_resp.session
            elif isinstance(signup_resp, dict):
                user = signup_resp.get('user')
                session = signup_resp.get('session')
            else:
                logger.error(f"Unexpected signup response format: {type(signup_resp)}")
                return jsonify({'error': 'Unexpected response from authentication service'}), 500
            
            if not user:
                return jsonify({'error': 'User creation failed'}), 400
            
            # If no session, user needs email confirmation
            if not session:
                return jsonify({
                    'message': 'Signup successful. Please check your email for confirmation.',
                    'user': {
                        'id': user.id if hasattr(user, 'id') else user.get('id'),
                        'email': email
                    },
                    'confirmation_required': True
                }), 202
            
            # Return successful signup with session
            return jsonify({
                'message': 'User created successfully',
                'user': {
                    'id': user.id if hasattr(user, 'id') else user.get('id'),
                    'email': email,
                    'full_name': full_name,
                    'avatar_url': avatar_url
                },
                'session': {
                    'access_token': session.access_token if hasattr(session, 'access_token') else session.get('access_token'),
                    'refresh_token': session.refresh_token if hasattr(session, 'refresh_token') else session.get('refresh_token')
                }
            }), 201
            
        except Exception as supabase_error:
            logger.error(f"Supabase signup error: {str(supabase_error)}")
            error_message = str(supabase_error)
            
            # Handle common Supabase errors
            if 'already registered' in error_message.lower():
                return jsonify({'error': 'Email already registered'}), 409
            elif 'password' in error_message.lower():
                return jsonify({'error': 'Password does not meet requirements'}), 400
            else:
                return jsonify({'error': 'Registration failed', 'details': error_message}), 400
        
    except Exception as e:
        logger.exception("Signup exception")
        return jsonify({'error': 'Internal server error'}), 500

@auth_bp.route('/signin', methods=['POST'])
def signin():
    """User login"""
    try:
        data = request.get_json() or {}
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'error': 'Email and password required'}), 400
        
        try:
            response = supabase.auth.sign_in_with_password({
                'email': email,
                'password': password
            })
            
            # Handle different response formats
            if hasattr(response, 'user') and hasattr(response, 'session'):
                user = response.user
                session = response.session
            elif isinstance(response, dict):
                user = response.get('user')
                session = response.get('session')
            else:
                logger.error(f"Unexpected signin response format: {type(response)}")
                return jsonify({'error': 'Authentication failed'}), 401
            
            if user and session:
                user_metadata = {}
                if hasattr(user, 'user_metadata'):
                    user_metadata = user.user_metadata or {}
                elif isinstance(user, dict):
                    user_metadata = user.get('user_metadata', {})
                
                return jsonify({
                    'message': 'Login successful',
                    'user': {
                        'id': user.id if hasattr(user, 'id') else user.get('id'),
                        'email': user.email if hasattr(user, 'email') else user.get('email'),
                        'full_name': user_metadata.get('full_name'),
                        'avatar_url': user_metadata.get('avatar_url')
                    },
                    'session': {
                        'access_token': session.access_token if hasattr(session, 'access_token') else session.get('access_token'),
                        'refresh_token': session.refresh_token if hasattr(session, 'refresh_token') else session.get('refresh_token')
                    }
                }), 200
            else:
                return jsonify({'error': 'Invalid credentials'}), 401
                
        except Exception as supabase_error:
            logger.error(f"Supabase signin error: {str(supabase_error)}")
            error_message = str(supabase_error)
            
            if 'invalid' in error_message.lower() or 'credentials' in error_message.lower():
                return jsonify({'error': 'Invalid email or password'}), 401
            elif 'not confirmed' in error_message.lower():
                return jsonify({'error': 'Please confirm your email before signing in'}), 401
            else:
                return jsonify({'error': 'Authentication failed'}), 401
        
    except Exception as e:
        logger.error(f"Signin error: {str(e)}")
        return jsonify({'error': 'Authentication failed'}), 401

@auth_bp.route('/signout', methods=['POST'])
@require_auth
def signout():
    """User logout"""
    try:
        # Get the current session token
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            
            # Sign out with the specific session
            supabase.auth.sign_out()
            return jsonify({'message': 'Logout successful'}), 200
        else:
            return jsonify({'error': 'No active session found'}), 400
            
    except Exception as e:
        logger.error(f"Signout error: {str(e)}")
        # Even if signout fails on server, we can still return success
        # since the client will remove the token anyway
        return jsonify({'message': 'Logout completed'}), 200

@auth_bp.route('/refresh', methods=['POST'])
def refresh_token():
    """Refresh access token using refresh token"""
    try:
        data = request.get_json() or {}
        refresh_token = data.get('refresh_token')
        
        if not refresh_token:
            return jsonify({'error': 'Refresh token required'}), 400
        
        try:
            response = supabase.auth.refresh_session(refresh_token)
            
            if hasattr(response, 'session') and response.session:
                session = response.session
                user = response.user
                
                return jsonify({
                    'message': 'Token refreshed successfully',
                    'session': {
                        'access_token': session.access_token if hasattr(session, 'access_token') else session.get('access_token'),
                        'refresh_token': session.refresh_token if hasattr(session, 'refresh_token') else session.get('refresh_token')
                    },
                    'user': {
                        'id': user.id if hasattr(user, 'id') else user.get('id'),
                        'email': user.email if hasattr(user, 'email') else user.get('email')
                    } if user else None
                }), 200
            else:
                return jsonify({'error': 'Invalid refresh token'}), 401
                
        except Exception as supabase_error:
            logger.error(f"Token refresh error: {str(supabase_error)}")
            return jsonify({'error': 'Invalid or expired refresh token'}), 401
        
    except Exception as e:
        logger.error(f"Refresh token error: {str(e)}")
        return jsonify({'error': 'Token refresh failed'}), 500