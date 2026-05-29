import json

with open("test_hist_views.txt", "r", encoding="utf-8") as f:
    lines = f.readlines()

for line in lines[-20:]:
    d = json.loads(line)
    if 'TestHistory.jsx' in line:
        print(f"Step {d.get('step_index')}: {d.get('type')} - len: {len(line)}")
