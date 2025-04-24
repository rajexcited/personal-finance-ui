
from enum import Enum
from typing import List
from .md_header import MdHeader, build_header


def enum_serializer(obj):
    if isinstance(obj, Enum):
        return obj.value  # Serialize using `value`
    raise TypeError(f"Type {type(obj)} not serializable")


def parsed_body(requestform_body: str) -> List:
    """
        parse the request form contents to MdHeader instance
    """
    parsed_form_header = MdHeader()
    build_header(requestform_body.splitlines(),
                 parent_header=parsed_form_header)

    # export parsed form json to debug
    # with open("dist/parsed_request_form.json", "w") as rf:
    #     rf.write(json.dumps([item.model_dump() if isinstance(item, BaseModel) else item for item in parsed_form_header.contents], default=enum_serializer))

    def get_l3_list(header: MdHeader):
        content_list = []
        for cl in header.contents:
            found_level_3 = False
            if isinstance(cl, MdHeader):
                if cl.level < 3:
                    content_list.extend(get_l3_list(cl))
                if cl.level == 3:
                    found_level_3 = True
                    break
        if found_level_3:
            content_list.extend(header.contents)
        return content_list

    return get_l3_list(parsed_form_header)
