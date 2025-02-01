import json
from pathlib import Path
import traceback
from typing import List
from markdown_to_json import dictify
from argparse import ArgumentParser
import re


def get_formatted_key(k: str):
    kr = k.replace("`", "").strip()
    if kr.endswith(":"):
        return kr[:-1]
    return kr


def parse_metadata(lines):
    metadata = None

    for line in lines:
        if line.strip() == "---":
            if metadata == None:
                metadata = dict()
            else:
                break
        else:
            metadata_match = re.match(r"(.+):(.+)", line)
            if metadata_match:
                key = metadata_match.group(1).strip()
                text = metadata_match.group(2).strip()
                if key in metadata:
                    raise ValueError("duplicate metadata key")
                metadata[key] = text
    return metadata


def convert_list_to_dict(key: str, list_values: List | str | dict):
    list_dict = dict()

    if isinstance(list_values, dict):
        for k, v in list_values.items():
            kk = get_formatted_key(k)
            list_dict[kk] = convert_list_to_dict(kk, v)
        return list_dict

    if isinstance(list_values, str):
        if list_values.count("=") == 1:
            list_values = [list_values]
        else:
            return list_values

    if not isinstance(list_values, List):
        raise TypeError(f"{key} are not in list format")

    for lv in list_values:
        if not isinstance(lv, str):
            raise TypeError(f"value [{lv}] in list is not string")

        lv_array = lv.split("=")
        if len(lv_array) != 2:
            raise AssertionError(
                f"{key} key and value are in incorrect format. it should be tagkey=value1,value2")

        dict_k = get_formatted_key(lv_array[0])
        if dict_k in list_dict:
            raise AssertionError(f"the key[{dict_k}] for {key} is duplicate")

        list_dict[dict_k] = get_formatted_key(lv_array[1]).split(",")
    return list_dict


def convert_tc(file: Path, base_file: Path):
    with file.open(mode="r", encoding="utf-8") as f:
        lines = f.readlines()

    metadata = parse_metadata(lines)
    if "id" not in metadata:
        raise AssertionError(
            f"id is missing in metadata of file, {file.relative_to(base_file)}")

    mid = metadata["id"].lower().replace(" ", "-")
    metadata["relative_file_path"] = f"{get_relative_path(base_file, file)}"
    metadata["file_name"] = f"{file.name}"
    converted_tc_dict = dict()
    converted_tc_dict[mid] = dict()
    converted_tc_dict[mid]["metadata"] = metadata
    tc_dict = dictify("\n".join(lines))
    if not isinstance(tc_dict, dict):
        raise TypeError("test case details are not converted into dictionary")

    if len(tc_dict.keys()) != 1:
        keys = ','.join(tc_dict.keys())
        raise AssertionError(
            f"test case file format is incorrect. only 1 level headings supported. but found [{keys}]")

    k, v = tc_dict.popitem()
    # print(f"key={k} and value={v}")
    details_dict = converted_tc_dict[mid]["details"] = dict()
    if not isinstance(v, dict):
        raise TypeError("test case detail not converted to dictionary")

    for k1, v1 in v.items():
        # print(k1,v1)
        details_k = get_formatted_key(k1)
        details_v = v1
        if details_k == "Tags":
            details_v = convert_list_to_dict(details_k, v1)
        elif details_k == "Average Performance Time":
            if not isinstance(v1, dict):
                raise TypeError(f"{details_k} is not dictionary")
            details_v = convert_list_to_dict(details_k, v1)

        details_dict[details_k] = details_v

    return converted_tc_dict


def get_relative_path(base_dir: Path, file_path: Path):
    return file_path.relative_to(base_dir)


def convert_all_tc(base_tc_dir: Path, converted_filename: str):
    all_dict = dict()
    errored_files = list()
    for tc_file in base_tc_dir.rglob("*.md"):
        kid = None
        try:
            # print(tc_file)
            tc_details = convert_tc(tc_file, base_tc_dir)
            k, v = tc_details.popitem()
            # print("k=", k)
            kid = k
            if k in all_dict:
                errored_files.append(
                    {"tc_file": f"{get_relative_path(base_tc_dir, tc_file)}", "id": k, "error": "duplicate_key"})
            else:
                all_dict[k] = v
        except Exception as e:
            relative_path = get_relative_path(base_tc_dir, tc_file)
            print(f"cannot convert the test case file, {relative_path} ", e)
            traceback.print_exception(e)
            errored_files.append(
                {"tc_file": f"{get_relative_path(base_tc_dir, tc_file)}", "id": kid, "error": f"{e}"})

    # print("all dict", all_dict, "error files", errored_files)
    if len(errored_files) > 0:
        raise AssertionError(json.dumps(errored_files, indent=4))

    save_dict(all_dict, converted_filename)


def save_dict(d: dict, name="converted-tcs"):
    dist_dir = Path("dist")
    dist_dir.mkdir(exist_ok=True)
    json_file = Path(f"{name}.json")
    file_path = dist_dir/json_file

    f = file_path.open("w")
    f.write(json.dumps(d, indent=4))
    f.close()
    print(f"dictionary is saved as json to file, {file_path}")


if __name__ == "__main__":
    parser = ArgumentParser(description="validates and converts test cases")
    parser.add_argument("--convert", action="store_true",
                        help="[Required] convert test case")
    parser.add_argument(
        "--tc-dir", help="[Required] provide test case base directory. ex. '../test-cases/'")
    parser.add_argument("--converted-filename", default="converted-tcs",
                        help="[Optional] provide file name where to save the converted test case details. ex. 'converted'")
    args = parser.parse_args()

    try:
        if not args.convert:
            raise ValueError("convert arg is not provided")

        # print("tc dir=", args.tc_dir)
        base_tc = Path(args.tc_dir)
        if not base_tc.exists():
            # print("base test case directory not exists")
            raise ValueError("test case directory not exists")
        if len(list(base_tc.rglob("*.md"))) == 0:
            raise ValueError("there are no files")

        no_errors = True
    except Exception as e:
        no_errors = False
        print("error: ", e)
        parser.print_help()

    if no_errors:
        convert_all_tc(base_tc, args.converted_filename)
