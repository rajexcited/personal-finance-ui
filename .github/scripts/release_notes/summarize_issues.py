from pathlib import Path
from string import Template
from typing import List, Optional
from pydantic import TypeAdapter
from vertexai.preview.generative_models import GenerativeModel
import vertexai
from .models import IssueModel
from ..utils import get_env_value


# Init Vertex AI
gcp_project_id = get_env_value("GCP_PROJECT_ID")
gcp_location = get_env_value("GCP_LOCATION")
vertexai.init(project=gcp_project_id, location=gcp_location)


def summarize_category(category_title: str, category_labels: List[str], change_template: str, issues: List[IssueModel]):
    summarized_responses: List[str] = []
    if len(issues) > 0:
        llm = get_llm()
        chunk_size = 40
        for i in range(0, len(issues), chunk_size):
            chunk_issues = issues[i:i+chunk_size]
            prompt = get_category_summarizer_prompt(category_title=category_title,
                                                    category_labels=category_labels,
                                                    change_template=change_template,
                                                    issues=chunk_issues)
            response = llm.generate_content(prompt)

            print("response: ", response)
            summarized_responses.append(response.text.strip())

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

        substituted_prompt = prompt_template.substitute(category_title=category_title,
                                                        category_labels=json_category_labels,
                                                        change_template=change_template,
                                                        issues_json=json_issues)
        print("prompt: ", substituted_prompt, "\n")
        return substituted_prompt

    raise ValueError("unable to prepare prompt")


llm_model: Optional[GenerativeModel] = None


def get_llm():
    global llm_model
    if llm_model is None:
        model_name = get_env_value("GCP_MODEL_NAME")
        if model_name is None:
            raise ValueError("model name is not provided")
        llm_model = GenerativeModel(model_name=model_name)
    return llm_model
