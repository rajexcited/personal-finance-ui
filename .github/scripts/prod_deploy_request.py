from argparse import ArgumentParser
from enum import Enum
import json
import os
from pathlib import Path
import re
import traceback
from typing import Any, Dict, List
from datetime import datetime, timedelta
import pytz
from pydantic import BaseModel


class MdHeader(BaseModel):
    level: int=0
    title:str=None
    contents:List=[]


def get_heading_match(content:str):
    return re.match(r"^(#+) (.+)", content)


def is_heading(content:str):
    return get_heading_match(content) is not None


def title_strip(in_title:str):
    """
        strips whitespace along with last colon(:) character from title 
    """
    title=in_title.strip(":")
    last_index = title.rfind(":")  # Find the last occurrence 
    if last_index != -1:
        title = title[:last_index] + title[last_index + 1:]
    return title


def get_heading(content:str):
    heading_match=get_heading_match(content)
    if heading_match:
        return MdHeader(
            level=len(heading_match.group(1)),
            title=title_strip(heading_match.group(2))
        )
    return None


class ListItemType(Enum):
    Todo="list-item-todo"
    SimpleText="list-item-simple-text"
    TitleContent="list-item-title-content"

class MdListItemTodo(BaseModel):
    is_checked:bool=False
    label:str=None

class MdListItemSimpleText(BaseModel):
    text:str=None

class MdListItemTitleContent(BaseModel):
    title:str=None
    content:str=None

class MdListItem(BaseModel):
    item_type:ListItemType=None
    raw_content:str=None
    parsed_content:MdListItemTodo|MdListItemSimpleText|MdListItemTitleContent=None

class MdList(BaseModel):
    items: List[MdListItem]=[]


def get_simpletext_list_item(content:str):
    matched = re.match(r"^[-*+] (.+)", content)
    if not matched:
        return None
    return MdListItemSimpleText(
        text=matched.group(1)
    )

def get_todo_list_item(content:str):
    matched = re.match(r"^-\s+\[(x| )\]\s+(.+)", content)
    if not matched:
        return None
    return MdListItemTodo(
        is_checked=matched.group(1).strip() == "x",
        label = matched.group(2)
    )

def get_title_list_item(content:str):
    matched = re.match(r"- \*\*(.+?):\*\*\s+(.+)", content)
    if not matched:
        return None
    return MdListItemTitleContent(
        title=matched.group(1),
        content=matched.group(2)
    )

def get_list_item(content:str):
    """
        parse into Md List Item instance
    """
    if not is_list_item(content):
        return None
    list_item=MdListItem(raw_content=content)
    todo_item=get_todo_list_item(content)
    if todo_item:
        list_item.item_type=ListItemType.Todo
        list_item.parsed_content=todo_item
        return list_item
    title_item=get_title_list_item(content)
    if title_item:
        list_item.item_type=ListItemType.TitleContent
        list_item.parsed_content=title_item
        return list_item
    text_item=get_simpletext_list_item(content)
    list_item.item_type=ListItemType.SimpleText
    list_item.parsed_content=text_item
    return list_item


def is_list_item(content:str):
    return re.match(r"^[-*+] (.+)", content) is not None


class AlertType(Enum):
    Important="alert-important"
    Tip="alert-tip"
    Note="alert-note"

class MdAlert(BaseModel):
    alert_type:AlertType=None
    content_lines:List[str]=[]

def get_alert_ind(content:str):
    alert_identifier_list = ["> [!IMPORTANT]", "> [!TIP]", "> [!NOTE]"]
    try:
        return alert_identifier_list.index(content.strip())
    except:
        return -1

def is_alert_type(content:str):
    return get_alert_ind(content) != -1

def get_alert(content:str):
    alert_type_list = [AlertType.Important, AlertType.Tip,AlertType.Note]
    match_ind = get_alert_ind(content)
    if match_ind != -1:
        return MdAlert(alert_type=alert_type_list[match_ind])
    return None


class MdType(Enum):
    Header="md-header"
    ListItem="md-list-item"
    Alert="md-alert"

def get_md_type(content:str):
    """
       Supports 
        - Md Header
        - Md bullet List starts with Dash(-)
        - Md Alert
    """
    if is_heading(content):
        return MdType.Header
    if is_list_item(content):
        return MdType.ListItem
    if is_alert_type(content):
        return MdType.Alert
    return None


def is_empty(s:str):
    return s is None or len(s.strip()) == 0

