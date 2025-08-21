from argparse import ArgumentParser
from enum import Enum
import re
import traceback
from typing import Dict, List
from datetime import timedelta
from ...md_parser import parsed_body, get_list_items
from ...md_parser.models import MdHeader, MdList, MdListItemTitleContent, MdListItemTodo
from ...utils import export_to_env, get_parsed_arg_value, get_valid_dict, get_preferred_datetime, get_now, parse_milestone_dueon


class DeploymentType(Enum):
    Release = "deployment-type-release"
    Rollback = "deployment-type-rollback"


def validate_env_details(env_details_contents: List):
    has_prod_env = False
    env_listitems = get_list_items(env_details_contents)
    for listitem in env_listitems:
        if isinstance(listitem, MdListItemTodo) and listitem.label is not None:
            if "Production Environment" in listitem.label:
                has_prod_env = listitem.is_checked

    if not has_prod_env:
        raise ValueError("Environment is incorrect")


def validate_release_details(release_detail_contents: List, request_form_issue_details: dict, deployment_type: DeploymentType):
    release_rollback_version = None
    existing_version = None
    has_release_notes = False

    version_listitems = get_list_items(release_detail_contents)
    for item in version_listitems:
        if isinstance(item, MdListItemTodo) and item.label is not None:
            if "use existing tag for release if available" in item.label:
                export_to_env({
                    "use_existing_tag": "true" if item.is_checked else "false"
                })
        if isinstance(item, MdListItemTitleContent) and item.content is not None and item.title is not None:
            version_match = re.match(r"\s*(v\d+\.\d+\.\d+).*", item.content)
            if version_match:
                if "Version to Deploy (Release/Rollback)" in item.title:
                    release_rollback_version = version_match.group(1)
                elif "Existing Deployed Version" in item.title:
                    existing_version = version_match.group(1)
    for rdc in release_detail_contents:
        if isinstance(rdc, MdHeader) and rdc.title is not None and "Release Notes" in rdc.title:
            has_release_notes = True

    if not has_release_notes:
        raise ValueError("Release Notes section is not provided")
    if not existing_version:
        raise ValueError("existing deployed version is not provided")

    version_dict = {}
    if deployment_type == DeploymentType.Release:
        if not release_rollback_version:
            raise ValueError("release version is not provided")
        if existing_version >= release_rollback_version:
            raise ValueError("existing deployed version is higher than requested release version")
        if release_rollback_version != request_form_issue_details["milestone"]["title"]:
            raise ValueError("release version must match with assigned milestone")
        version_dict["release_version"] = release_rollback_version
        version_dict["existing_version"] = existing_version
    else:
        if not release_rollback_version:
            raise ValueError("rollback version is not provided")
        if existing_version <= release_rollback_version:
            raise ValueError("existing deployed version is lower than requested rollback version")
        if release_rollback_version != request_form_issue_details["milestone"]["title"]:
            raise ValueError("rollback version must match with assigned milestone")
        version_dict["rollback_version"] = release_rollback_version
        version_dict["existing_version"] = existing_version

    export_to_env(version_dict)


def validate_rollback_plan(rollback_list: List):
    header_count = 0
    for header in rollback_list:
        if isinstance(header, MdHeader) and header.title is not None:
            if "Trigger Condition" in header.title or "Rollback Reason" in header.title:
                header_count += 1
    if header_count < 2:
        raise ValueError("Rollback plan is not in expected format")


def validate_pre_deployment_tasks(pre_deploy_task_list: List):
    verification_task_count = 0

    vrfy_task_list = get_list_items(pre_deploy_task_list)
    for vrfy_task in vrfy_task_list:
        if isinstance(vrfy_task, MdListItemTodo) and vrfy_task.is_checked:
            verification_task_count += 1

    if verification_task_count == 0:
        raise ValueError("Pre Deployment Tasks section is missing verification tasks. All tasks should be checked.")


