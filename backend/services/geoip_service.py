# geoip_service.py - Week 3
# GeoIP lookup service

import requests

def get_ip_info(ip_address, api_key=None):
    """
    Get geographic information for an IP address
    
    Args:
        ip_address (str): IP address to lookup
        api_key (str): Optional API key for GeoIP service
        
    Returns:
        dict: Geographic information
    """
    try:
        # Using ipapi.co free API (no key required for basic usage)
        response = requests.get(f'https://ipapi.co/{ip_address}/json/')
        response.raise_for_status()
        data = response.json()
        
        return {
            'ip': data.get('ip'),
            'city': data.get('city'),
            'region': data.get('region'),
            'country': data.get('country_name'),
            'country_code': data.get('country_code'),
            'postal': data.get('postal'),
            'latitude': data.get('latitude'),
            'longitude': data.get('longitude'),
            'isp': data.get('org'),
            'timezone': data.get('timezone')
        }
    except Exception as e:
        return {
            'error': str(e),
            'ip': ip_address
        }
