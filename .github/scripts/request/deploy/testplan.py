from argparse import ArgumentParser
from enum import Enum
import re
from typing import Dict, List, Optional
from datetime import timedelta
from ...md_parser import parsed_body, get_list_items
from ...md_parser.models import MdHeader, MdListItemTitleContent
from ...utils import export_to_env, get_converted_enum, get_parsed_arg_value, get_valid_dict, get_preferred_datetime, get_now, parse_milestone_dueon


class RequestType(Enum):
    Provision = "provision"
    Deprovision = "deprovision"


def validate_test_plan_issue_link(section_contents: List, request_form_issue_details: Dict, parent_issue_details: Dict, testplan_type: str):
    if testplan_type.lower() not in request_form_issue_details["title"].lower():
        raise ValueError("Test Plan type is not included in request form title")

    testplan_issue_number = None
    section_list_items = get_list_items(section_contents)
    for listitem in section_list_items:
        if isinstance(listitem, MdListItemTitleContent):
            if testplan_type.lower() in listitem.title.lower() and "Test Plan" in listitem.title.lower():
                testplan_link_match = re.match(r".+https.+/issues/(\d+).*", listitem.content)
                if testplan_link_match:
                    testplan_issue_number = testplan_link_match.group(1)

    if not testplan_issue_number:
        raise ValueError("Test Plan issue link is not in correct format")
    if testplan_issue_number != parent_issue_details["number"]:
        raise ValueError("Request form does not contain Test plan issue link")


def validate_deployment_schedule(section_contents: List, request_form_issue_details: Dict, request_type: RequestType):
    preferred_date_obj = None
    deploy_scope = None
    mdlist = get_list_items(section_contents)
    for listitem in mdlist:
        if isinstance(listitem.parsed_content, MdListItemTitleContent):
            if "Preferred Date and Time" in listitem.parsed_content.title:
                preferred_date_obj = get_preferred_datetime(listitem.parsed_content.content)
            if "Deployment Scope" in listitem.parsed_content.title:
                deploy_scope = listitem.parsed_content.content

    if not preferred_date_obj:
        raise ValueError("Preferred Date and Time format is not correct.")

    now = get_now()
    delta = timedelta(hours=1)
    if preferred_date_obj < (now-delta):
        raise ValueError("Preferred Date and Time is in past")
    if (preferred_date_obj-delta) > now:
        raise ValueError("Preferred Date and Time is in future")

    if request_type == RequestType.Provision:
        milestone_due_date_obj = parse_milestone_dueon(request_form_issue_details["milestone"]["due_on"])
        if not milestone_due_date_obj:
            raise ValueError("cannot convert milestone due date")
        if preferred_date_obj > milestone_due_date_obj:
            raise ValueError("Preferred Date and Time is after milestone due date")

    if deploy_scope not in ["UI only", "UI and API"]:
        raise ValueError("Deployment Sope is not in correct format")

    if "API" not in deploy_scope and request_type == RequestType.Deprovision:
        raise ValueError("for deprovisioning, scope must have both UI and API.")

    return deploy_scope


def validate_env_details(env_details_contents: List):
    has_testplan_env = False
    mdlist = get_list_items(env_details_contents)
    for listitem in mdlist:
        if isinstance(listitem.parsed_content, MdListItemTitleContent):
            if "Environment Name" in listitem.parsed_content.title and "Test Plan Environment" in listitem.parsed_content.content:
                has_testplan_env = True

    if not has_testplan_env:
        raise ValueError("Environment details is incorrect")


def validate_release_details(section_contents: List, request_form_issue_details: Dict, parent_issue_details: Dict) -> Dict[str, Optional[str]]:
    api_version: Optional[str] = None
    ui_version: Optional[str] = None
    rdc_list = get_list_items(section_contents)
    for listitem in rdc_list:
        if isinstance(listitem.parsed_content, MdListItemTitleContent):
            version_match = re.match(r"\s*(v\d+\.\d+\.\d+).*", listitem.parsed_content.content)
            if version_match:
                if "UI Version" in listitem.parsed_content.title:
                    ui_version = version_match.group(1)
                elif "API Version" in listitem.parsed_content.title:
                    api_version = version_match.group(1)

    if not ui_version:
        raise ValueError("UI Version is not in correct format")
    if ui_version != request_form_issue_details["milestone"]["title"]:
        raise ValueError("UI version must match with assigned milestone in request form")
    if ui_version != parent_issue_details["milestone"]["title"]:
        raise ValueError("UI version must match with assigned milestone in testplan issue")

    return {
        "api_version": api_version,
        "ui_version": ui_version
    }


class ValidityHeader(Enum):
    TestplanDetails = "Test Plan"
    ReleaseDetails = "Release Details"
    EnvironmentDetails = "Environment Details"
    DeploymentSchedule = "Deployment Schedule"


def validate_request_form(request_form_issue_details: Dict, parent_issue_details: Dict, testplan_type: str, request_type: RequestType):
    request_form_contents = parsed_body(request_form_issue_details["body"])
    if len(request_form_contents) <= 1:
        raise ValueError("Request form didnot follow the template properly")

    has_validity = {}
    has_validity[ValidityHeader.TestplanDetails] = False
    has_validity[ValidityHeader.ReleaseDetails] = False
    has_validity[ValidityHeader.EnvironmentDetails] = False
    has_validity[ValidityHeader.DeploymentSchedule] = False

    deploy_scope = ""
    version_details = {}
    for form_header in request_form_contents:
        if isinstance(form_header, MdHeader):
            if ValidityHeader.ReleaseDetails.value in form_header.title:
                version_details = validate_release_details(
                    section_contents=form_header.contents,
                    request_form_issue_details=request_form_issue_details,
                    parent_issue_details=parent_issue_details)
                has_validity[ValidityHeader.ReleaseDetails] = True
            elif ValidityHeader.EnvironmentDetails.value in form_header.title:
                validate_env_details(form_header.contents)
                has_validity[ValidityHeader.EnvironmentDetails] = True
            elif ValidityHeader.DeploymentSchedule.value in form_header.title:
                deploy_scope = validate_deployment_schedule(section_contents=form_header.contents,
                                                            request_form_issue_details=request_form_issue_details,
                                                            request_type=request_type)
                has_validity[ValidityHeader.DeploymentSchedule] = True
            elif ValidityHeader.TestplanDetails.value in form_header.title:
                validate_test_plan_issue_link(section_contents=form_header.contents,
                                              request_form_issue_details=request_form_issue_details,
                                              parent_issue_details=parent_issue_details,
                                              testplan_type=testplan_type)
                has_validity[ValidityHeader.TestplanDetails] = True

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
    parser.add_argument("--request-type", choices=["provision", "deprovision"],
                        help="[Required] Provide Request Type")
    args = parser.parse_args()

    try:
        get_parsed_arg_value(args, key="validate", arg_type_converter=bool)
        parent_issue_details = get_parsed_arg_value(args, key="parent_issue_details", arg_type_converter=get_valid_dict)
        request_form_issue_details = get_parsed_arg_value(args, key="request_form_issue_details", arg_type_converter=get_valid_dict)
        testplan_type = get_parsed_arg_value(args, key="testplan_type", arg_type_converter=str)
        request_type = get_parsed_arg_value(args, key="request_type", arg_type_converter=lambda x: get_converted_enum(RequestType, str(x)))

    except Exception as e:
        print("error: ", e)
        parser.print_help()
        exit(1)

    validate_request_form(request_form_issue_details=request_form_issue_details,
                          parent_issue_details=parent_issue_details,
                          testplan_type=testplan_type,
                          request_type=RequestType(request_type))
