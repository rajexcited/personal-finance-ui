from pathlib import Path


rootpath = Path(__file__).resolve().parents[3]


def is_empty(s: str):
    return s is None or len(s.strip()) == 0
