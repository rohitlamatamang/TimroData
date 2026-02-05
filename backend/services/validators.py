# validators.py - Week 2+
# Input validation functions

def validate_baseline_data(data):
    """
    Validate baseline data from client
    
    Args:
        data (dict): Input data to validate
        
    Returns:
        tuple: (is_valid, error_message)
    """
    required_fields = ['user_agent', 'language', 'screen_width', 'screen_height', 'timezone']
    
    for field in required_fields:
        if field not in data:
            return False, f"Missing required field: {field}"
    
    return True, None

def validate_location_data(data):
    """
    Validate location data from client
    
    Args:
        data (dict): Input data to validate
        
    Returns:
        tuple: (is_valid, error_message)
    """
    required_fields = ['latitude', 'longitude']
    
    for field in required_fields:
        if field not in data:
            return False, f"Missing required field: {field}"
    
    # Validate coordinate ranges
    lat = data.get('latitude')
    lon = data.get('longitude')
    
    if not (-90 <= lat <= 90):
        return False, "Invalid latitude"
    
    if not (-180 <= lon <= 180):
        return False, "Invalid longitude"
    
    return True, None
