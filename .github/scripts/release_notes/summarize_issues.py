from pathlib import Path
from string import Template
from typing import List
from pydantic import TypeAdapter
from .models import IssueModel
from . import llm


def summarize_category(category_title: str, category_labels: List[str], change_template: str, issues: List[IssueModel]):
    summarized_responses: List[str] = []
    if len(issues) > 0:
        chunk_size = 40
        for i in range(0, len(issues), chunk_size):
            chunk_issues = issues[i:i+chunk_size]
            prompt = get_category_summarizer_prompt(category_title=category_title,
                                                    category_labels=category_labels,
                                                    change_template=change_template,
                                                    issues=chunk_issues)

            response = llm.generate_content(prompt)
            summarized_responses.append(response)

    return "\n".join(summarized_responses)


def get_category_summarizer_prompt(category_title: str, category_labels: List[str], change_template: str, issues: List[IssueModel]):
    # read file
    prompt_file_path = Path(__file__).resolve().parent/"issue-category-summarize.prompt.txt"
    with open(prompt_file_path, mode="r", encoding="utf-8") as f:
        prompt = f.read()
        prompt_template = Template(prompt)
        prompt_identifiers = prompt_template.get_identifiers()
        required_identifiers = ["category_title", "category_labels", "change_template", "issues_json"]
        missing_identifiers = set(required_identifiers) - set(prompt_identifiers)
        if len(missing_identifiers) > 0:
            raise ValueError(f"prompt doesnt required identifiers. missing identifiers: {missing_identifiers}")

        missing_identifiers = set(prompt_identifiers) - set(required_identifiers)
        if len(missing_identifiers) > 0:
            raise ValueError(f"prompt has more identifiers than required identifiers. additional identifiers: {missing_identifiers}")

        json_category_labels = str(category_labels)

        issue_list_adapter = TypeAdapter(List[IssueModel])
        json_issues = issue_list_adapter.dump_json(issues).decode()
        print("json issues=", len(json_issues))
        print(json_issues)
        print("-" * 80)
        # iss_model_list = [iss.model_dump() for iss in issues]
        # print("list of issue model dict =", len(iss_model_list))
        # print(iss_model_list)
        # print("-" * 80)
        # iss_model_list_json = json.dumps(iss_model_list)
        # print("model dump issues=", len(iss_model_list_json))
        # print(iss_model_list_json)
        # print("-" * 80)

        substituted_prompt = prompt_template.substitute(category_title=category_title,
                                                        category_labels=json_category_labels,
                                                        change_template=change_template,
                                                        issues_json=json_issues)
        print("prompt: ", substituted_prompt, "\n")
        return substituted_prompt

    raise ValueError("unable to prepare prompt")