def parse_line_base_instance(content:str):
    if is_empty(content):
        return content
    content_type = get_md_type(content)
    match content_type:
        case MdType.Header:
            return get_heading(content)
        case MdType.ListItem:
            return get_list_item(content)
        case MdType.Alert:
            return get_alert(content)
        case _:
            return content

def build_list(line_list: List[str], parent_list:MdList):
    for line_num, line in enumerate(line_list):
        # print("list item line? ", line, "line num", line_num, "empty?",is_empty(line))
        if is_empty(line):
            continue
        list_item=get_list_item(line)
        # print("list item", list_item, "parent list", parent_list)
        if not list_item:
            return line_num
        parent_list.items.append(list_item)
    return len(line_list)

def build_alert(line_list: List[str], parent_alert:MdAlert):
    for line_num, line in enumerate(line_list):
        if line.startswith("> "):
            parent_alert.content_lines.append(line[2:].strip())
        return line_num
    return len(line_list)

def get_last_iten_from_list(mylist:List):
    if len(mylist)>0:
        return mylist[-1]
    return None

def update_header(line_list: List[str], parent_header:MdHeader, line_num:int):
    line=line_list[line_num]
    skip_lines=0
    content_list=parent_header.contents

    base_instance=parse_line_base_instance(line)
    if isinstance(base_instance, str):
        last_content=get_last_iten_from_list(content_list)
        if isinstance(last_content, str):
            content_list[-1] = last_content + os.linesep + base_instance
        elif not is_empty(base_instance):
            content_list.append(base_instance)
    elif isinstance(base_instance, MdHeader):
        if base_instance.level <= parent_header.level:
            skip_lines=line_num
        else:
            content_list.append(base_instance)
            skip_lines = build_header(line_list=line_list[line_num + 1:], parent_header=base_instance)
    elif isinstance(base_instance, MdListItem):
        list_content=MdList(items=[base_instance])
        content_list.append(list_content)
        skip_lines = build_list(line_list=line_list[line_num + 1:], parent_list=list_content)
    elif isinstance(base_instance, MdAlert):
        skip_lines = build_alert(line_list=line_list[line_num + 1:], parent_alert=base_instance)
        
    return skip_lines


def build_header(line_list: List[str], parent_header:MdHeader):
    parent_header.contents = content_list = []
    skip_lines=0
    for line_num, line in enumerate(line_list):
        if skip_lines > 0:
            skip_lines -= 1
            continue
        
        base_instance=parse_line_base_instance(line)
        if isinstance(base_instance, str):
            last_content=get_last_iten_from_list(content_list)
            if isinstance(last_content, str):
                content_list[-1] = last_content + os.linesep + base_instance
            elif not is_empty(base_instance):
                content_list.append(base_instance)
        elif isinstance(base_instance, MdHeader):
            if base_instance.level <= parent_header.level:
                return line_num
            content_list.append(base_instance)
            skip_lines = build_header(line_list=line_list[line_num + 1:], parent_header=base_instance)
        elif isinstance(base_instance, MdListItem):
            list_content=MdList(items=[base_instance])
            content_list.append(list_content)
            skip_lines = build_list(line_list=line_list[line_num + 1:], parent_list=list_content)
        elif isinstance(base_instance, MdAlert):
            skip_lines = build_alert(line_list=line_list[line_num + 1:], parent_alert=base_instance)

        # skip_lines = update_header(line_list, parent_header=parent_header, line_num=line_num)
        
    return len(line_list)


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


class DeploymentType(Enum):
    Release="deployment-type-release"
    Rollback="deployment-type-rollback"


def validate_env_details(env_details_contents: List):
    has_prod_env=False
    for mdlist in env_details_contents:
        if isinstance(mdlist, MdList):
            for listitem in mdlist.items:
                if isinstance(listitem.parsed_content, MdListItemTitleContent):
                    if "Environment Name" in listitem.parsed_content.title and "Production Environment" in listitem.parsed_content.content:
                        has_prod_env=True
    
    if not has_prod_env:
        raise ValueError("Environment details is incorrect")


