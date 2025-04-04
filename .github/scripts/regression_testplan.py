from argparse import ArgumentParser
from datetime import datetime
import json
import os
from pathlib import Path
import re
from collections import defaultdict, Counter
from typing import Any, List, Dict
from parse_test_cases import parse_metadata, convert_all_tc
from summary_tc import get_all_testcases_summary


def get_variable_name(content):
    return re.findall(r"\$[a-zA-Z0-9_\.]+", content)


def is_list(content):
    return re.match(r"^[-*+] (.+)", content)


def traverse_dict(key_depths: List[str], wrapper: Dict[str, Dict] | List[str] | str):
    if len(key_depths) == 0:
        return wrapper

    kdl = key_depths[0].lower().replace(" ", "_")
    if isinstance(wrapper, dict):
        for k, v in wrapper.items():
            kl = k.lower().replace(" ", "_")
            if kl == kdl:
                return traverse_dict(key_depths[1:], v)

    return []


def flatten_values(value: Any):
    result = []
    if isinstance(value, list):
        for v in value:
            result.extend(flatten_values(v))
    elif isinstance(value, dict):
        for k, v in value.items():
            result.extend(flatten_values(k))
            result.extend(flatten_values(v))
    elif isinstance(value, str):
        result.append(value)
    elif value is not None:
        result.append(str(value))
    return result


def get_value(milestone: Dict, converted_tc: Dict, regression_testcases: List[str], variable: str, tc_id: str = None):
    testcases = regression_testcases if tc_id is None else [tc_id]
    ia_list = set()
    for tc in testcases:
        if variable.startswith("$milestone"):
            key = variable.split(".")[1]
            value = milestone[key] if key in milestone else None
        elif variable == "$today":
            value = datetime.now().strftime("%m-%d-%Y")
        else:
            key_depths = variable[1:].split(".")
            # print("key_depths=", key_depths, "tc=", tc,
            #       "has value in converted_tc? ", tc in converted_tc)
            value = traverse_dict(key_depths, converted_tc[tc])
        ia_list.update(flatten_values(value))

    if len(ia_list) == 0:
        return [variable]
    return sorted(ia_list)


def get_value_hard_coded(milestone: Dict, converted_tc: Dict, regression_testcases: List[str], variable: str, tc_id: str = None):
    testcases = regression_testcases if tc_id is None else [tc_id]
    ia_list = set()
    for tc in testcases:
        if variable == "$details.impact_area":
            for k, v in converted_tc[tc]["details"]["Impact Area"].items():
                ia_list.add(k)
                for lv in v:
                    ia_list.add(lv)
        elif variable.startswith("$milestone"):
            key = variable.split(".")[1]
            ia_list.add(milestone[key])
        elif variable == "$details.tags.feature":
            ia_list.update([v for v in converted_tc[tc]
                           ["details"]["Tags"]["feature"]])
        elif variable == "$details.tags.impact":
            ia_list.update([fv for fv in converted_tc[tc]
                           ["details"]["Tags"]["impact"]])
        elif variable == "$details.title":
            ia_list.add(converted_tc[tc]["details"]["Title"])
        elif variable == "$metadata.id":
            ia_list.add(converted_tc[tc]["metadata"]["id"])
        elif variable == "$metadata.relative_file_path":
            ia_list.add(converted_tc[tc]["metadata"]
                        ["relative_file_path"].replace("\\", "/"))
    if len(ia_list) == 0:
        return [variable]
    return sorted(ia_list)


def replace_variables(milestone: Dict, converted_tc: Dict, regression_testcases: List, content_line: str, variables: List[str], tc_id: str = None):
    content = ""
    if is_list(content_line) and len(variables) == 1:
        var = variables[0]
        ll = get_value(milestone, converted_tc,
                       regression_testcases, var, tc_id)
        gmap = group_list_into_map(ll)
        clist = []
        for gv in gmap.values():
            clist.append(content_line.replace(var, ", ".join(gv)))
        content = "\n".join(clist)
    else:
        content = content_line
        for var in variables:
            ll = get_value(milestone, converted_tc,
                           regression_testcases, var, tc_id)
            content = content.replace(var, ", ".join(ll))
    return content


def group_list_into_map(items: List[str]) -> Dict[str, List[str]]:
    keyword_count = Counter()
    keyword_map = defaultdict(set)

    exclude_keywords = ["api", "form", "add", "page"]
    # Count occurrences of each keyword
    for item in items:
        keywords = item.split()
        for keyword in keywords:
            if keyword in exclude_keywords:
                continue
            keyword_count[keyword] += 1
            keyword_map[keyword].add(item)

    # Sort keywords by their occurrences in descending order
    sorted_keywords = sorted(keyword_count.keys(),
                             key=lambda k: -keyword_count[k])

    # Create the final map with unique values
    final_map = {}
    seen_items = set()

    for keyword in sorted_keywords:
        unique_items = [item for item in keyword_map[keyword]
                        if item not in seen_items]
        if unique_items:
            final_map[keyword] = unique_items
            seen_items.update(unique_items)

    return final_map


def is_heading(line):
    return re.match(r"^(#+) (.+)", line)


