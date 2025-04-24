import os
from pathlib import Path
from typing import Dict
from .base import rootpath


def export_to_env(env_to_export: Dict[str, str]):
    # print all os env variables
    # for k, v in os.environ.items():
    #     print(f"{k}={v}")
    github_output_filepath = os.getenv('GITHUB_OUTPUT')
    # print("github_output_filepath=", github_output_filepath)
    if not github_output_filepath:
        github_output_filepath = Path(rootpath/"dist/GITHUB_OUTPUT")
        github_output_filepath.parent.mkdir(parents=True, exist_ok=True)
        print("since GITHUB_OUTPUT variable is not defined, exporting env to file: ",
              github_output_filepath.resolve())
    with open(github_output_filepath, 'a') as env_file:
        for k, v in env_to_export.items():
            print(f"exporting output {k}={v}")
            if "\n" in v:
                env_file.write(f"{k}<<EOF\n{v}\nEOF\n")
            else:
                env_file.write(f"{k}={v}\n")
