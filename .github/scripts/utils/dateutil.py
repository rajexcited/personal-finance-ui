from datetime import datetime, timedelta
import re
from typing import Optional
import pytz


centraltz = pytz.timezone('US/Central')


def get_preferred_datetime(content: Optional[str]):
    """
    Finds date time matching format mm-dd-yyyy hh:MM:SS
    converts to central timezone
    """
    try:
        if content is not None:
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
        endofday_milestone_dueon_obj = milestone_dueon_obj.replace(hour=23, minute=59, second=59)
        endofday_milestone_dueon_localized = centraltz.localize(endofday_milestone_dueon_obj)
        endofday_milestone_dueon_datetime = endofday_milestone_dueon_localized.astimezone()
        return endofday_milestone_dueon_datetime
    except Exception as e:
        print(e)

    return None


def convert_to_human_readable(tdelta: timedelta):
    def addPluralS(n): return 's' if int(n) > 1 else ''
    def time_format(n, tunit): return f"{n} {tunit}{addPluralS(n)}" if int(n) > 0 else ''
    # Extract days, hours, minutes, and seconds
    weeks, days = divmod(tdelta.days, 7)
    hours, remainder = divmod(tdelta.seconds, 3600)
    minutes, seconds = divmod(remainder, 60)

    readable_format = f" {time_format(weeks, 'week')}"
    readable_format = readable_format.strip()
    readable_format += f" {time_format(days, 'day')} "
    readable_format = readable_format.strip()
    readable_format += f" {time_format(hours, 'hour')}"
    readable_format = readable_format.strip()
    readable_format += f" {time_format(minutes, 'minute')}"
    readable_format = readable_format.strip()
    readable_format += f" {time_format(seconds, 'second')}"
    readable_format = readable_format.strip()

    return readable_format
