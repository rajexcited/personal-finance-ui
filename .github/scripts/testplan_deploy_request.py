from argparse import ArgumentParser
import enum
import json
import os
from pathlib import Path
import re
from typing import Any, Dict, List
from markdown_to_json import dictify
from datetime import datetime, timedelta


class RequestType(enum):
    Provision = "provision"
    Deprovision = "deprovision"


def flatten_to_string(input: Any):
    if isinstance(input, dict):
        return json.dumps({flatten_to_string(k): flatten_to_string(v) for k, v in input.items()})
    if isinstance(input, list):
        return json.dumps([flatten_to_string(lv) for lv in input])
    if input is None:
        return ""
    return str(input).replace("**", " ")


def validate_test_plan_issue_link(test_plan_dict_value: Any, parent_issue_details: dict, request_form_issue_details: dict, testplan_type: str):
    testplan_content = flatten_to_string(test_plan_dict_value)
    linkMatch = re.match(r"([a-zA-Z]+) Test Plan:.+https.+/issues/(\d+).*",
                         testplan_content, re.IGNORECASE)
    if linkMatch:
        issue_number = int(linkMatch.group(2))
        if issue_number != parent_issue_details["number"]:
            raise ValueError(
                "Request form does not contain Test plan issue link")
        if linkMatch.group(1).lower() != testplan_type.lower():
            raise ValueError("Test Plan type does not match")
    if not linkMatch:
        raise ValueError(
            "Request form does not contain Test plan information")
    if testplan_type.lower() not in request_form_issue_details["title"].lower():
        raise ValueError(
            "Test Plan type is not included in request form title")


def export_to_env(env_to_export: Dict[str, str]):
    # print all os env variables
    # for k, v in os.environ.items():
    #     print(f"{k}={v}")
    github_output_filepath = os.getenv('GITHUB_OUTPUT')
    # print("github_output_filepath=", github_output_filepath)
    if github_output_filepath:
        with open(github_output_filepath, 'a') as env_file:
            for k, v in env_to_export.items():
                print(f"exporting output {k}={v}")
                env_file.write(f"{k}={v}\n")


def validate_release_details(release_details: Any, parent_issue_details: dict, request_form_issue_details: dict):
    has_ui_milestone = False
    api_version = None
    if not isinstance(release_details, List):
        raise TypeError("Release details is not in correct format")
    for listitem in release_details:
        flatten_listitem = flatten_to_string(listitem).lower()
        if "ui version:" in flatten_listitem:
            milestone_version = parent_issue_details["milestone"]["title"]
            if milestone_version not in flatten_listitem or request_form_issue_details["milestone"]["title"] != milestone_version:
                raise ValueError(
                    "UI Version does not match with milestone title")
            has_ui_milestone = True
        if "api version:" in flatten_listitem.lower():
            api_version_match = re.match(r".*api version:\s+(v\d+).*",
                                         flatten_listitem, re.IGNORECASE)
            if not api_version_match:
                raise ValueError("API Version is not in correct format")
            api_version = api_version_match.group(1)

    if not has_ui_milestone:
        raise ValueError(
            "Release details does not contain UI milestone information. Required [Milestone Title of UI]")
    return api_version


def validate_environment_details(environment_details: Any):
    details = flatten_to_string(environment_details).lower()
    if "environment name:" not in details or "test plan environment" not in details:
        raise ValueError(
            "Environment details does not contain necessary information. Required [Test Plan Environment]")


def validate_deployment_schedule(deployment_schedule_list: Any, request_form_issue_details: dict, request_type: RequestType):
    has_preferred_datetime = False
    deployment_scope = None
    if not isinstance(deployment_schedule_list, List):
        raise TypeError("Deployment Schedule is not in correct format")

    for listitem in deployment_schedule_list:
        flatten_listitem = flatten_to_string(listitem).lower()
        if "preferred dateTime:" in flatten_listitem:
            preferred_time_match = re.match(r".+preferred dateTime: (\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}).+",
                                            flatten_listitem, re.IGNORECASE)
            if not preferred_time_match:
                raise ValueError(
                    "Preferred DateTime format is not correct. Please follow `Preferred DateTime: mm-dd-yyyy HH:MM:SS`")
            preferred_date_obj = datetime.strptime(
                preferred_time_match.group(1), "%m-%d-%Y %H:%M:%S")

            allowed_date = datetime.now()+timedelta(hours=1)
            if preferred_date_obj < allowed_date:
                raise ValueError("Preferred DateTime is in past")
            milestone_due_date_obj = datetime.strptime(
                request_form_issue_details["milestone"]["due_on"], "%Y-%m-%dT%H:%M:%SZ")
            end_day_milestone_due_date_obj = milestone_due_date_obj.replace(
                hour=23, minute=59, second=59)
            if preferred_date_obj > end_day_milestone_due_date_obj:
                raise ValueError(
                    "Preferred DateTime is after milestone due date")
            has_preferred_datetime = True
        if "deployment scope:" in flatten_listitem:
            scope_match = re.match(r".*Deployment Scope:\s+([\w\s]+).*",
                                   flatten_listitem, re.IGNORECASE)
            if not scope_match:
                raise ValueError(
                    "Deployment Scope is not in correct format.")
            deployment_scope = scope_match.group(1).strip()
            if deployment_scope not in ["UI only", "UI and API"]:
                raise ValueError(
                    "Deployment Scope is not in correct. Allowed 'UI only' or 'UI and API'")

    if not has_preferred_datetime:
        raise ValueError(
            "Deployment Schedule does not contain preferred datetime. `Preferred DateTime: mm-dd-yyyy HH:MM:SS` is required")
    return deployment_scope


