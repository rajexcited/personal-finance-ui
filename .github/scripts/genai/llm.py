from typing import Dict, List, Optional
from ..utils import get_env_value
from google.genai import types
from google.genai import Client

# Init Vertex AI
get_env_value("GCP_PROJECT")
get_env_value("GCP_LOCATION")
get_env_value("GCP_MODEL_NAME")

llm_client: Optional[Client] = None


def get_llm(debug_log: bool = False):
    global llm_client
    if llm_client is None:
        llm_client = Client(
            vertexai=True,
            project=get_env_value("GCP_PROJECT"),
            location=get_env_value("GCP_LOCATION")
        )

        if debug_log:
            print("llm instance =", llm_client)
            print("-" * 40)

    return llm_client


def generate_content(prompt: str,
                     generation_config: Optional[types.GenerateContentConfigOrDict] = None,
                     debug_log: bool = False
                     ):

    print("-" * 40)
    if debug_log:
        print("prompt: ")
        print(prompt)
        print("-" * 40)

        print("custom generation config: ")
        print(generation_config)
        print("-" * 40)

    llm = get_llm(debug_log)
    model_name = get_env_value("GCP_MODEL_NAME")
    if debug_log:
        print(f"generating contents using model [{model_name}]")

    if generation_config is None:
        generation_config = types.GenerateContentConfig(
            safety_settings=[
                types.SafetySetting(
                    category=types.HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                    threshold=types.HarmBlockThreshold.BLOCK_ONLY_HIGH
                )
            ]
        )

    response = llm.models.generate_content(
        model=model_name,
        contents=prompt,
        config=generation_config,
    )

    if debug_log:
        print("response: ", response)
        print("-" * 40)

        print("automatic_function_calling_history: ")
        print(response.automatic_function_calling_history)
        print("-" * 40)

        print("prompt_feedback: ")
        print(response.prompt_feedback)
        print("-" * 40)

        print("usage metadata: ")
        print(response.usage_metadata)
        print("-" * 40)

        print("code execution result: ")
        print(response.code_execution_result)
        print("-" * 40)

        print("model dump dict: ")
        print(response.model_dump())
        print("-" * 40)

    print("response text: ", response.text)
    print("-" * 40)

    return response.text.strip() if response.text is not None else ""
