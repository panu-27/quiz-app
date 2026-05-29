import json

log_path = r"C:\Users\Pranav\.gemini\antigravity-ide\brain\d8be4c2d-b934-456a-aa50-638f7fb9aad8\.system_generated\logs\transcript.jsonl"

with open(log_path, "r", encoding="utf-8") as f:
    for line in f:
        try:
            data = json.loads(line)
            tool_calls = data.get("tool_calls", [])
            for tc in tool_calls:
                args = tc.get("args", {})
                content = args.get("ReplacementContent", "") or args.get("CodeContent", "") or ""
                chunks = args.get("ReplacementChunks", [])
                if isinstance(chunks, list):
                    for chunk in chunks:
                        content += chunk.get("ReplacementContent", "")
                
                if "FullSettingsView" in content:
                    desc = args.get("Description") or tc.get("name")
                    print(f"Step {data.get('step_index')} | Tool: {tc.get('name')} | Desc: {desc}")
                    # Write it to a file so we can view the whole thing
                    out_name = f"C:\\Users\\Pranav\\Desktop\\QuizApp\\frontend\\step_{data.get('step_index')}.txt"
                    with open(out_name, "w", encoding="utf-8") as out_f:
                        out_f.write(content)
                    print(f"  Written to {out_name}")
        except Exception as e:
            pass
