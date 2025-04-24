from enum import Enum
from typing import List
from pydantic import BaseModel


class AlertType(Enum):
    Important = "alert-important"
    Tip = "alert-tip"
    Note = "alert-note"


class MdAlert(BaseModel):
    alert_type: AlertType = None
    content_lines: List[str] = []


class MdHeader(BaseModel):
    level: int = 0
    title: str = None
    contents: List = []
    raw_contents: List[str] = []


class ListItemType(Enum):
    Todo = "list-item-todo"
    SimpleText = "list-item-simple-text"
    TitleContent = "list-item-title-content"


class MdListItemTodo(BaseModel):
    is_checked: bool = False
    label: str = None


class MdListItemSimpleText(BaseModel):
    text: str = None


class MdListItemTitleContent(BaseModel):
    title: str = None
    content: str = None


class MdListItem(BaseModel):
    item_type: ListItemType = None
    raw_content: str = None
    parsed_content: MdListItemTodo | MdListItemSimpleText | MdListItemTitleContent = None


class MdList(BaseModel):
    items: List[MdListItem] = []
