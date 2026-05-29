import json

log_path = r"C:\Users\Pranav\.gemini\antigravity-ide\brain\d8be4c2d-b934-456a-aa50-638f7fb9aad8\.system_generated\logs\transcript.jsonl"

with open(log_path, "r", encoding="utf-8") as f:
    for line in f:
        try:
            data = json.loads(line)
            step_index = data.get("step_index")
            if step_index in [853, 854, 855, 856]:
                # Print type, status, and length of content
                content = data.get("content", "")
                print(f"Step {step_index} | Type: {data.get('type')} | Content Length: {len(content)}")
                if content:
                    print(content[:500])
                    print("...")
                    print(content[-500:])
                    print("="*80)
        except Exception as e:
            pass
