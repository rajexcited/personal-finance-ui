from argparse import ArgumentParser
from pathlib import Path
from typing import Dict, List
import json
from tabulate import tabulate


def print_summary_total(summary_dict: Dict):
    tabulate_data_by_key = dict()
    first_key = "---first-key---"
    tabulate_data_by_key[first_key] = list()

    for k, v in summary_dict.items():
        if "+" in k:
            k_array = k.split("+")
            if k_array[0] not in tabulate_data_by_key:
                tabulate_data_by_key[k_array[0]] = list()
            tabulate_data_by_key[k_array[0]].append([k_array[1], len(v)])
        else:
            tabulate_data_by_key[first_key].append([k, len(v)])

    for k, v in tabulate_data_by_key.items():
        if k == first_key:
            print(tabulate(tabular_data=v, headers=[
                  "key", "total testcases"], tablefmt="grid"))

    for k, v in tabulate_data_by_key.items():
        if k != first_key:
            print(f"\n{k} is further categorised into:")
            print(tabulate(tabular_data=sorted(v), headers=[
                "key", "total testcases"], tablefmt="grid"))


def print_human_readable_summary(output: str, summary_filepath: Path):
    summary_dict = dict()
    with summary_filepath.open("r", encoding="utf-8") as spf:
        summary_dict = json.loads(spf.read())

    if len(summary_dict.keys()) == 0:
        print("no summary data found")

    elif output == "keys":
        tabulate_data = list()
        for k in sorted(summary_dict.keys()):
            tabulate_data.append([k])
        print(tabulate(tabular_data=tabulate_data,
              headers=["keys"], tablefmt="grid"))

    elif output == "total":
        print_summary_total(summary_dict)

    elif output == "values":
        tabulate_data = list()
        for k, v in summary_dict.items():
            tabulate_data.append([k, len(v), "\n".join(sorted(v))])

        print(tabulate(tabular_data=tabulate_data, headers=[
              "Key", "total", "Testcases"], tablefmt="grid"))


if __name__ == "__main__":
    parser = ArgumentParser(
        description="read summary json and display human readable format")
    parser.add_argument("--output", choices=["keys", "total", "values"],
                        help="[Required] what to display in human readable format")
    parser.add_argument(
        "--summary-filepath", help="[Required] provide filepath where summary analysis has been stored. ex. 'dist/testtype-summary.json'")
    args = parser.parse_args()
    try:
        if not args.output:
            raise ValueError("output is not provided")

        summary_filepath = Path(args.summary_filepath)
        if not summary_filepath.exists():
            raise ValueError("summary file path not exists")

        no_error = True
    except Exception as e:
        no_error = False
        print("error: ", e)
        parser.print_help()

    if not no_error:
        exit(1)

    print_human_readable_summary(args.output, summary_filepath)
