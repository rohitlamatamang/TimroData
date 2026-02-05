# ua_parser.py - Week 2
# User agent parsing service

from user_agents import parse

def parse_user_agent(user_agent_string):
    """
    Parse user agent string to extract browser and OS info
    
    Args:
        user_agent_string (str): User agent string from request
        
    Returns:
        dict: Parsed browser and OS information
    """
    ua = parse(user_agent_string)
    
    return {
        'browser': f"{ua.browser.family} {ua.browser.version_string}",
        'os': f"{ua.os.family} {ua.os.version_string}",
        'device': ua.device.family,
        'is_mobile': ua.is_mobile,
        'is_tablet': ua.is_tablet,
        'is_pc': ua.is_pc
    }
