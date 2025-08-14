from typing import List, Optional
from pydantic import BaseModel, Field


class CommentsModel(BaseModel):
    total: int
    top_prioritized: List[str]


class IssueModel(BaseModel):
    number: int
    title: str
    body: str
    comments: CommentsModel
    commits: List[str]


class LabelsModel(BaseModel):
    include: Optional[List[str]] = Field(default=None)
    exclude: Optional[List[str]] = Field(default=None)


class CategoryModel(BaseModel):
    title: str = Field(min_length=1)
    safe_title: str = Field(alias="safe-title", default="")
    labels: LabelsModel
    template: str = Field(default="")


class ReleaseTemplateModel(BaseModel):
    name_template: str = Field(alias="name-template", min_length=1)
    tag_template: str = Field(alias="tag-template", min_length=1)
    categories: List[CategoryModel]
    category_labels: Optional[LabelsModel] = Field(alias="category-labels")
    category_template: str = Field(alias="category-template", min_length=1)
    category_item_change_template: str = Field(alias="category-item-change-template", min_length=1)
    template: str = Field(min_length=1)
