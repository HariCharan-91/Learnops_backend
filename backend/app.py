from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import logging
from datetime import datetime
import os

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Configure CORS
cors_origins = os.getenv('CORS_ORIGINS', 'http://localhost:3000').split(',')
CORS(app, origins=cors_origins, supports_credentials=True)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Import and register blueprints
try:
    from routes.auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/auth')
    logger.info("Auth blueprint registered successfully")
except ImportError as e:
    logger.error(f"Failed to import auth blueprint: {e}")
    raise

# Import require_auth decorator
from utils.auth import require_auth, create_supabase_client

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy', 
        'timestamp': datetime.utcnow().isoformat(),
        'service': 'Flask Backend API'
    })

@app.route('/profile', methods=['GET'])
@require_auth
def get_profile():
    """Get user profile"""
    try:
        user = request.current_user
        
        # Simplified user ID extraction
        if hasattr(user, 'id'):
            user_id = user.id
        elif isinstance(user, dict):
            user_id = user.get('id')
        else:
            logger.error(f"Cannot extract user ID from: {type(user)}, {user}")
            return jsonify({'error': 'Invalid user data structure'}), 400
        
        if not user_id:
            logger.error(f"User ID is None or empty: {user}")
            return jsonify({'error': 'User ID not found'}), 400
        
        logger.info(f"Looking up profile for user ID: {user_id}")
        
        # Get user profile from database
        supabase = create_supabase_client()
        
        # First, check if profiles table exists and has data
        try:
            profile_response = supabase.table('profiles').select('*').eq('id', user_id).execute()
            logger.info(f"Profile query response: {profile_response}")
            
            if profile_response.data and len(profile_response.data) > 0:
                profile = profile_response.data[0]
                return jsonify({'profile': profile}), 200
            else:
                # If no profile exists, create a basic one from auth user data
                logger.info(f"No profile found for user {user_id}, creating basic profile")
                
                # Extract user metadata
                email = getattr(user, 'email', None) or (user.get('email') if isinstance(user, dict) else None)
                user_metadata = getattr(user, 'user_metadata', {}) or (user.get('user_metadata', {}) if isinstance(user, dict) else {})
                
                basic_profile = {
                    'id': user_id,
                    'email': email,
                    'full_name': user_metadata.get('full_name'),
                    'avatar_url': user_metadata.get('avatar_url'),
                    'created_at': datetime.utcnow().isoformat(),
                    'updated_at': datetime.utcnow().isoformat()
                }
                
                # Try to create profile
                try:
                    create_response = supabase.table('profiles').insert(basic_profile).execute()
                    if create_response.data:
                        return jsonify({'profile': create_response.data[0]}), 200
                except Exception as create_error:
                    logger.error(f"Failed to create profile: {create_error}")
                    # Return basic profile even if creation fails
                    return jsonify({'profile': basic_profile}), 200
                
        except Exception as query_error:
            logger.error(f"Database query error: {query_error}")
            # Return user data from auth as fallback
            email = getattr(user, 'email', None) or (user.get('email') if isinstance(user, dict) else None)
            user_metadata = getattr(user, 'user_metadata', {}) or (user.get('user_metadata', {}) if isinstance(user, dict) else {})
            
            fallback_profile = {
                'id': user_id,
                'email': email,
                'full_name': user_metadata.get('full_name'),
                'avatar_url': user_metadata.get('avatar_url')
            }
            return jsonify({
                'profile': fallback_profile,
                'note': 'Profile data from auth service (database unavailable)'
            }), 200
            
    except Exception as e:
        logger.error(f"Get profile error: {str(e)}")
        return jsonify({'error': 'Failed to retrieve profile'}), 500

@app.route('/profile', methods=['PUT'])
@require_auth
def update_profile():
    """Update user profile"""
    try:
        user = request.current_user
        
        # Simplified user ID extraction
        if hasattr(user, 'id'):
            user_id = user.id
        elif isinstance(user, dict):
            user_id = user.get('id')
        else:
            logger.error(f"Cannot extract user ID from: {type(user)}, {user}")
            return jsonify({'error': 'Invalid user data structure'}), 400
        
        if not user_id:
            logger.error(f"User ID is None or empty: {user}")
            return jsonify({'error': 'User ID not found'}), 400
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request body required'}), 400
        
        # Filter allowed fields
        update_data = {}
        allowed_fields = ['full_name', 'avatar_url']
        
        for field in allowed_fields:
            if field in data:
                update_data[field] = data[field]
        
        if not update_data:
            return jsonify({'error': 'No valid fields to update'}), 400
        
        # Add timestamp
        update_data['updated_at'] = datetime.utcnow().isoformat()
        
        logger.info(f"Updating profile for user {user_id} with data: {update_data}")
        
        # Update profile in database
        supabase = create_supabase_client()
        
        try:
            # First check if profile exists
            existing = supabase.table('profiles').select('id').eq('id', user_id).execute()
            
            if existing.data and len(existing.data) > 0:
                # Update existing profile
                response = supabase.table('profiles').update(update_data).eq('id', user_id).execute()
            else:
                # Create new profile with update data
                email = getattr(user, 'email', None) or (user.get('email') if isinstance(user, dict) else None)
                create_data = {
                    'id': user_id,
                    'email': email,
                    'created_at': datetime.utcnow().isoformat(),
                    **update_data
                }
                response = supabase.table('profiles').insert(create_data).execute()
            
            if response.data and len(response.data) > 0:
                return jsonify({
                    'message': 'Profile updated successfully',
                    'profile': response.data[0]
                }), 200
            else:
                logger.error(f"Update response has no data: {response}")
                return jsonify({'error': 'Failed to update profile - no data returned'}), 500
                
        except Exception as db_error:
            logger.error(f"Database operation failed: {db_error}")
            return jsonify({'error': f'Database operation failed: {str(db_error)}'}), 500
            
    except Exception as e:
        logger.error(f"Update profile error: {str(e)}")
        return jsonify({'error': 'Failed to update profile'}), 500


# ADDITIONAL DEBUGGING ENDPOINT:
@app.route('/debug/user', methods=['GET'])
@require_auth
def debug_user():
    """Debug endpoint to see user structure"""
    try:
        user = request.current_user
        return jsonify({
            'user_type': str(type(user)),
            'user_data': user if isinstance(user, dict) else str(user),
            'has_id_attr': hasattr(user, 'id'),
            'has_email_attr': hasattr(user, 'email'),
            'user_dict_keys': list(user.keys()) if isinstance(user, dict) else 'Not a dict'
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
        
@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    logger.error(f"Internal server error: {error}")
    return jsonify({'error': 'Internal server error'}), 500

@app.before_request
def log_request_info():
    """Log request information"""
    logger.info(f"{request.method} {request.url} - {request.remote_addr}")

if __name__ == '__main__':
    # Get configuration from environment or use defaults
    debug_mode = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    host = os.getenv('FLASK_HOST', '0.0.0.0')
    port = int(os.getenv('FLASK_PORT', 5000))
    
    logger.info(f"Starting Flask app on {host}:{port} (debug={debug_mode})")
    app.run(debug=debug_mode, host=host, port=port)