# routes_baseline.py - Week 1
# Baseline data collection endpoint

from flask import Blueprint, request, jsonify

baseline_bp = Blueprint('baseline', __name__)

@baseline_bp.route('/baseline', methods=['POST'])
def collect_baseline():
    """Collect baseline browser data"""
    data = request.get_json()
    
    # Week 2+: Process with ua_parser and geoip_service
    # Week 3+: Store in database
    
    return jsonify({
        'status': 'success',
        'message': 'Data received',
        'data': data
    }), 200
