from enum import Enum
import re
from typing import List
from pydantic import BaseModel
from ..utils import is_empty
from .models import MdListItemSimpleText, MdListItemTodo, MdListItemTitleContent, MdListItem, ListItemType, MdList


def get_simpletext_list_item(content: str):
    matched = re.match(r"^[-*+] (.+)", content)
    if not matched:
        return None
    return MdListItemSimpleText(
        text=matched.group(1)
    )


def get_todo_list_item(content: str):
    matched = re.match(r"^-\s+\[(x| )\]\s+(.+)", content)
    if not matched:
        return None
    return MdListItemTodo(
        is_checked=matched.group(1).strip() == "x",
        label=matched.group(2)
    )


def get_title_list_item(content: str):
    matched = re.match(r"- \*\*(.+?):\*\*\s+(.+)", content)
    if not matched:
        return None
    return MdListItemTitleContent(
        title=matched.group(1),
        content=matched.group(2)
    )


def get_list_item(content: str):
    """
        parse into Md List Item instance
    """
    if not is_list_item(content):
        return None
    list_item = MdListItem(raw_content=content)
    todo_item = get_todo_list_item(content)
    if todo_item:
        list_item.item_type = ListItemType.Todo
        list_item.parsed_content = todo_item
        return list_item
    title_item = get_title_list_item(content)
    if title_item:
        list_item.item_type = ListItemType.TitleContent
        list_item.parsed_content = title_item
        return list_item
    text_item = get_simpletext_list_item(content)
    list_item.item_type = ListItemType.SimpleText
    list_item.parsed_content = text_item
    return list_item


def is_list_item(content: str):
    return re.match(r"^[-*+] (.+)", content) is not None


def build_list(line_list: List[str], parent_list: MdList):
    for line_num, line in enumerate(line_list):
        # print("list item line? ", line, "line num", line_num, "empty?",is_empty(line))
        if is_empty(line):
            continue
        list_item = get_list_item(line)
        # print("list item", list_item, "parent list", parent_list)
        if not list_item:
            return line_num
        parent_list.items.append(list_item)
    return len(line_list)


def get_list_items(header_contents: List) -> List[MdListItem]:
    items = []
    for hdr_cnt in header_contents:
        if isinstance(hdr_cnt, MdList):
            for listitem in hdr_cnt.items:
                items.append(listitem)
    return items
