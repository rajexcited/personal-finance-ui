from argparse import ArgumentParser
from string import Template
from typing import Dict, List, Optional
from ...utils import export_to_env, get_parsed_arg_value, get_yaml_to_dict
from ...release_notes import CategoryModel, LabelsModel, ReleaseTemplateModel, get_issues, summarize_category
import os


def get_summarized_category_changes(template_model: ReleaseTemplateModel, category: CategoryModel):
    issues = get_issues(category, template_model.category_labels.exclude if template_model.category_labels is not None else [])
    category_summarization = summarize_category(category_title=category.safe_title,
                                                category_labels=category.labels.include if category.labels.include is not None else [],
                                                change_template=template_model.category_item_change_template,
                                                issues=issues)
    return category_summarization


def get_validated_template(template_dict: Dict):
    template_model = ReleaseTemplateModel.model_validate(template_dict)

    if template_model.category_labels is not None:
        if template_model.category_labels.include is not None:
            raise ValueError("include is not allowed to 'category-labels'")
        if template_model.category_labels.exclude is None:
            raise ValueError("exclude is required to 'category-labels'")
    else:
        template_model.category_labels = LabelsModel(exclude=[])

    for category in template_model.categories:
        if category.labels.include is None:
            raise ValueError("include is required to 'category.labels'")
        # print("category title =", category.title)
        # decoded_text = category.title.encode('utf-8').decode('unicode-escape')
        decoded_text = category.title
        # print("decoded title text =", decoded_text)
        cleaned_text_alphanum = "".join(c for c in decoded_text if c.isalnum() or c.isspace())
        # print("cleaned text =", cleaned_text_alphanum)
        if len(cleaned_text_alphanum) == 0:
            raise ValueError("title has no text")
        category.safe_title = cleaned_text_alphanum.strip()

    return template_model


def substitute_identifiers(template: Template, args: Dict[str, str]):
    idenifiers = template.get_identifiers()
    mapping = dict(**args)
    for iden in idenifiers:
        if iden not in args:
            val = os.getenv(iden)
            if val is not None:
                mapping[iden] = val
    return template.safe_substitute(**mapping)


def create_release_change(template_dict: Dict):
    template_model = get_validated_template(template_dict)
    all_category_changes: List[str] = []

    for category in template_model.categories:
        category_template = Template(template_model.category_template)
        if len(category.template) > 0:
            category_template = Template(category.template)

        summarized_category_changes = get_summarized_category_changes(template_model, category)
        category_changes = substitute_identifiers(category_template, {"TITLE": category.title, "CATEGORY_ITEM_CHANGES": summarized_category_changes})
        all_category_changes.append(category_changes)

    summarized_release_change = substitute_identifiers(Template(template_model.template), {"CATEGORY_CHANGES": "\n".join(all_category_changes)})
    export_to_env({"release_change": summarized_release_change})


if __name__ == "__main__":
    """
    example,
    python -m scripts.request.release.draft --generate --template-path .github/release-draft.template.yml
    dotenv -e ..\\.env.releaseNotes.gemini.local -- python -m scripts.request.release.draft --generate --template-path .github/release-draft.template.yml
    """
    parser = ArgumentParser(
        description="Generate Release Change entries")
    parser.add_argument("--generate", action="store_true",
                        help="[Required] Generate request")
    parser.add_argument("--template-path",
                        help="[Required] Provide path to release draft template")
    args = parser.parse_args()

    try:
        get_parsed_arg_value(args, key="generate", arg_type_converter=bool)
        template_dict = get_parsed_arg_value(args, key="template_path", arg_type_converter=get_yaml_to_dict)

    except Exception as e:
        print("error: ", e)
        parser.print_help()
        exit(1)

    create_release_change(template_dict)
