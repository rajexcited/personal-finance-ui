from argparse import ArgumentParser
from pathlib import Path
from typing import Dict
import json
from tabulate import tabulate


def print_summary_total(summary_dict: Dict):
    tabulate_data_by_key = dict()

    for k, v in summary_dict.items():
        key_parts = k.rpartition("+")
        main_key = key_parts[0]
        sub_key = key_parts[2]
        if main_key not in tabulate_data_by_key:
            tabulate_data_by_key[main_key] = list()
        tabulate_data_by_key[main_key].append([sub_key, len(v)])

    headers = ["key", "Total Testcases"]
    for k, v in tabulate_data_by_key.items():
        if k == "":
            print(tabulate(tabular_data=v, headers=headers, tablefmt="grid"))

    for k, v in tabulate_data_by_key.items():
        if k != "":
            print(f"\n{k} is further categorised into:")
            print(tabulate(tabular_data=sorted(v),
                  headers=headers, tablefmt="grid"))


def print_summary_keys(summary_dict: Dict):
    tabulate_dataset = {k.rpartition("+")[2] for k in summary_dict.keys()}
    tabulate_data = [[k] for k in sorted(tabulate_dataset)]
    print(tabulate(tabular_data=tabulate_data,
          headers=["Keys"], tablefmt="grid"))


def print_summary_values(summary_dict: Dict):
    tabulate_data = list()
    for k, v in summary_dict.items():
        tabulate_data.append([k, len(v), "\n".join(sorted(v))])
    print(tabulate(tabular_data=tabulate_data, headers=[
          "Key", "Total", "Testcases"], tablefmt="grid"))


def print_human_readable_summary(output: str, summary_filepath: Path):
    with summary_filepath.open("r", encoding="utf-8") as spf:
        summary_dict = json.load(spf)

    if not summary_dict or len(summary_dict.keys()) == 0:
        print("No summary data found")

    elif output == "total":
        print_summary_total(summary_dict)
    elif output == "keys":
        print_summary_keys(summary_dict)
    elif output == "values":
        print_summary_values(summary_dict)


if __name__ == "__main__":
    parser = ArgumentParser(
        description="read summary json and display human readable format")
    parser.add_argument("--output", choices=["keys", "total", "values"],
                        help="[Required] what to display in human readable format")
    parser.add_argument(
        "--summary-filepath", help="[Required] provide filepath where summary analysis has been stored. ex. 'dist/testtype-summary.json'")
    args = parser.parse_args()

    summary_filepath = Path()
    try:
        if not args.output:
            raise ValueError("output is not provided")

        summary_filepath = Path(args.summary_filepath)
        if not summary_filepath.exists():
            raise ValueError("summary file path not exists")

    except Exception as e:
        print("error: ", e)
        parser.print_help()
        exit(1)

    print_human_readable_summary(args.output, summary_filepath)
