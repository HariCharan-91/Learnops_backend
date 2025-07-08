from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from functools import wraps
import uuid
import json
from datetime import datetime

from utils.auth import require_auth
from utils.livekit_service import LiveKitService

livekit_bp = Blueprint('livekit', __name__)
livekit_service = LiveKitService()

def handle_livekit_errors(f):
    """Decorator to handle LiveKit service errors"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({
                'success': False,
                'error': f'LiveKit service error: {str(e)}'
            }), 500
    return decorated_function

@livekit_bp.route('/create-room', methods=['POST'])
@cross_origin(supports_credentials=True)
@require_auth
@handle_livekit_errors
def create_room():
    """
    Create a new video conference room
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data:
            return jsonify({
                'success': False,
                'error': 'Request body is required'
            }), 400
        
        # Generate unique room name if not provided
        room_name = data.get('roomName')
        if not room_name:
            room_name = f"room-{uuid.uuid4().hex[:8]}"
        
        # Get optional parameters
        max_participants = data.get('maxParticipants', 2)
        subject = data.get('subject', 'General Tutoring')
        tutor_type = data.get('tutorType', 'AI Tutor')
        
        # Room metadata
        metadata = {
            'subject': subject,
            'tutorType': tutor_type,
            'createdBy': getattr(request.current_user, 'id', None) if not isinstance(request.current_user, dict) else request.current_user.get('id'),
            'createdAt': datetime.utcnow().isoformat(),
            'sessionType': 'tutoring'
        }
        
        # Create room using LiveKit service
        result = livekit_service.create_room(
            room_name=room_name,
            max_participants=max_participants,
            metadata=metadata
        )
        
        if result['success']:
            return jsonify({
                'success': True,
                'room': {
                    'roomName': room_name,
                    'roomId': result['room'].get('sid'),
                    'serverUrl': result['room']['serverUrl'],
                    'maxParticipants': max_participants,
                    'subject': subject,
                    'tutorType': tutor_type,
                    'metadata': metadata,
                    'createdAt': datetime.utcnow().isoformat()
                },
                'message': 'Room created successfully'
            }), 201
        else:
            return jsonify({
                'success': False,
                'error': result['error']
            }), 400
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to create room: {str(e)}'
        }), 500