def validate_release_details(release_detail_contents: List, request_form_issue_details: dict, deployment_type: DeploymentType):
    release_version=None
    rollback_version=None
    existing_version=None
    
    for mdlist in release_detail_contents:
        if isinstance(mdlist, MdList):
            for listitem in mdlist.items:
                if isinstance(listitem.parsed_content, MdListItemTitleContent):
                    version_match=re.match(r"\s*(v\d+\.\d+\.\d+).*",listitem.parsed_content.content)
                    if version_match:
                        if "Release Version to Deploy" in listitem.parsed_content.title:
                            release_version=version_match.group(1)
                        elif "Rollback Version to Deploy" in listitem.parsed_content.title:
                            rollback_version=version_match.group(1)
                        elif "Existing Version Deployed" in listitem.parsed_content.title:
                            existing_version=version_match.group(1)
    
    version_dict={}
    if release_version and rollback_version:
        raise ValueError("cannot provide both release and rollback version")
    if not release_version and not rollback_version:
        raise ValueError("neither release nor rollback version is provided")
    if not existing_version:
        raise ValueError("existing deployed version is not provided")

    if deployment_type == DeploymentType.Release:
        if not release_version:
            raise ValueError("release version is not provided")
        if existing_version >= release_version:
            raise ValueError("existing deployed version is higher than requested release version")
        if release_version != request_form_issue_details["milestone"]["title"]:
            raise ValueError("release version must match with assigned milestone")
        version_dict["release_version"]=release_version
        version_dict["existing_version"]=existing_version
    else:
        if not rollback_version:
            raise ValueError("rollback version is not provided")
        if existing_version <= rollback_version:
            raise ValueError("existing deployed version is lower than requested rollback version")
        if rollback_version != request_form_issue_details["milestone"]["title"]:
            raise ValueError("rollback version must match with assigned milestone")
        version_dict["rollback_version"]=rollback_version
        version_dict["existing_version"]=existing_version
        
    export_to_env(version_dict)


def validate_rollback_plan(rollback_list: List):
    header_count=0
    for header in rollback_list:
        if isinstance(header, MdHeader):
            if "Trigger Condition" in header.title or "Rollback Reason" in header.title:
                header_count += 1
    if header_count < 2:
        raise ValueError("Rollback plan is not in expected format")


def validate_post_deployment_tasks(post_deploy_task_list: List):
    verification_header_count=0
    for verification_header in post_deploy_task_list:
        if isinstance(verification_header, MdHeader):
            if "Smoke and PPV Test Verification" in verification_header.title or "Health Check Verification" in verification_header.title:
                # print("verification header section", verification_header)
                for mdlist in verification_header.contents:
                    if isinstance(mdlist, MdList):
                        todo_count=0
                        # print("todo verifications", mdlist)
                        for mditem in mdlist.items:
                            if isinstance(mditem.parsed_content, MdListItemTodo):
                                todo_count +=1
                        # print("todo count", todo_count)
                        if todo_count > 1:
                            verification_header_count +=1

    if verification_header_count < 2:
        raise ValueError("Post Deployment Tasks missing Verification steps")


def validate_deployment_reason(deployment_reason_list: List):
    has_risk_level=False
    for risk_header in deployment_reason_list:
        if isinstance(risk_header, MdHeader) and "Risk Level" in risk_header.title:
            for mdlist in risk_header.contents:
                if isinstance(mdlist, MdList):
                    if len(mdlist.items)==1:
                        risk_level_item=mdlist.items[0].parsed_content
                        if isinstance(risk_level_item, MdListItemSimpleText):
                            has_risk_level=risk_level_item.text.strip() in ["Low", "Medium", "High" ]
    if not has_risk_level:
        raise ValueError("Risk level is not correct format")


def validate_deployment_schedule(deployment_schedule_list: List):
    preferred_time_match = None
    for mdlist in deployment_schedule_list:
        if isinstance(mdlist, MdList):
            for listitem in mdlist.items:
                if isinstance(listitem.parsed_content, MdListItemTitleContent):
                    if "Preferred Date and Time" in listitem.parsed_content.title:
                        preferred_time_match = re.match(r"\s*(\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}).+", listitem.parsed_content.content)

    if not preferred_time_match:
        raise ValueError("Preferred DateTime format is not correct.")

    central = pytz.timezone('US/Central')
    preferred_date_time = datetime.strptime(preferred_time_match.group(1), "%m-%d-%Y %H:%M:%S")
    preferred_date_localized = central.localize(preferred_date_time)
    preferred_date_obj = preferred_date_localized.astimezone()
    now = datetime.now(pytz.utc).astimezone(central)
    delta = timedelta(hours=1)
    if preferred_date_obj < (now-delta):
        # print("preferred_date_obj: ", preferred_date_obj)
        # print("now - delta: ", (now-delta))
        raise ValueError("Preferred DateTime is in past")
    if (preferred_date_obj-delta) > now:
        # print("preferred_date_obj - delta: ",(preferred_date_obj-delta))
        # print("now: ", now)
        raise ValueError("Preferred DateTime is in future")
    milestone_due_date_obj = datetime.strptime(request_form_issue_details["milestone"]["due_on"], "%Y-%m-%dT%H:%M:%SZ")
    end_day_milestone_due_date_obj = milestone_due_date_obj.astimezone(central) \
            .replace(hour=23, minute=59, second=59)
    if preferred_date_obj > end_day_milestone_due_date_obj:
        raise ValueError("Preferred DateTime is after milestone due date")