def validate_post_deployment_tasks(post_deploy_task_list: List):
    smoke_test_title = "Smoke Test Verification"
    healthcheck_title = "Health Check Verification"
    task_count_map = {}
    task_count_map[smoke_test_title] = 0
    task_count_map[healthcheck_title] = 0

    for verification_header in post_deploy_task_list:
        if isinstance(verification_header, MdHeader) and verification_header.title is not None:
            if smoke_test_title in verification_header.title or healthcheck_title in verification_header.title:
                task_key = smoke_test_title if smoke_test_title in verification_header.title else healthcheck_title
                mdlist = get_list_items(verification_header.contents)
                for mditem in mdlist:
                    if isinstance(mditem, MdListItemTodo):
                        task_count_map[task_key] += 1

    section_names = []
    for section_name, task_count in task_count_map.items():
        if task_count == 0:
            section_names.append(section_name)

    if len(section_names) > 0:
        raise ValueError("Post Deployment Tasks missing verification tasks for sections " + ", ".join(section_names))


def validate_deployment_reason(deployment_reason_list: List, deployment_type: DeploymentType):
    has_trggr_cndn = False
    trigger_cond_content = "Trigger Conditions (for Rollback)"
    risk_level = None
    has_justification = False

    depl_rsn_items = get_list_items(deployment_reason_list)
    for listitem in depl_rsn_items:
        if isinstance(listitem, MdListItemTitleContent) and listitem.title is not None and trigger_cond_content in listitem.title:
            if listitem.content is not None:
                item_content = listitem.content.strip()
                if item_content != "NA" and len(item_content) > 0:
                    has_trggr_cndn = True

    for depl_rsn in deployment_reason_list:
        if isinstance(depl_rsn, MdHeader) and depl_rsn.title is not None and "Risk Assessment" in depl_rsn.title:
            mdlist = get_list_items(depl_rsn.contents)
            for mditem in mdlist:
                if isinstance(mditem, MdListItemTitleContent) and mditem.title is not None and mditem.content is not None:
                    if "Risk Level" in mditem.title:
                        risk_level = mditem.content.strip()
                    if "Justification for Risk level" in mditem.title:
                        item_content = mditem.content.strip()
                        if item_content != "NA" and len(item_content) > 0:
                            has_justification = True

    if not risk_level:
        raise ValueError("Risk level is not provided")
    elif risk_level.lower() not in ["low", "medium", "high"]:
        raise ValueError("Risk level is incorrect format")

    if not has_justification:
        raise ValueError("Risk level Justification is not provided")

    if has_trggr_cndn and deployment_type == DeploymentType.Release:
        raise ValueError(
            f"{trigger_cond_content} notes are not supported for release")
    if not has_trggr_cndn and deployment_type == DeploymentType.Rollback:
        raise ValueError(
            f"{trigger_cond_content} notes are not provided for rollback")


def validate_deployment_schedule(deployment_schedule_list: List, deployment_type: DeploymentType):
    preferred_date_obj = None
    mdlist = get_list_items(deployment_schedule_list)
    for listitem in mdlist:
        if isinstance(listitem, MdListItemTitleContent) and listitem.title is not None and "Preferred Date and Time" in listitem.title:
            preferred_date_obj = get_preferred_datetime(listitem.content)

    if not preferred_date_obj:
        raise ValueError("Preferred Date and Time format is not correct.")

    now = get_now()
    delta = timedelta(hours=1)
    if preferred_date_obj < (now-delta):
        raise ValueError("Preferred Date and Time is in past")
    if (preferred_date_obj-delta) > now:
        raise ValueError("Preferred Date and Time is in future")
    milestone_due_date_obj = parse_milestone_dueon(request_form_issue_details["milestone"]["due_on"])
    if not milestone_due_date_obj:
        raise ValueError("cannot convert milestone due date")

    if deployment_type == DeploymentType.Release:
        if preferred_date_obj > milestone_due_date_obj:
            raise ValueError(f"Preferred Date and Time [{preferred_date_obj}] is after milestone due date[{milestone_due_date_obj}]")
        if preferred_date_obj.strftime("%Y%m%d") != milestone_due_date_obj.strftime("%Y%m%d"):
            preferred_date_str = preferred_date_obj.strftime("%Y%m%d")
            milestone_dueon_str = milestone_due_date_obj.strftime("%Y%m%d")
            raise ValueError(f"Release date [{preferred_date_str}] is not same as milestone dueon date [{milestone_dueon_str}]")


