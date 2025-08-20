from argparse import ArgumentError, ArgumentParser
from string import Template
import traceback
from typing import Callable, Dict, List
from pydantic import TypeAdapter
from ...utils import export_to_env, get_parsed_arg_value, get_yaml_to_dict, rootpath
from ...release_notes import CategoryModel, LabelsModel, ReleaseTemplateModel, get_issues, llm, summarize_category, IssueModel
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


def run_example(example_id: int, run_examples_dict: Dict[int, Callable[[], None]]):
    print("-"*80)
    print("-"*30, f"Starting Example-{example_id}")
    print("-"*80)
    print("-"*80)

    try:
        example_call = run_examples_dict.get(example_id)
        if not example_call:
            raise ValueError(f"incorrect id [{example_id}]")

        example_call()

    except:
        print(f"found error in example {example_id}")
        traceback.print_exc()

    print("-"*80)
    print("-"*30, f"Ending Example-{example_id}")
    print("-"*80)


def run_examples():
    examples = {
        1: run_example1,
        2: run_example2,
        3: run_example3,
    }

    run_example(1, examples)
    run_example(2, examples)
    run_example(3, examples)


def run_example1():
    prompt = """ 
    Summarize the key findings of the attached research paper on renewable energy sources, focusing on the feasibility of solar power in urban environments. 
    Present the summary as a bulleted list of 5-7 points.
    """
    response = llm.generate_content(prompt, debug_log=True)
    print("Example-1: retrieved generated contents: ", response)


def run_example2():
    prompt_file_path = rootpath/".github/scripts/release_notes/issue-category-summarize.prompt.txt"
    print("Example-2: prompt_file_path=", prompt_file_path)
    with open(prompt_file_path, mode="r", encoding="utf-8") as f:
        prompt = f.read()
        response = llm.generate_content(prompt, debug_log=True)
        print("Example-2: retrieved generated contents: ", response)


def run_example3():
    category = CategoryModel(
        title="title",
        labels=LabelsModel(
            include=['chore', 'security', 'security alert', 'javascript', 'dependencies', 'test plan', 'technical']
        )
    )
    issues = get_issues(category, [])
    print("Example-3: fetched issues=", issues)
    issue_list_adapter = TypeAdapter(List[IssueModel])
    json_issues = issue_list_adapter.dump_json(issues).decode()
    print("json issues=", len(json_issues))
    print(json_issues)
    print("-" * 40)
    prompt = f"""
    Summarize below issues.
    
    {json_issues}
    """
    response = llm.generate_content(prompt, debug_log=True)
    print("Example-3: retrieved generated contents: ", response)


if __name__ == "__main__":
    """
    example,
    python -m scripts.request.release.draft --generate --template-path .github/release-draft.template.yml
    dotenv -e ..\\.env.releaseNotes.gemini.local -- python -m scripts.request.release.draft --generate --template-path .github/release-draft.template.yml
    """
    parser = ArgumentParser(
        description="Generate Release Change entries")
    parser.add_argument("--generate", action="store_true", default=False,
                        help="[Required] Generate request. Required if not example")
    parser.add_argument("--template-path",
                        help="[Required] Provide path to release draft template. Required if not example")
    parser.add_argument("--example", action="store_true", default=False,
                        help="[Optional] to run example and experiments. If provided, generate is not allowed")
    args = parser.parse_args()

    try:
        is_generate = get_parsed_arg_value(args, key="generate", arg_type_converter=bool)
        is_example = get_parsed_arg_value(args, key="example", arg_type_converter=bool)
        if is_generate and is_example:
            raise ArgumentError(None, "both generate and example options are not allowed. provide either one.")

        if not is_generate and not is_example:
            raise ArgumentError(None, "Provide either generate and example option.")

        template_dict = {}
        if is_generate:
            template_dict = get_parsed_arg_value(args, key="template_path", arg_type_converter=get_yaml_to_dict)

    except Exception as e:
        print("error: ", e)
        parser.print_help()
        exit(1)

    if is_generate:
        create_release_change(template_dict)

    if is_example:
        run_examples()