def enum_serializer(obj):
    if isinstance(obj, Enum):
        return obj.value  # Serialize using `value`
    raise TypeError(f"Type {type(obj)} not serializable")


def parsed_body(requestform_body: str) -> List:
    """
        parse the request form contents to MdHeader instance
    """
    parsed_form_header=MdHeader()
    build_header(requestform_body.splitlines(), parent_header=parsed_form_header)

    # export parsed form json to debug
    # with open("dist/parsed_request_form.json", "w") as rf:
    #     rf.write(json.dumps([item.model_dump() if isinstance(item, BaseModel) else item for item in parsed_form_header.contents], default=enum_serializer))

    def get_l3_list(header:MdHeader):
        content_list=[]
        for cl in header.contents:
            found_level_3=False
            if isinstance(cl,MdHeader):
                if cl.level<3:
                    content_list.extend(get_l3_list(cl))
                if cl.level==3:
                    found_level_3=True
                    break
        if found_level_3:
            content_list.extend(header.contents)
        return content_list

    return get_l3_list(parsed_form_header)

def get_deployment_type(contents:List):
    for item in contents:
        if isinstance(item, MdHeader) and "Deployment Type" in item.title:
            for todo_list in item.contents:
                if isinstance(todo_list, MdList):
                    for item in todo_list.items:
                        if isinstance(item.parsed_content, MdListItemTodo) and item.parsed_content.is_checked:
                            if DeploymentType.Release.name in item.parsed_content.label:
                                return DeploymentType.Release
                            if DeploymentType.Rollback.name in item.parsed_content.label:
                                return DeploymentType.Rollback
            break
    return None


def validate_request_form(request_form_issue_details: Dict):
    request_form_contents = parsed_body(request_form_issue_details["body"])
    if len(request_form_contents)<=1:
        raise ValueError("Request form didnot follow the template properly")
    
    deployment_type = get_deployment_type(request_form_contents)
    if not deployment_type:
        raise ValueError("Deployment type is not checked")
    
    has_validity={
        "Release Details":False,
        "Environment Details":False,
        "Deployment Schedule":False,
        "Deployment Reason":False,
        "Post Deployment Tasks":False
    }
    if deployment_type == DeploymentType.Rollback:
        has_validity["Rollback Plan"]=False

    for form_header in request_form_contents:
        if isinstance(form_header, MdHeader):
            if "Release Details" in form_header.title:
                validate_release_details(form_header.contents, request_form_issue_details, deployment_type)
                has_validity["Release Details"]=True
            elif "Environment Details" in form_header.title:
                validate_env_details(form_header.contents)
                has_validity["Environment Details"]=True
            elif "Deployment Schedule" in form_header.title:
                validate_deployment_schedule(form_header.contents)
                has_validity["Deployment Schedule"]=True
            elif "Deployment Reason" in form_header.title:
                validate_deployment_reason(form_header.contents)
                has_validity["Deployment Reason"]=True
            elif "Post Deployment Tasks" in form_header.title:
                validate_post_deployment_tasks(form_header.contents)
                has_validity["Post Deployment Tasks"]=True
            elif "Rollback Plan" in form_header.title:
                validate_rollback_plan(form_header.contents)
                has_validity["Rollback Plan"]=True
    
    missing_headers=[]
    for header_title,is_valid in has_validity.items():
        if not is_valid:
            missing_headers.append(header_title)
    if len(missing_headers)>0:
        raise ValueError("missing sections: " + ", ".join(missing_headers))


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
        description="validates Deployment Request form for Prod environment")
    parser.add_argument("--validate", action="store_true",
                        help="[Required] Validation Request")
    parser.add_argument("--request-form-issue-details",
                        help="[Required] Provide request form issue details as json")
    
    args = parser.parse_args()

    try:
        if not getattr(args, "validate"):
            raise ValueError("validate arg is not provided")

        request_form_issue_details = get_valid_dict(
            getattr(args, "request_form_issue_details"))
        if not request_form_issue_details:
            raise ValueError("request form issue details are not provided")
        
    except Exception as e:
        print("error: ", e)
        traceback.print_exc()
        parser.print_help()
        exit(1)

    # print("request form issue details", request_form_issue_details)
    validate_request_form(request_form_issue_details)
