import json
import os
from jsonschema import validate
from jsonschema.validators import validator_for

def validate_schema_definition():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    schema_path = os.path.join(current_dir, 'lesson_schema.json')

    try:
        with open(schema_path, 'r') as f:
            schema = json.load(f)
        
        # Check which draft the schema claims to be
        Validator = validator_for(schema)
        Validator.check_schema(schema)
        
        print(f"SUCCESS: The schema in '{schema_path}' is a valid JSON Schema ({Validator.META_SCHEMA['$schema']}).")
        return True

    except Exception as e:
        print(f"FAILURE: The schema is invalid.\nError: {e}")
        return False

if __name__ == "__main__":
    validate_schema_definition()
