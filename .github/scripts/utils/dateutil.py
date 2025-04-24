from datetime import datetime
import re
import pytz


centraltz = pytz.timezone('US/Central')


def get_preferred_datetime(content: str):
    """
    Finds date time matching format mm-dd-yyyy hh:MM:SS
    converts to central timezone
    """
    try:
        datetime_regex = r"\s*(\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}).*"
        preferred_time_match = re.match(datetime_regex, content)
        if preferred_time_match:
            preferred_datetime = preferred_time_match.group(1)
            preferred_datetime = datetime.strptime(preferred_datetime, "%m-%d-%Y %H:%M:%S")
            preferred_date_localized = centraltz.localize(preferred_datetime)
            preferred_date_obj = preferred_date_localized.astimezone()
            return preferred_date_obj
    except Exception as e:
        print(e)
    return None


def get_now():
    """
    Retrieves now timestamp object in central timezone
    """
    timenow = datetime.now(pytz.utc).astimezone(centraltz)
    return timenow


def parse_milestone_dueon(milestone_dueon: str):
    """
    parse the date time string to object
    and converts to central timezone of end of the day
    """
    try:
        milestone_dueon_obj = datetime.strptime(milestone_dueon, "%Y-%m-%dT%H:%M:%SZ")
        milestone_dueon_obj = milestone_dueon_obj.astimezone(centraltz)
        endofday_milestone_dueon_obj = milestone_dueon_obj.replace(hour=23, minute=59, second=59)
        return endofday_milestone_dueon_obj
    except Exception as e:
        print(e)

    return None