@livekit_bp.route('/generate-token', methods=['POST'])
@cross_origin(supports_credentials=True)
@require_auth
@handle_livekit_errors
def generate_token():
    """
    Generate participant access token for a room
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'Request body is required'
            }), 400
        
        room_name = data.get('roomName')
        participant_name = data.get('participantName')
        role = data.get('role', 'student')  # 'student' or 'tutor'
        
        if not room_name:
            return jsonify({
                'success': False,
                'error': 'roomName is required'
            }), 400
        
        if not participant_name:
            # Use authenticated user's name as default
            if isinstance(request.current_user, dict):
                participant_name = request.current_user.get('name', f"User-{request.current_user.get('id', '')[:8]}")
            else:
                participant_name = getattr(request.current_user, 'name', f"User-{getattr(request.current_user, 'id', '')[:8]}")
        
        # Set permissions based on role
        permissions = {
            'canPublish': True,
            'canSubscribe': True,
            'canPublishData': True,
            'canUpdateOwnMetadata': True
        }
        
        if role == 'tutor':
            permissions.update({
                'canPublishData': True,
                'canUpdateOwnMetadata': True,
                'hidden': False,
                'recorder': False
            })
        
        # Generate access token
        access_token = livekit_service.generate_access_token(
            room_name=room_name,
            participant_name=participant_name,
            permissions=permissions
        )
        
        if isinstance(request.current_user, dict):
            user_id = request.current_user.get('id')
        else:
            user_id = getattr(request.current_user, 'id', None)
        
        return jsonify({
            'success': True,
            'token': access_token,
            'participant': {
                'name': participant_name,
                'role': role,
                'userId': user_id
            },
            'room': {
                'name': room_name,
                'serverUrl': livekit_service.server_url
            },
            'expiresAt': datetime.utcnow().timestamp() + 3600  # 1 hour
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to generate token: {str(e)}'
        }), 500

@livekit_bp.route('/active-rooms', methods=['GET'])
@cross_origin(supports_credentials=True)
@require_auth
@handle_livekit_errors
def get_active_rooms():
    """
    List all active conference rooms
    """
    try:
        result = livekit_service.list_active_rooms()
        
        if result['success']:
            # Filter and format rooms for response
            formatted_rooms = []
            for room in result['rooms']:
                try:
                    metadata = json.loads(room.get('metadata', '{}'))
                except:
                    metadata = {}
                
                formatted_rooms.append({
                    'roomName': room.get('name'),
                    'roomId': room.get('sid'),
                    'numParticipants': room.get('numParticipants', 0),
                    'maxParticipants': room.get('maxParticipants', 2),
                    'creationTime': room.get('creationTime'),
                    'subject': metadata.get('subject', 'Unknown'),
                    'tutorType': metadata.get('tutorType', 'AI Tutor'),
                    'sessionType': metadata.get('sessionType', 'tutoring'),
                    'createdBy': metadata.get('createdBy'),
                    'metadata': metadata
                })
            
            return jsonify({
                'success': True,
                'rooms': formatted_rooms,
                'totalRooms': len(formatted_rooms)
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': result['error']
            }), 400
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to get active rooms: {str(e)}'
        }), 500

@livekit_bp.route('/room/<room_id>', methods=['DELETE'])
@cross_origin(supports_credentials=True)
@require_auth
@handle_livekit_errors
def delete_room(room_id):
    """
    End a specific conference room
    """
    try:
        # Get room info first to verify it exists and get the room name
        result = livekit_service.list_active_rooms()
        
        if not result['success']:
            return jsonify({
                'success': False,
                'error': 'Failed to verify room existence'
            }), 400
        
        # Find the room by ID or name
        room_name = None
        for room in result['rooms']:
            if room.get('sid') == room_id or room.get('name') == room_id:
                room_name = room.get('name')
                break
        
        if not room_name:
            return jsonify({
                'success': False,
                'error': 'Room not found'
            }), 404
        
        # Delete the room
        delete_result = livekit_service.delete_room(room_name)
        
        if delete_result['success']:
            return jsonify({
                'success': True,
                'message': f'Room {room_name} ended successfully',
                'roomId': room_id
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': delete_result['error']
            }), 400
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to end room: {str(e)}'
        }), 500

@livekit_bp.route('/room/<room_name>/info', methods=['GET'])
@cross_origin(supports_credentials=True)
@require_auth
@handle_livekit_errors
def get_room_info(room_name):
    """
    Get information about a specific room
    """
    try:
        result = livekit_service.get_room_info(room_name)
        
        if result['success']:
            room = result['room']
            try:
                metadata = json.loads(room.get('metadata', '{}'))
            except:
                metadata = {}
            
            return jsonify({
                'success': True,
                'room': {
                    'roomName': room.get('name'),
                    'roomId': room.get('sid'),
                    'numParticipants': room.get('numParticipants', 0),
                    'maxParticipants': room.get('maxParticipants', 2),
                    'creationTime': room.get('creationTime'),
                    'subject': metadata.get('subject', 'Unknown'),
                    'tutorType': metadata.get('tutorType', 'AI Tutor'),
                    'sessionType': metadata.get('sessionType', 'tutoring'),
                    'createdBy': metadata.get('createdBy'),
                    'metadata': metadata
                }
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': result['error']
            }), 404
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to get room info: {str(e)}'
        }), 500

# Health check endpoint for LiveKit service
@livekit_bp.route('/health', methods=['GET'])
@cross_origin(supports_credentials=True)
def livekit_health():
    """
    Check LiveKit service health
    """
    try:
        # Test connection by listing rooms
        result = livekit_service.list_active_rooms()
        
        return jsonify({
            'success': True,
            'service': 'LiveKit Video Service',
            'status': 'healthy' if result['success'] else 'degraded',
            'serverUrl': livekit_service.server_url,
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'service': 'LiveKit Video Service',
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 503 