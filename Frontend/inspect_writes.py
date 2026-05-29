import json

log_path = r"C:\Users\Pranav\.gemini\antigravity-ide\brain\d8be4c2d-b934-456a-aa50-638f7fb9aad8\.system_generated\logs\transcript.jsonl"

with open(log_path, "r", encoding="utf-8") as f:
    for i, line in enumerate(f):
        try:
            data = json.loads(line)
            tool_calls = data.get("tool_calls", [])
            for tc in tool_calls:
                name = tc.get("name")
                args = tc.get("args", {})
                target = args.get("TargetFile", "") or args.get("AbsolutePath", "")
                if "StudentProfile.jsx" in target and name in ["write_to_file", "replace_file_content", "multi_replace_file_content"]:
                    print(f"Step {data.get('step_index')} | Tool: {name} | Desc: {args.get('Description') or args.get('Instruction')}")
        except Exception as e:
            pass