def validate_request_form(parent_issue_details: dict, request_form_issue_details: dict, testplan_type: str):
    # request type is useful to handle any success/failure scenarios
    request_type = None
    request_form_title = flatten_to_string(request_form_issue_details["title"])
    if "[Request] Provision Test Plan Environment" in request_form_title:
        request_type = RequestType.Provision
    elif "[Request] Deprovision Test Plan Environment" in request_form_title:
        request_type = RequestType.Deprovision
    else:
        raise ValueError(
            "Request form title is not in correct format. Please follow template guideline `[Request] Provision/Deprovision Test Plan Environment`")
    export_to_env({"request_type": request_type.value})

    parsed_req_form = dictify(request_form_issue_details.body)
    if not isinstance(parsed_req_form, dict) or len(parsed_req_form.keys()) != 1:
        raise TypeError(
            "request form is not in correct format. Please follow template `Request TPE Deployment for Regression`")

    k, req_form_dict = parsed_req_form.popitem()
    if not isinstance(req_form_dict, dict):
        raise TypeError(
            "request form is not in correct format. Please follow template `Request TPE Deployment for Regression`")

    for k1, v1 in req_form_dict.items():
        heading_key = flatten_to_string(k1).lower()
        if "test plan" in heading_key:
            validate_test_plan_issue_link(
                v1, parent_issue_details, request_form_issue_details, testplan_type)
        if "release details" in heading_key:
            api_version = validate_release_details(
                v1, parent_issue_details, request_form_issue_details)
        if "environment details" in heading_key:
            validate_environment_details(v1)
        if "deployment schedule" in heading_key:
            deployment_scope = validate_deployment_schedule(
                v1, request_form_issue_details, request_type)

    if api_version and "API" not in deployment_scope:
        raise ValueError(
            "API version is provided but deployment scope is not API")
    if not api_version and "API" in deployment_scope:
        print("API version is missing; defaulting to production-like API as deployment scope includes API.")

    out_dict = {"deployment_scope": deployment_scope}
    if api_version:
        out_dict["api_version"] = api_version
    export_to_env(out_dict)


def get_valid_dict(arg: Any) -> Dict:
    ret_dict = arg
    if Path(arg).exists():
        with open(arg, "r") as f:
            ret_dict = json.load(f)
    elif isinstance(arg, str):
        ret_dict = json.loads(arg)

    if isinstance(ret_dict, Dict):
        return arg
    return None


if __name__ == "__main__":
    parser = ArgumentParser(
        description="validates Deployment Request form for TPE environment")
    parser.add_argument("--validate", action="store_true",
                        help="[Required] Validation Request")
    parser.add_argument("--parent-issue-details",
                        help="[Required] Provide parent issue details as json")
    parser.add_argument("--request-form-issue-details",
                        help="[Required] Provide request form issue details as json")
    parser.add_argument("--testplan-type",
                        help="[Required] Provide Testplan type from label")
    args = parser.parse_args()

    try:
        if not args.validate:
            raise ValueError("validate arg is not provided")

        parent_issue_details = get_valid_dict(args.parent_issue_details)
        if not parent_issue_details:
            raise ValueError("parent issue details are not provided")

        request_form_issue_details = args.request_form_issue_details
        if not request_form_issue_details:
            raise ValueError("request form issue details are not provided")

        if not args.testplan_type:
            raise ValueError("testplan type is not provided")

        no_error = True
    except Exception as e:
        no_error = False
        print("error: ", e)
        parser.print_help()

    if not no_error:
        exit(1)

    print("parent issue details", parent_issue_details)
    print("request form issue details", request_form_issue_details)
    print("test plan type", args.testplan_type)
    validate_request_form(parent_issue_details,
                          request_form_issue_details, args.testplan_type)