def get_deployment_type(form_contents: List):
    for form_header in form_contents:
        if isinstance(form_header, MdHeader) and form_header.title is not None and "Deployment Type" in form_header.title:
            deploytype_list = get_list_items(form_header.contents)
            for item in deploytype_list:
                if isinstance(item, MdListItemTodo) and item.is_checked and item.label is not None:
                    if DeploymentType.Release.name in item.label:
                        return DeploymentType.Release
                    if DeploymentType.Rollback.name in item.label:
                        return DeploymentType.Rollback
            break
    return None


class ValidityHeader(Enum):
    DeploymentType = "Deployment Type"
    ReleaseRollbackDetails = "Release Deployment / Rollback Details"
    DeploymentReason = "Reason for Deployment / Rollback"
    EnvironmentDetails = "Environment Details"
    DeploymentSchedule = "Deployment Schedule"
    PreDeploymentValidations = "Pre Deployment Validations"
    PostDeploymentTasks = "Post Deployment Tasks"


def validate_request_form(request_form_issue_details: Dict):
    request_form_contents = parsed_body(request_form_issue_details["body"])
    if len(request_form_contents) <= 1:
        raise ValueError("Request form didnot follow the template properly")

    deployment_type = get_deployment_type(request_form_contents)
    if not deployment_type:
        raise ValueError("Deployment type is not checked")

    has_validity = {}
    has_validity[ValidityHeader.DeploymentType] = True
    has_validity[ValidityHeader.ReleaseRollbackDetails] = False
    has_validity[ValidityHeader.EnvironmentDetails] = False
    has_validity[ValidityHeader.DeploymentSchedule] = False
    has_validity[ValidityHeader.DeploymentReason] = False
    has_validity[ValidityHeader.PreDeploymentValidations] = False
    has_validity[ValidityHeader.PostDeploymentTasks] = False

    for form_header in request_form_contents:
        if isinstance(form_header, MdHeader) and form_header.title is not None:
            if ValidityHeader.ReleaseRollbackDetails.value in form_header.title:
                validate_release_details(form_header.contents, request_form_issue_details=request_form_issue_details, deployment_type=deployment_type)
                has_validity[ValidityHeader.ReleaseRollbackDetails] = True
            elif ValidityHeader.EnvironmentDetails.value in form_header.title:
                validate_env_details(form_header.contents)
                has_validity[ValidityHeader.EnvironmentDetails] = True
            elif ValidityHeader.DeploymentSchedule.value in form_header.title:
                validate_deployment_schedule(form_header.contents, deployment_type=deployment_type)
                has_validity[ValidityHeader.DeploymentSchedule] = True
            elif ValidityHeader.DeploymentReason.value in form_header.title:
                validate_deployment_reason(form_header.contents, deployment_type=deployment_type)
                has_validity[ValidityHeader.DeploymentReason] = True
            elif ValidityHeader.PostDeploymentTasks.value in form_header.title:
                validate_post_deployment_tasks(form_header.contents)
                export_to_env({"post_deployment_tasks_section": "\n".join(form_header.raw_contents)})
                has_validity[ValidityHeader.PostDeploymentTasks] = True
            elif ValidityHeader.PreDeploymentValidations.value in form_header.title:
                validate_pre_deployment_tasks(form_header.contents)
                has_validity[ValidityHeader.PreDeploymentValidations] = True

    missing_headers = []
    for header_title, is_valid in has_validity.items():
        if not is_valid:
            missing_headers.append(header_title)
    if len(missing_headers) > 0:
        raise ValueError("missing sections: " + ", ".join(missing_headers))


if __name__ == "__main__":
    parser = ArgumentParser(
        description="validates Deployment Request form for Prod environment")
    parser.add_argument("--validate", action="store_true",
                        help="[Required] Validation Request")
    parser.add_argument("--request-form-issue-details",
                        help="[Required] Provide request form issue details as json")

    args = parser.parse_args()

    try:
        get_parsed_arg_value(args, key="validate", arg_type_converter=bool)
        request_form_issue_details = get_parsed_arg_value(args, key="request_form_issue_details", arg_type_converter=get_valid_dict)

    except Exception as e:
        print("error: ", e)
        traceback.print_exc()
        parser.print_help()
        exit(1)

    validate_request_form(request_form_issue_details)
