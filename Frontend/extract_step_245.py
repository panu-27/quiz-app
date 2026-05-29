import json
import sys
sys.stdout.reconfigure(encoding='utf-8')

path = r"C:\Users\Pranav\.gemini\antigravity-ide\brain\ce66ca13-1531-41b8-94a5-5f7c89c1a7a3\.system_generated\logs\transcript.jsonl"
with open(path, "r", encoding="utf-8") as f:
    for idx, line in enumerate(f):
        if "extract_step" in line:
            continue
        data = json.loads(line)
        # Search for tool calls in this step
        tool_calls = data.get("tool_calls", [])
        for tc in tool_calls:
            name = tc.get("name")
            if name in ["replace_file_content", "multi_replace_file_content", "write_to_file"]:
                args = tc.get("args", {})
                args_str = str(args)
                if "Explore Batch" in args_str:
                    print(f"Index {idx}: tool {name} has Explore Batch")
                    # print details of replacement
                    print(json.dumps(args, indent=2)[:1000])
                    print("="*60)
