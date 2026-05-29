import json
import re
import os

# First, checkout the clean file
os.system("git checkout -- ../Frontend/src/student/StudentProfile.jsx")

file_path = r"c:\Users\Pranav\Desktop\QuizApp\frontend\src\student\StudentProfile.jsx"
log_path = r"C:\Users\Pranav\.gemini\antigravity-ide\brain\d8be4c2d-b934-456a-aa50-638f7fb9aad8\.system_generated\logs\transcript.jsonl"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# We need to parse all steps in transcript.jsonl and find replace/multi_replace calls.
# We only apply steps that happened BEFORE our current session, i.e., step_index < 987.
# Let's read all JSON lines.
steps = []
with open(log_path, "r", encoding="utf-8") as f:
    for line in f:
        try:
            data = json.loads(line)
            if data.get("source") == "MODEL" and data.get("step_index", 0) < 987:
                steps.append(data)
        except Exception:
            pass

# Sort steps by step_index
steps.sort(key=lambda s: s.get("step_index", 0))

def clean_str(s):
    if s is None:
        return ""
    # Strip quotes if they surround the string
    s = s.strip()
    if s.startswith('"') and s.endswith('"'):
        # Parse it as a JSON string to resolve escape sequences
        try:
            return json.loads(s)
        except Exception:
            return s[1:-1]
    return s

# Play back each step
for step in steps:
    tool_calls = step.get("tool_calls", [])
    for tc in tool_calls:
        name = tc.get("name")
        args = tc.get("args", {})
        target_file = clean_str(args.get("TargetFile", ""))
        if "StudentProfile.jsx" in target_file:
            if name == "replace_file_content":
                target_content = clean_str(args.get("TargetContent", ""))
                replacement_content = clean_str(args.get("ReplacementContent", ""))
                if target_content in content:
                    content = content.replace(target_content, replacement_content, 1)
                    print(f"Step {step.get('step_index')}: Applied replace_file_content successfully.")
                else:
                    print(f"Step {step.get('step_index')}: FAILED to apply replace_file_content. Target content not found.")
            elif name == "multi_replace_file_content":
                chunks = args.get("ReplacementChunks", [])
                if isinstance(chunks, str):
                    try:
                        chunks = json.loads(clean_str(chunks))
                    except Exception:
                        pass
                
                print(f"Step {step.get('step_index')}: Processing multi_replace_file_content with {len(chunks)} chunks.")
                # We should sort chunks or apply them carefully.
                # Let's apply each chunk.
                success = True
                for idx, chunk in enumerate(chunks):
                    t_content = clean_str(chunk.get("TargetContent", ""))
                    r_content = clean_str(chunk.get("ReplacementContent", ""))
                    if t_content in content:
                        content = content.replace(t_content, r_content, 1)
                    else:
                        print(f"  Chunk {idx} FAILED. Target content not found.")
                        success = False
                if success:
                    print(f"  All chunks applied successfully.")
                else:
                    print(f"  Some chunks failed.")

# Save the restored content to a temp file first, to verify
restored_path = r"c:\Users\Pranav\Desktop\QuizApp\frontend\src\student\StudentProfile_restored.jsx"
with open(restored_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Restoration script finished. Verification path:", restored_path)
