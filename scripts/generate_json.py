
import os
import json
import google.generativeai as genai
from dotenv import load_dotenv
import typing_extensions as typing

# Load environment variables from backend/.env
# Assuming the script is run from the project root or scripts directory
# taking a best effort to find .env
current_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(current_dir, '..', 'backend', '.env')
if not os.path.exists(env_path):
    env_path = os.path.join(current_dir, '..', '.env')

load_dotenv(env_path)

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print(f"Error: GEMINI_API_KEY not found in {env_path}")
    exit(1)

genai.configure(api_key=api_key)

# Load schema
schema_path = os.path.join(current_dir, 'lesson_schema.json')
try:
    with open(schema_path, 'r') as f:
        SCHEMA = json.load(f)
except FileNotFoundError:
    print(f"Error: Schema file not found at {schema_path}")
    exit(1)

def summarize_schema(schema):
    """
    Creates a brief summary of the schema structure for the prompt.
    """
    summary = []
    if "properties" in schema:
        summary.append("Root properties: " + ", ".join(schema["properties"].keys()))
    
    if "definitions" in schema:
        summary.append("\nPage Types (definitions):")
        for name, definition in schema["definitions"].items():
            if "properties" in definition:
                props = ", ".join(definition["properties"].keys())
                summary.append(f"- {name}: {props}")
                
    return "\n".join(summary)

def generate_course_content(num_modules: int = 1):
    """
    Generates structured JSON using Gemini 3.0 Pro based on the schema.
    """
    
    # Model configuration
    model_name = "gemini-3-pro-preview" 

    try:
        model = genai.GenerativeModel(model_name)
    except Exception as e:
        print(f"Error initializing model '{model_name}': {e}")
        # Fallback omitted to ensure we try the requested model
        return None

    lessons = []
    schema_summary = summarize_schema(SCHEMA)
    
    for i in range(num_modules):
        # Determine difficulty/nuance based on module sequence
        if i == 0:
            difficulty = "Beginner: 'Right on the nose'. The sarcasm should be extremely obvious and exaggerated."
        elif i == 1:
            difficulty = "Intermediate: The sarcasm should be clear but less exaggerated than the beginner level."
        else:
            difficulty = "Advanced: 'Rather nuanced'. The sarcasm should be subtle, relying heavily on tone or context, and easy to miss."

        print(f"Generating lesson {i+1}/{num_modules} [Difficulty: {difficulty.split(':')[0]}]...")
        
        prompt = f"""
        Create a valid JSON object for a lesson about "Sarcasm".
        Lesson Number: {i+1}
        Difficulty Level: {difficulty}
        
        Schema Summary:
        {schema_summary}
        
        The output MUST be a valid JSON object that strictly adheres to the following JSON Schema:
        {json.dumps(SCHEMA, indent=2)}
        
        Ensure the 'pages' array contains at least one of each page type defined in definitions (loading, definition, practice, results) in a logical order.
        """

        try:
            result = model.generate_content(
                prompt,
                generation_config=genai.GenerationConfig(
                    response_mime_type="application/json"
                )
            )
            
            if result.text:
                lessons.append(json.loads(result.text))
            
        except Exception as e:
            print(f"Generation failed for lesson {i+1}: {e}")
            
    if len(lessons) == 1:
        return json.dumps(lessons[0], indent=2)
    else:
        return json.dumps(lessons, indent=2)

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Generate structured JSON with Gemini")
    parser.add_argument("--modules", type=int, default=1, help="Number of modules to generate")
    
    args = parser.parse_args()
    
    print(f"Generating content with {args.modules} module(s)...")
    json_output = generate_course_content(num_modules=args.modules)
    
    if json_output:
        print("\n--- Generated JSON ---")
        print(json_output)
        
        # Optionally save to file
        with open("generated_structure.json", "w") as f:
            f.write(json_output)
        print("\nSaved to generated_structure.json")
    else:
        print("Failed to generate content.")
