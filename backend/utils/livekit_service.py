import os
import time
import jwt
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import requests
import json

class LiveKitService:
    def __init__(self):
        self.api_key = os.getenv('LIVEKIT_API_KEY')
        self.api_secret = os.getenv('LIVEKIT_API_SECRET')
        self.server_url = os.getenv('LIVEKIT_SERVER_URL', 'wss://your-livekit-server.com')
        
        if not self.api_key or not self.api_secret:
            raise ValueError("LiveKit API credentials not found in environment variables")
    
    def generate_access_token(self, room_name: str, participant_name: str, permissions: Dict = None) -> str:
        """
        Generate a JWT access token for LiveKit room access
        """
        if permissions is None:
            permissions = {
                'canPublish': True,
                'canSubscribe': True,
                'canPublishData': True,
                'canUpdateOwnMetadata': True
            }
        
        # Token payload
        payload = {
            'iss': self.api_key,
            'sub': participant_name,
            'iat': int(time.time()),
            'exp': int(time.time()) + 3600,  # 1 hour expiration
            'room': room_name,
            'video': {
                'room': room_name,
                'roomJoin': True,
                'canPublish': permissions.get('canPublish', True),
                'canSubscribe': permissions.get('canSubscribe', True),
                'canPublishData': permissions.get('canPublishData', True),
                'canUpdateOwnMetadata': permissions.get('canUpdateOwnMetadata', True)
            }
        }
        
        # Generate JWT token
        token = jwt.encode(payload, self.api_secret, algorithm='HS256')
        return token
    
    def create_room(self, room_name: str, max_participants: int = 2, metadata: Dict = None) -> Dict:
        """
        Create a new LiveKit room
        """
        try:
            # Generate admin token for API calls
            admin_token = self._generate_admin_token()
            
            room_config = {
                'name': room_name,
                'emptyTimeout': 300,  # 5 minutes
                'maxParticipants': max_participants,
                'metadata': json.dumps(metadata or {})
            }
            
            headers = {
                'Authorization': f'Bearer {admin_token}',
                'Content-Type': 'application/json'
            }
            
            # Make API call to create room
            response = requests.post(
                f"{self.server_url.replace('wss://', 'https://')}/twirp/livekit.RoomService/CreateRoom",
                headers=headers,
                json=room_config,
                timeout=10
            )
            
            if response.status_code == 200:
                room_data = response.json()
                return {
                    'success': True,
                    'room': {
                        'name': room_data.get('name', room_name),
                        'sid': room_data.get('sid'),
                        'creationTime': room_data.get('creationTime'),
                        'maxParticipants': max_participants,
                        'metadata': metadata,
                        'serverUrl': self.server_url
                    }
                }
            else:
                return {
                    'success': False,
                    'error': f'Failed to create room: {response.text}'
                }
                
        except Exception as e:
            return {
                'success': False,
                'error': f'Room creation failed: {str(e)}'
            }
    
    def list_active_rooms(self) -> Dict:
        """
        List all active LiveKit rooms
        """
        try:
            admin_token = self._generate_admin_token()
            
            headers = {
                'Authorization': f'Bearer {admin_token}',
                'Content-Type': 'application/json'
            }
            
            response = requests.post(
                f"{self.server_url.replace('wss://', 'https://')}/twirp/livekit.RoomService/ListRooms",
                headers=headers,
                json={},
                timeout=10
            )
            
            if response.status_code == 200:
                rooms_data = response.json()
                return {
                    'success': True,
                    'rooms': rooms_data.get('rooms', [])
                }
            else:
                return {
                    'success': False,
                    'error': f'Failed to list rooms: {response.text}'
                }
                
        except Exception as e:
            return {
                'success': False,
                'error': f'Failed to list rooms: {str(e)}'
            }
    
    def delete_room(self, room_name: str) -> Dict:
        """
        Delete a LiveKit room
        """
        try:
            admin_token = self._generate_admin_token()
            
            headers = {
                'Authorization': f'Bearer {admin_token}',
                'Content-Type': 'application/json'
            }
            
            response = requests.post(
                f"{self.server_url.replace('wss://', 'https://')}/twirp/livekit.RoomService/DeleteRoom",
                headers=headers,
                json={'room': room_name},
                timeout=10
            )
            
            if response.status_code == 200:
                return {
                    'success': True,
                    'message': f'Room {room_name} deleted successfully'
                }
            else:
                return {
                    'success': False,
                    'error': f'Failed to delete room: {response.text}'
                }
                
        except Exception as e:
            return {
                'success': False,
                'error': f'Failed to delete room: {str(e)}'
            }
    
    def get_room_info(self, room_name: str) -> Dict:
        """
        Get information about a specific room
        """
        try:
            admin_token = self._generate_admin_token()
            
            headers = {
                'Authorization': f'Bearer {admin_token}',
                'Content-Type': 'application/json'
            }
            
            response = requests.post(
                f"{self.server_url.replace('wss://', 'https://')}/twirp/livekit.RoomService/ListRooms",
                headers=headers,
                json={'names': [room_name]},
                timeout=10
            )
            
            if response.status_code == 200:
                rooms_data = response.json()
                rooms = rooms_data.get('rooms', [])
                
                if rooms:
                    return {
                        'success': True,
                        'room': rooms[0]
                    }
                else:
                    return {
                        'success': False,
                        'error': 'Room not found'
                    }
            else:
                return {
                    'success': False,
                    'error': f'Failed to get room info: {response.text}'
                }
                
        except Exception as e:
            return {
                'success': False,
                'error': f'Failed to get room info: {str(e)}'
            }
    
    def _generate_admin_token(self) -> str:
        """
        Generate an admin token for API calls
        """
        payload = {
            'iss': self.api_key,
            'iat': int(time.time()),
            'exp': int(time.time()) + 300,  # 5 minutes
            'video': {
                'roomAdmin': True,
                'roomList': True,
                'roomCreate': True
            }
        }
        
        return jwt.encode(payload, self.api_secret, algorithm='HS256') 