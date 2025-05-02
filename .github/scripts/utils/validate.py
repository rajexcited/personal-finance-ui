from argparse import Namespace
from enum import Enum
import json
from pathlib import Path
from typing import Any, Callable, Dict, List, TypeVar, Optional


def get_valid_dict(arg: Any) -> Optional[Dict]:
    """
    Parses and returns a valid dictionary from a file path, JSON string, or dictionary input.

    Args:
        arg (Any): Input value, which can be:
            - A dictionary (returned as is).
            - A file path containing JSON data.
            - A JSON-formatted string.

    Returns:
        Optional[Dict]: A valid dictionary if conversion is successful; otherwise, None.

    Raises:
        json.JSONDecodeError: If the input string is not valid JSON.

    Process:
        - If `arg` is a file path, attempts to load JSON from the file.
        - If `arg` is a string, attempts to parse it as JSON.
        - Validates that the parsed value is a dictionary before returning.
    """
    ret_dict = arg
    if Path(arg).exists():
        with open(arg, "r") as f:
            ret_dict = json.load(f)
    elif isinstance(arg, str):
        try:
            ret_dict = json.loads(arg)
        except json.JSONDecodeError as e:
            print("arg is not json convertable")

    if isinstance(ret_dict, Dict):
        return ret_dict
    return None


def get_converted_enum(enum_type: type[Enum], val: str):
    """
    Converts a string value to an enumeration member of the specified enum type.
    Args:
        enum_type (type[Enum]): The enumeration type to which the value should be converted.
        val (str): The string value to convert to an enum member.
    Returns:
        Enum or None: The corresponding enum member if the conversion is successful, 
                      or None if the value cannot be converted.
    """
    try:
        if val in enum_type.__members__:
            return enum_type[val]
        else:
            return enum_type(val)
    except:
        return None


# Callable Return Type
CRT = TypeVar('CRT', str, Dict, List, bool, Enum)


def get_parsed_arg_value(args: Namespace, key: str, arg_type_converter: Callable[[Any], Optional[CRT]]) -> CRT:
    """
    Processes a CLI argument using a specified conversion function and performs validations.

    Arguments:
        args (Namespace): Parsed arguments from the command-line interface.
        key (str): The argument key to retrieve from the parsed input.
        arg_type_converter (Callable): A function that accepts a single argument (CLI value)
            and returns an instance of the expected type.

    Returns:
        CRT: An instance of the generic type returned by the converter function.

    Raises:
        ValueError: If validation checks fail.

    Validations:
        - Ensures the converted value is not None.
        - If the converted value is an instance of Dictionary, List, String, or Tuple,
          its length must be greater than zero.
    """
    val: Optional[CRT] = None
    if hasattr(args, key):
        val = arg_type_converter(getattr(args, key))
    if not val or (isinstance(val, (list, dict, str, tuple)) and len(val) == 0):
        converted_key = key.replace("_", " ")
        raise ValueError(f"arg value,{converted_key}, is not provided")
    return val
