from argparse import ArgumentParser
from enum import Enum
import re
from typing import Dict, List, Optional
from datetime import timedelta
from ...md_parser import parsed_body, get_list_items
from ...md_parser.models import MdHeader, MdListItemTitleContent, MdListItemTodo
from ...utils import export_to_env, get_converted_enum, get_parsed_arg_value, get_valid_dict, get_preferred_datetime, get_now, convert_to_human_readable


class RequestType(Enum):
    Provision = "provision"
    Deprovision = "deprovision"


def validate_deployment_schedule(deployment_schedule_list: List, request_type: RequestType):
    preferred_date_obj = None
    deploy_scope = None
    delete_schedule_date_obj = None
    mdlist = get_list_items(deployment_schedule_list)
    for listitem in mdlist:
        if isinstance(listitem, MdListItemTitleContent) and listitem.title is not None:
            if "Preferred Date and Time" in listitem.title:
                preferred_date_obj = get_preferred_datetime(listitem.content)
            if "Deployment Scope" in listitem.title and listitem.content is not None:
                deploy_scope = listitem.content.strip()
            if "Schedule to delete after" in listitem.title and listitem.content is not None:
                if "Preserve previous schedule" in listitem.content:
                    export_to_env({"delete_schedule": "PreservePreviousSchedule"})
                else:
                    delete_schedule_date_obj = get_preferred_datetime(listitem.content)

    if not preferred_date_obj:
        raise ValueError("Preferred Date and Time format is not correct.")

    now = get_now()
    delta = timedelta(hours=1)
    if preferred_date_obj < (now-delta):
        raise ValueError("Preferred Date and Time is in past")
    if (preferred_date_obj-delta) > now:
        raise ValueError("Preferred Date and Time is in future")

    if deploy_scope not in ["UI only", "UI and API"]:
        raise ValueError("Deployment Sope is not in correct format")

    if "API" not in deploy_scope and request_type == RequestType.Deprovision:
        raise ValueError("for deprovisioning, scope must have both UI and API.")

    if delete_schedule_date_obj is not None:
        time_diff = abs(delete_schedule_date_obj-preferred_date_obj)
        if time_diff < timedelta(minutes=15):
            raise ValueError(f"Invalid schedule deletion request. The difference [{convert_to_human_readable(time_diff)}] is less than 15 minutes")
        if time_diff > timedelta(days=30):
            raise ValueError(f"Invalid schedule deletion request. The difference [{convert_to_human_readable(time_diff)}] is greater than 1 month")
        formatted_datetime = preferred_date_obj.strftime("%Y-%m-%d %H:%M:%S %Z")
        export_to_env({"delete_schedule": formatted_datetime})

    return deploy_scope


def validate_env_details(env_details_contents: List):
    has_development_env = False
    mdlist = get_list_items(env_details_contents)
    for listitem in mdlist:
        if isinstance(listitem, MdListItemTodo) and listitem.label is not None:
            if "Development Environment" in listitem.label:
                has_development_env = listitem.is_checked

    if not has_development_env:
        raise ValueError("Environment is incorrect")


def validate_release_details(release_detail_contents: List, request_form_issue_details: Dict) -> Dict[str, Optional[str]]:
    api_version: Optional[str] = None
    ui_version: Optional[str] = None
    rdc_list = get_list_items(release_detail_contents)
    for listitem in rdc_list:
        if isinstance(listitem, MdListItemTitleContent) and listitem.content is not None and listitem.title is not None:
            version_match = re.match(r"\s*(v\d+\.\d+\.\d+).*", listitem.content)
            if version_match:
                if "UI Version" in listitem.title:
                    ui_version = version_match.group(1)
                elif "API Version" in listitem.title:
                    api_version = version_match.group(1)

    if not ui_version:
        raise ValueError("UI Version is not in correct format")
    if ui_version != request_form_issue_details["milestone"]["title"]:
        raise ValueError("UI version must match with assigned milestone in request form")

    return {
        "api_version": api_version,
        "ui_version": ui_version
    }


class ValidityHeader(Enum):
    ReleaseDetails = "Release Deployment"
    EnvironmentDetails = "Environment Details"
    DeploymentSchedule = "Deployment Schedule"


def validate_request_form(request_form_issue_details: Dict, request_type: RequestType):
    request_form_contents = parsed_body(request_form_issue_details["body"])
    if len(request_form_contents) <= 1:
        raise ValueError("Request form didnot follow the template properly")

    has_validity = {}
    has_validity[ValidityHeader.ReleaseDetails] = False
    has_validity[ValidityHeader.EnvironmentDetails] = False
    has_validity[ValidityHeader.DeploymentSchedule] = False

    deploy_scope = ""
    version_details = {}
    for form_header in request_form_contents:
        if isinstance(form_header, MdHeader) and form_header.title is not None:
            if ValidityHeader.ReleaseDetails.value in form_header.title:
                version_details = validate_release_details(form_header.contents, request_form_issue_details=request_form_issue_details)
                has_validity[ValidityHeader.ReleaseDetails] = True
            elif ValidityHeader.EnvironmentDetails.value in form_header.title:
                validate_env_details(form_header.contents)
                has_validity[ValidityHeader.EnvironmentDetails] = True
            elif ValidityHeader.DeploymentSchedule.value in form_header.title:
                deploy_scope = validate_deployment_schedule(form_header.contents, request_type=request_type)
                has_validity[ValidityHeader.DeploymentSchedule] = True

    # verify version details
    if "API" in deploy_scope and not version_details["api_version"]:
        raise ValueError("API version is not provided for api scope")

    missing_headers = []
    for header_title, is_valid in has_validity.items():
        if not is_valid:
            missing_headers.append(header_title)
    if len(missing_headers) > 0:
        raise ValueError("missing sections: " + ", ".join(missing_headers))

    env_dict = {"deployment_scope": deploy_scope}
    if version_details["api_version"]:
        env_dict["api_version"] = version_details["api_version"]
    export_to_env(env_dict)


if __name__ == "__main__":
    """
    python -m scripts.request.deploy.development --validate --request-form-issue-details ..\dist\request_form_issue_details\dev_ui.json --request-type provision
    python -m scripts.request.deploy.development --validate --request-form-issue-details ..\dist\request_form_issue_details\dev_ui.json --request-type deprovision

    python -m scripts.request.deploy.development --validate --request-form-issue-details ..\dist\request_form_issue_details\dev_ui_api.json --request-type provision
    python -m scripts.request.deploy.development --validate --request-form-issue-details ..\dist\request_form_issue_details\dev_ui_api.json --request-type deprovision
    """
    parser = ArgumentParser(
        description="validates Deployment Request form for Development environment")
    parser.add_argument("--validate", action="store_true",
                        help="[Required] Validation Request")
    parser.add_argument("--request-form-issue-details",
                        help="[Required] Provide request form issue details as json")
    parser.add_argument("--request-type", choices=["provision", "deprovision"],
                        help="[Required] Provide Request Type")
    args = parser.parse_args()

    try:
        get_parsed_arg_value(args, key="validate", arg_type_converter=bool)
        request_form_issue_details = get_parsed_arg_value(args, key="request_form_issue_details", arg_type_converter=get_valid_dict)
        request_type = get_parsed_arg_value(args, key="request_type", arg_type_converter=lambda x: get_converted_enum(RequestType, str(x)))

    except Exception as e:
        print("error: ", e)
        parser.print_help()
        exit(1)

    validate_request_form(request_form_issue_details=request_form_issue_details,
                          request_type=RequestType(request_type))
