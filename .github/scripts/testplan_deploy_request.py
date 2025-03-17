from argparse import ArgumentParser
from enum import Enum
import json
import os
from pathlib import Path
import re
from typing import Any, Dict, List
from markdown_to_json import dictify
from datetime import datetime, timedelta, tzinfo
import pytz


class RequestType(Enum):
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
    if not github_output_filepath:
        github_output_filepath = Path("dist/GITHUB_OUTPUT")
        github_output_filepath.parent.mkdir(parents=True, exist_ok=True)
        print("since GITHUB_OUTPUT variable is not defined, exporting env to file: ",
              github_output_filepath.resolve())
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
            api_version_match = re.match(r".*api version:\s+(v\d+\.\d+\.\d+).*",
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
        if "preferred datetime:" in flatten_listitem:
            preferred_time_match = re.match(r".+preferred dateTime:\s+(\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}).+",
                                            flatten_listitem, re.IGNORECASE)
            if not preferred_time_match:
                raise ValueError(
                    "Preferred DateTime format is not correct. Please follow `Preferred DateTime: mm-dd-yyyy HH:MM:SS`")
            central = pytz.timezone('US/Central')
            preferred_date_obj = datetime.strptime(
                preferred_time_match.group(1), "%m-%d-%Y %H:%M:%S").astimezone(central)
            now = datetime.now(pytz.utc) \
                .astimezone(central)
            delta = timedelta(hours=1)
            if preferred_date_obj < (now-delta):
                print("preferred_date_obj: ", preferred_date_obj)
                print("now - delta: ", (now-delta))
                raise ValueError("Preferred DateTime is in past")
            if (preferred_date_obj-delta) > now:
                print("preferred_date_obj - delta: ",
                      (preferred_date_obj-delta))
                print("now: ", now)
                raise ValueError("Preferred DateTime is in future")
            milestone_due_date_obj = datetime.strptime(
                request_form_issue_details["milestone"]["due_on"], "%Y-%m-%dT%H:%M:%SZ")
            end_day_milestone_due_date_obj = milestone_due_date_obj.astimezone(central).replace(
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
            if deployment_scope not in ["ui only", "ui and api"]:
                raise ValueError(
                    "Deployment Scope is not in correct. Allowed 'UI only' or 'UI and API'")

    if not has_preferred_datetime:
        raise ValueError(
            "Deployment Schedule does not contain preferred datetime. `Preferred DateTime: mm-dd-yyyy HH:MM:SS` is required")
    return deployment_scope


def parsed_body(requestform_body: str, header1_dummy: bool = False, header2_dummy: bool = False) -> Dict:
    """
    Args:
        requestform_body (str):  request form issue body
        header1_dummy and header2_dummy are used for internal to correct the body to parse in dictionary
    Returns:
        Dictionary of header3 as key and content as value, parsed header3 content value could be of any of these types; list, dict or str.
    """
    parsed_req_form = dictify(requestform_body)
    if not isinstance(parsed_req_form, Dict) and not header1_dummy:
        # add header1 and retry
        return parsed_body("# Dummy\n"+requestform_body, header1_dummy=True)

    incorrect_format_error_message = "request form is not in correct format. Please follow template `Request  Regression - Provision/Deprovision Test Plan Environment`"

    if not isinstance(parsed_req_form, Dict) or len(parsed_req_form) != 1:
        raise TypeError(incorrect_format_error_message)

    ignorek, header1_value = parsed_req_form.popitem()
    if not isinstance(header1_value, Dict) and not header2_dummy:
        # add header2 and retry
        header1_index = requestform_body.find(ignorek)
        header1_end_index = requestform_body.find(
            "\n", header1_index+len(ignorek))
        return parsed_body(requestform_body[:header1_end_index] + "\n## Dummy" + requestform_body[header1_end_index:], header2_dummy=True)

    if not isinstance(header1_value, Dict) or len(header1_value) != 1:
        raise TypeError(incorrect_format_error_message)

    ignorek, header2_value = header1_value.popitem()
    if not isinstance(header2_value, Dict):
        raise TypeError(incorrect_format_error_message)

    return header2_value


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

    request_form_dict = parsed_body(request_form_issue_details["body"])

    for k1, v1 in request_form_dict.items():
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

    if api_version and "api" not in deployment_scope:
        raise ValueError(
            "API version is provided but deployment scope is not API")
    if not api_version and "api" in deployment_scope:
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
        return ret_dict
    return None


if __name__ == "__main__":
    parser = ArgumentParser(
        description="validates Deployment Request form for Testplan environment")
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
        if not getattr(args, "validate"):
            raise ValueError("validate arg is not provided")

        parent_issue_details = get_valid_dict(
            getattr(args, "parent_issue_details"))
        if not parent_issue_details:
            raise ValueError("parent issue details are not provided")

        request_form_issue_details = get_valid_dict(
            getattr(args, "request_form_issue_details"))
        if not request_form_issue_details:
            raise ValueError("request form issue details are not provided")

        if not getattr(args, "testplan_type"):
            raise ValueError("testplan type is not provided")

        no_error = True
    except Exception as e:
        no_error = False
        print("error: ", e)
        parser.print_help()
        exit(1)

    # print("parent issue details", parent_issue_details)
    # print("request form issue details", request_form_issue_details)
    # print("test plan type", args.testplan_type)
    validate_request_form(parent_issue_details,
                          request_form_issue_details, getattr(args, "testplan_type"))
