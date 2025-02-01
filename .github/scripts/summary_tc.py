from argparse import ArgumentParser
from pathlib import Path
from typing import Dict, List
import json
from parse_test_cases import save_dict


def traverse_dict(key_depths: List[str], wrapper: Dict[str, Dict]):
    if len(key_depths) == 0:
        return wrapper

    for k, v in wrapper.items():
        if k.lower() == key_depths[0].lower():
            return traverse_dict(key_depths[1:], v)


def add_testcase_summary(search_key: List[str], sd: Dict, tc_key: str, tc_details: Dict[str, Dict]):
    v = traverse_dict(search_key, tc_details)
    append_list_summary("", v, sd, tc_key)
    append_dict_summary(v, sd, tc_key)


def append_list_summary(key_prefix: str, list_values: List, sd: Dict[str, List], tc_key: str):
    if isinstance(list_values, list):
        for lv in list_values:
            if isinstance(lv, str):
                skey = f"{key_prefix}+{lv}" if len(key_prefix) > 0 else lv
                if skey not in sd:
                    sd[skey] = list()
                sd[skey].append(tc_key)
            if isinstance(lv, list):
                append_list_summary(key_prefix, lv, sd, tc_key)


def append_dict_summary(dict_value: Dict, sd: Dict[str, List], tc_key: str):
    if isinstance(dict_value, dict):
        for k2, v2 in dict_value.items():
            if k2 not in sd:
                sd[k2] = list()
            sd[k2].append(tc_key)
            append_list_summary(k2, v2, sd, tc_key)


def get_all_testcases_summary(search_keys: str, converted_tc_details: Dict[str, Dict]):
    summary_dict = dict()

    for tck, tcv in converted_tc_details.items():
        skeys = search_keys.split(".")
        add_testcase_summary(skeys, summary_dict, tck, tcv)

    search_term = search_keys.split(".")[-1:][0]
    print(f"how many '{search_term}' are there?", len(summary_dict))

    print(f"list of '{search_term}'", json.dumps(list(summary_dict.keys())))

    print(f"'{search_term}' json", json.dumps(summary_dict, indent=4))
    return summary_dict


# print_test_cases_summary("details.Type of Test", tcd)
# print_test_cases_summary("details.Impact Area", tcd)
# print_test_cases_summary("details.Tags.impact", tcd)
# print_test_cases_summary("details.Tags.feature", tcd)

if __name__ == "__main__":
    parser = ArgumentParser(
        description="analyze the test case details and create a summary for requested parameter")
    parser.add_argument("--analyze", action="store_true",
                        help="[Required] analyze test case")
    parser.add_argument("--converted-tc-path",
                        help="[Required] provide file path for converted test case details ex. 'converted-tcs.json'")
    parser.add_argument(
        "--summary-filename", help="[Required] provide filename where summary analysis should be stored. ex. 'testtype-summary'")
    parser.add_argument(
        "--key-path", help="[Required] provide key path joined by DOT. ex. 'details.Tags.feature' summarize feature base test cases. 'details.Type of Test','details.Impact Area', 'details.Tags.impact' ")
    args = parser.parse_args()

    try:
        if not args.analyze:
            raise ValueError("analyze flag is not provided")

        # print("tc dir=", args.tc_dir)
        converted_tc = Path(args.converted_tc_path)
        if not converted_tc.exists():
            raise ValueError("converted test case details not exists")

        if not args.key_path or len(args.key_path.strip()) == 0:
            raise ValueError("valid key path arg value is not provided")

        if not args.summary_filename:
            raise ValueError("summary file name is not provided")

    except Exception as e:
        print("error: ", e)
        parser.print_help()

    tc_details_dict = dict()
    with converted_tc.open("r", encoding="utf-8") as ctcf:
        tc_details_dict = json.loads(ctcf.read())

    summary_dict = get_all_testcases_summary(
        args.key_path.strip(), tc_details_dict)

    if len(summary_dict.keys()) == 0:
        raise ValueError("failed to create summary")

    save_dict(summary_dict, args.summary_filename)
