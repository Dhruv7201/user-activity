from datetime import timedelta, datetime


def time_string_to_timedelta(time_str):
    hours, minutes, seconds = map(int, time_str.split(':'))
    return timedelta(hours=hours, minutes=minutes, seconds=seconds)



def parse_datetime_with_fractional_seconds(datetime_str):
    formats = ["%Y-%m-%d %H:%M:%S", "%Y-%m-%d %H:%M:%S.%f"]
    
    for format_str in formats:
        try:
            return datetime.strptime(datetime_str, format_str)
        except ValueError:
            pass

    # Handle the case when none of the formats match
    raise ValueError(f"Unable to parse datetime string: {datetime_str}")
