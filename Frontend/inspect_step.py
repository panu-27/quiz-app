import json

log_path = r"C:\Users\Pranav\.gemini\antigravity-ide\brain\d8be4c2d-b934-456a-aa50-638f7fb9aad8\.system_generated\logs\transcript.jsonl"

with open(log_path, "r", encoding="utf-8") as f:
    for line in f:
        try:
            data = json.loads(line)
            if data.get("step_index") == 959:
                print(json.dumps(data, indent=2))
        except Exception as e:
            pass
