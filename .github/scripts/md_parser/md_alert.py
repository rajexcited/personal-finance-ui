from typing import List
from .models import MdAlert, AlertType


def get_alert_ind(content: str):
    alert_identifier_list = ["> [!IMPORTANT]", "> [!TIP]", "> [!NOTE]"]
    try:
        return alert_identifier_list.index(content.strip())
    except:
        return -1


def is_alert_type(content: str):
    return get_alert_ind(content) != -1


def get_alert(content: str):
    alert_type_list = [AlertType.Important, AlertType.Tip, AlertType.Note]
    match_ind = get_alert_ind(content)
    if match_ind != -1:
        return MdAlert(alert_type=alert_type_list[match_ind])
    return None


def build_alert(line_list: List[str], parent_alert: MdAlert):
    for line_num, line in enumerate(line_list):
        if line.startswith("> "):
            parent_alert.content_lines.append(line[2:].strip())
        return line_num
    return len(line_list)
