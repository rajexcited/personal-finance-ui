from operator import le
from typing import List, Optional
import requests
from .models import CategoryModel, CommentsModel, IssueModel
from ..utils import get_env_value


def get_issues(category: CategoryModel, generic_exclude_labels: Optional[List[str]]):
    exclude_labels1 = category.labels.exclude if category.labels.exclude is not None else []
    exclude_labels2 = generic_exclude_labels if generic_exclude_labels is not None else []
    unique_exclude_labels = [el for el in set(exclude_labels1+exclude_labels2)]
    print("exclude labels: ", unique_exclude_labels)
    include_labels = category.labels.include if category.labels.include is not None else []
    gql_issues = fetch_issues_by_labels(include_labels, unique_exclude_labels)
    if not isinstance(gql_issues, List):
        raise ValueError("graphql response is not list")

    converted_issues: List[IssueModel] = []
    for gql_issue in gql_issues:
        issue = IssueModel(
            number=gql_issue["number"],
            title=gql_issue["title"],
            body=gql_issue["bodyText"],
            comments=CommentsModel(
                total=gql_issue["comments"]["totalCount"],
                top_prioritized=[cb["bodyText"] for cb in gql_issue["comments"]["nodes"]]
            ),
            commits=[ti_edge["node"]["commit"]["message"] for ti_edge in gql_issue["timelineItems"]["edges"]]
        )
        converted_issues.append(issue)
    return converted_issues


def fetch_issues_by_labels(include_labels: List[str], exclude_labels: List[str]):
    include_labels_joined = ""
    unique_include_labels = set(include_labels)-set(exclude_labels)
    if len(unique_include_labels) > 0:
        include_labels_joined = '\\"'+'\\",\\"'.join(unique_include_labels)+'\\"'

    exclude_labels_query_part = ""
    if len(exclude_labels) > 0:
        exclude_labels_joined = '\\"'+'\\",\\"'.join(exclude_labels)+'\\"'
        exclude_labels_query_part = "-label:"+exclude_labels_joined

    graphql_query = f"""
    query {{
        search(
            query: "repo:{get_env_value("GITHUB_REPOSITORY")} is:issue milestone:\\"{get_env_value("MILESTONE_TITLE")}\\" label:{include_labels_joined} {exclude_labels_query_part} "
            type: ISSUE
            first: 100
        ) {{
            issueCount
            nodes {{
            __typename
            ... on Issue {{
                number
                title
                bodyText
                comments(first: 3) {{
                totalCount
                    nodes {{
                        bodyText
                    }}
                }}
                labels(first: 10) {{
                    nodes {{
                        name
                    }}
                }}
                timelineItems(first: 20, itemTypes: [REFERENCED_EVENT]) {{
                totalCount
                edges {{
                    node {{
                    __typename
                    ... on ReferencedEvent {{
                        commit {{
                            message
                        }}
                    }}
                    }}
                }}
                }}
            }}
            }}
        }}
    }}
    """
    # print("gql query: ", graphql_query)

    github_token = get_env_value("GH_TOKEN")
    headers = {
        "Authorization": f"Bearer {github_token}",
        "Content-Type": "application/json",
    }
    graphql_url = get_env_value("GITHUB_GRAPHQL_URL")
    response = requests.post(graphql_url, headers=headers, json={"query": graphql_query})
    print("graphql response: ", response)
    response.raise_for_status()  # Raise an exception for HTTP errors

    response_json = response.json()
    # print("response json dict: ", response_json)
    search_results = response_json["data"]["search"]
    print(f"there are {search_results["issueCount"]} issues matching search query. and downloaded {len(search_results["nodes"])} issues.")
    return search_results["nodes"]
