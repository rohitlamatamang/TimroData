# routes_location.py - Week 4
# Location data collection endpoint

from flask import Blueprint, request, jsonify

location_bp = Blueprint('location', __name__)

@location_bp.route('/location', methods=['POST'])
def collect_location():
    """Collect user location data"""
    data = request.get_json()
    
    # Week 4+: Validate and store location data
    
    return jsonify({
        'status': 'success',
        'message': 'Location data recorded'
    }), 200