def parse_regression_template(lines):
    metadata, line_num = parse_metadata(lines)
    if metadata == None:
        raise ValueError("metadata not found")

    result = {
        "metadata": metadata,
        "content": {}
    }

    heading_dict = None
    for line_num, line in enumerate(lines[line_num+1:]):

        heading_match = is_heading(line)
        # print(heading_match)
        if heading_match:
            hlevel = len(heading_match.group(1))  # Number of `#`
            htitle = heading_match.group(2).strip()
            heading_dict = result["content"][line_num] = {
                "headingLevel": hlevel, "headingTitle": htitle, "content": []}

        if not heading_dict:
            if len(line.strip()) == 0:
                continue
            heading_dict = result["content"][line_num] = {
                "headingLevel": 0, "headingTitle": "", "content": []}

        heading_dict["content"].append(line)

    return result


def generate(parsed_template: Dict, converted_tc: Dict, summary_typeoftest: Dict, milestone: Dict):
    sorted_line_numbers = sorted(parsed_template["content"].keys())
    regression_testcases = summary_typeoftest["Regression"]
    file_contents = []

    for line_num in sorted_line_numbers:
        content = parsed_template["content"][line_num]["content"]
        # variables_in_content = list()

        for content_line in content:
            variables = get_variable_name(content_line)
            # variables_in_content.extend(variables)
            if "$ind" in variables and parsed_template["content"][line_num]["headingTitle"].startswith("Test Scenarios for Regression"):
                for ind, tc in enumerate(regression_testcases):
                    tc_content = content_line.replace("$ind", str(ind+1))
                    file_contents.append(replace_variables(
                        milestone, converted_tc, regression_testcases, tc_content, variables, tc))
            else:
                file_contents.append(
                    replace_variables(milestone, converted_tc, regression_testcases, content_line, variables))
    return file_contents


def generate_regression_testplan(base_tc: Path, template_path: Path, generated_filename: str, milestone: Dict):
    with open(template_path, "r") as f:
        regression_template_lines = f.readlines()
    parsed_template = parse_regression_template(regression_template_lines)

    converted = convert_all_tc(base_tc)
    summary_typeoftest = get_all_testcases_summary(
        "details.Type of Test", converted)

    file_contents = generate(parsed_template, converted,
                             summary_typeoftest, milestone)
    template_metadata = dict()
    for k, v in parsed_template["metadata"].items():
        val = replace_variables(milestone, converted, [
                                "Unknown"], v, get_variable_name(v))
        template_metadata[k] = val

    # file_contents.insert(0, "---\n\n")
    # for k, v in template_metadata.items():
    #     file_contents.insert(0, f"{k}: {v}\n")
    # file_contents.insert(0, "---\n")

    # json.dump(file_contents, Path("dist/temp-regression.json").open("w"))
    file_path = save_regression_testplan(generated_filename, file_contents)
    template_metadata["file_path"] = file_path
    # export to environment variable
    export_metadata_to_env(template_metadata)


def save_regression_testplan(testplan_name: str, file_contents: List[str]):
    dist_dir = Path("dist")
    dist_dir.mkdir(exist_ok=True)
    file_name = Path(f"{testplan_name}.md")
    file_path = dist_dir/file_name
    with open(file_path, "w") as f:
        f.write("".join(file_contents))
    return file_path


def export_metadata_to_env(template_metadata: Dict[str, str]):
    # print all os env variables
    # for k, v in os.environ.items():
    #     print(f"{k}={v}")
    github_output_filepath = os.getenv('GITHUB_OUTPUT')
    print("github_output_filepath=", github_output_filepath)
    if github_output_filepath:
        with open(github_output_filepath, 'a') as env_file:
            for k, v in template_metadata.items():
                print(f"exporting output {k}={v}")
                env_file.write(f"{k}={v}\n")


if __name__ == "__main__":
    parser = ArgumentParser(
        description="create regression test plan using template and test case data")
    parser.add_argument("--generate", action="store_true",
                        help="[Required] Generate regression test plan")
    parser.add_argument("--template-path",
                        help="[Required] Provide file path to regression template file")
    parser.add_argument(
        "--generated-filename", help="[Required] Provide filename which generated regression testplan should be saved. ex. 'regression-testplan'")
    parser.add_argument(
        "--tc-dir", help="[Required] provide test case base directory. ex. '../test-cases/'")
    parser.add_argument(
        "--milestone-details", help="[Required] provide milestone json details")
    args = parser.parse_args()

    try:
        if not args.generate:
            raise ValueError("generate flag is not provided")

        # print("tc dir=", args.tc_dir)
        template_path = Path(args.template_path)
        if not template_path.exists():
            raise ValueError("regression template not exists")

        if not args.generated_filename:
            raise ValueError(
                "generated regression testplan file name is not provided")

        base_tc = Path(args.tc_dir)
        if not base_tc.exists():
            # print("base test case directory not exists")
            raise ValueError("test case directory not exists")
        if len(list(base_tc.rglob("*.md"))) == 0:
            raise ValueError("there are no files")

        if not args.milestone_details:
            raise ValueError("milestone details json is not provided")
        milestone_details = json.loads(args.milestone_details)

        no_error = True
    except Exception as e:
        no_error = False
        print("error: ", e)
        parser.print_help()

    if not no_error:
        exit(1)

    generate_regression_testplan(
        base_tc, template_path, args.generated_filename, milestone_details)
