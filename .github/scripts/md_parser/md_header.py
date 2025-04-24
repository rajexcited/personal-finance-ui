from enum import Enum
import os
import re
from typing import List
from .md_alert import build_alert, is_alert_type, get_alert, MdAlert
from .md_list import build_list, is_list_item, get_list_item, MdListItem, MdList
from ..utils import is_empty
from .models import MdHeader


class MdType(Enum):
    Header = "md-header"
    ListItem = "md-list-item"
    Alert = "md-alert"


def get_md_type(content: str):
    """
       Supports 
        - Md Header
        - Md bullet List starts with Dash(-)
        - Md Alert
    """
    if is_heading(content):
        return MdType.Header
    if is_list_item(content):
        return MdType.ListItem
    if is_alert_type(content):
        return MdType.Alert
    return None


def parse_line_base_instance(content: str):
    if is_empty(content):
        return content
    content_type = get_md_type(content)
    match content_type:
        case MdType.Header:
            return get_heading(content)
        case MdType.ListItem:
            return get_list_item(content)
        case MdType.Alert:
            return get_alert(content)
        case _:
            return content


def get_heading_match(content: str):
    return re.match(r"^(#+) (.+)", content)


def is_heading(content: str):
    return get_heading_match(content) is not None


def title_strip(in_title: str):
    """
        strips whitespace along with last colon(:) character from title 
    """
    title = in_title.strip(":")
    last_index = title.rfind(":")  # Find the last occurrence
    if last_index != -1:
        title = title[:last_index] + title[last_index + 1:]
    return title


def get_heading(content: str):
    heading_match = get_heading_match(content)
    if heading_match:
        return MdHeader(
            level=len(heading_match.group(1)),
            title=title_strip(heading_match.group(2))
        )
    return None


def get_last_iten_from_list(mylist: List):
    if len(mylist) > 0:
        return mylist[-1]
    return None


def update_header(line_list: List[str], parent_header: MdHeader, line_num: int):
    line = line_list[line_num]
    skip_lines = 0
    content_list = parent_header.contents

    base_instance = parse_line_base_instance(line)
    if isinstance(base_instance, str):
        last_content = get_last_iten_from_list(content_list)
        if isinstance(last_content, str):
            content_list[-1] = last_content + os.linesep + base_instance
        elif not is_empty(base_instance):
            content_list.append(base_instance)
    elif isinstance(base_instance, MdHeader):
        if base_instance.level <= parent_header.level:
            skip_lines = line_num
        else:
            content_list.append(base_instance)
            skip_lines = build_header(
                line_list=line_list[line_num + 1:], parent_header=base_instance)
    elif isinstance(base_instance, MdListItem):
        list_content = MdList(items=[base_instance])
        content_list.append(list_content)
        skip_lines = build_list(
            line_list=line_list[line_num + 1:], parent_list=list_content)
    elif isinstance(base_instance, MdAlert):
        skip_lines = build_alert(
            line_list=line_list[line_num + 1:], parent_alert=base_instance)

    return skip_lines


def build_header(line_list: List[str], parent_header: MdHeader):
    parent_header.contents = content_list = []
    skip_lines = 0
    for line_num, line in enumerate(line_list):
        parent_header.raw_contents.append(line)
        if skip_lines > 0:
            skip_lines -= 1
            continue

        base_instance = parse_line_base_instance(line)
        if isinstance(base_instance, str):
            last_content = get_last_iten_from_list(content_list)
            if isinstance(last_content, str):
                content_list[-1] = last_content + os.linesep + base_instance
            elif not is_empty(base_instance):
                content_list.append(base_instance)
        elif isinstance(base_instance, MdHeader):
            if base_instance.level <= parent_header.level:
                parent_header.raw_contents.pop()
                return line_num
            content_list.append(base_instance)
            base_instance.raw_contents.append(line)
            skip_lines = build_header(
                line_list=line_list[line_num + 1:], parent_header=base_instance)
        elif isinstance(base_instance, MdListItem):
            list_content = MdList(items=[base_instance])
            content_list.append(list_content)
            skip_lines = build_list(
                line_list=line_list[line_num + 1:], parent_list=list_content)
        elif isinstance(base_instance, MdAlert):
            skip_lines = build_alert(
                line_list=line_list[line_num + 1:], parent_alert=base_instance)

        # skip_lines = update_header(line_list, parent_header=parent_header, line_num=line_num)

    return len(line_list)
