import os

# Path to your district models directory
DISTRICT_MODEL_DIR = "district_models"

# Iterate over all files in the directory
for filename in os.listdir(DISTRICT_MODEL_DIR):
    if "__" in filename:  # Check if filename contains double underscores
        new_filename = filename.replace("__", "_")  # Fix the issue
        old_path = os.path.join(DISTRICT_MODEL_DIR, filename)
        new_path = os.path.join(DISTRICT_MODEL_DIR, new_filename)

        try:
            os.rename(old_path, new_path)
            print(f"Renamed: {filename} --> {new_filename}")
        except Exception as e:
            print(f"Error renaming {filename}: {e}")

print("✅ Filenames fixed successfully!")
