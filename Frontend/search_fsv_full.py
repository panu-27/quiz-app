import json

log_path = r"C:\Users\Pranav\.gemini\antigravity-ide\brain\d8be4c2d-b934-456a-aa50-638f7fb9aad8\.system_generated\logs\transcript.jsonl"

with open(log_path, "r", encoding="utf-8") as f:
    for line in f:
        try:
            data = json.loads(line)
            tool_calls = data.get("tool_calls", [])
            for tc in tool_calls:
                args = tc.get("args", {})
                content = args.get("ReplacementContent", "") or args.get("CodeContent", "")
                if "function FullSettingsView" in content:
                    print(f"Step {data.get('step_index')} | Tool: {tc.get('name')}")
                    print(content)
                    print("="*80)
        except Exception:
            pass
