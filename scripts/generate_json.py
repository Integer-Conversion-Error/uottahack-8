
import os
import json
import google.generativeai as genai
from dotenv import load_dotenv
import typing_extensions as typing
import re
from jsonschema import validate, ValidationError

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



def generate_course_content(num_modules: int = 1, tone: str = "Sarcasm"):
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
    lessons = []
    
    for i in range(num_modules):
        # Determine difficulty/nuance based on module sequence
        if i == 0:
            difficulty = f"Beginner: 'Right on the nose'. The {tone.lower()} should be extremely obvious and exaggerated."
        elif i == 1:
            difficulty = f"Intermediate: The {tone.lower()} should be clear but less exaggerated than the beginner level."
        else:
            difficulty = f"Advanced: 'Rather nuanced'. The {tone.lower()} should be subtle, relying heavily on context, and easy to miss."

        print(f"Generating lesson {i+1}/{num_modules} [Difficulty: {difficulty.split(':')[0]}] for tone: {tone}...")
        
        prompt = f"""
        Create a valid JSON object for a lesson about "{tone}".
        Lesson Number: {i+1}
        Difficulty Level: {difficulty}
        
        
        The output MUST be a valid JSON object that strictly adheres to the following JSON Schema:
        {json.dumps(SCHEMA, indent=2)}
        

        - Ensure the 'pages' array contains at least one of each page type defined in definitions (definition, practice) in a logical order.
        - For 'audioSample.url', ALWAYS use an empty string "".
        - Popluate 'audioSample.toneTag' with a descriptive bracketed tag (e.g., "[Sarcastic]", "[Warmly]", "[Angry]") that matches the specific nuance of that example.
        - Focus on candor and reciprocity in interactions. The tone should be SHARED between speakers. Avoid one-sided scenarios where one person is {tone.lower()}/emotional and the other is stoic. Both participants should be engaging in the tonal context (e.g., both being {tone.lower()}).
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
    parser.add_argument("--tone", type=str, default="Sarcasm", help="Tone of the lesson (e.g., 'Sarcasm', 'Empathy', 'Anger')")
    
    args = parser.parse_args()
    
    print(f"Generating content with {args.modules} module(s) for tone: {args.tone}...")
    json_output = generate_course_content(num_modules=args.modules, tone=args.tone)
    
    if json_output:
        print("\n--- Generated JSON ---")
        
        try:
            parsed_output = json.loads(json_output)
            
            # Ensure it's a list for iteration
            if isinstance(parsed_output, dict):
                lessons_to_save = [parsed_output]
            else:
                lessons_to_save = parsed_output
            
            for lesson in lessons_to_save:
                # Validate against schema
                try:
                    validate(instance=lesson, schema=SCHEMA)
                    print(f"Validation successful for lesson: {lesson.get('lessonName')}")
                except ValidationError as e:
                    print(f"Schema Validation Error for lesson '{lesson.get('lessonName')}': {e.message}")
                    continue

                # Sanitize filename
                # Sanitize filename
                lesson_name = lesson.get("lessonName", "untitled_lesson")
                safe_name = re.sub(r'[^a-zA-Z0-9]', '_', lesson_name)
                # Remove repeated underscores
                safe_name = re.sub(r'_+', '_', safe_name).strip('_')
                
                filename = f"{safe_name}.json"
                
                with open(filename, "w") as f:
                    json.dump(lesson, f, indent=2)
                print(f"Saved lesson to: {filename}")
                
        except json.JSONDecodeError:
            print("Error: Could not parse generated JSON for saving.")
            print(json_output)
            
    else:
        print("Failed to generate content.")
