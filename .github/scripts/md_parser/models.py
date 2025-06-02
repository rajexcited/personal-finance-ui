from enum import Enum
from typing import List, Optional, Union
from pydantic import BaseModel


class AlertType(Enum):
    Important = "alert-important"
    Tip = "alert-tip"
    Note = "alert-note"


class MdAlert(BaseModel):
    alert_type: Optional[AlertType] = None
    content_lines: List[str] = []


class MdHeader(BaseModel):
    level: int = 0
    title: Optional[str] = None
    contents: List = []
    raw_contents: List[str] = []


class ListItemType(Enum):
    Todo = "list-item-todo"
    SimpleText = "list-item-simple-text"
    TitleContent = "list-item-title-content"


class MdListItemTodo(BaseModel):
    is_checked: bool = False
    label: Optional[str] = None


class MdListItemSimpleText(BaseModel):
    text: Optional[str] = None


class MdListItemTitleContent(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None


class MdListItem(BaseModel):
    item_type: Optional[ListItemType] = None
    raw_content: Optional[str] = None
    parsed_content: Union[MdListItemTodo, MdListItemSimpleText, MdListItemTitleContent, None] = None


class MdList(BaseModel):
    items: List[MdListItem] = []
