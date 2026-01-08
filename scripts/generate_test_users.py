import yaml
from faker import Faker
import os
import sys

def generate_users(n=100):
    fake = Faker()
    records = []
    for _ in range(n):
        records.append({
            "object": "user",
            "data": {
                "name": fake.name(),
                "email": fake.email(),
                "password": "password123",
                "role": "standard"
            }
        })
    return records

def main():
    # 默认生成 100 条，也可以通过命令行参数指定数量
    count = 100
    if len(sys.argv) > 1:
        try:
            count = int(sys.argv[1])
        except ValueError:
            print(f"Invalid count, using default: {count}")

    # 定位路径：脚本位于 scripts/，数据文件位于 db/seed/
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    file_path = os.path.join(project_root, "db", "seed", "record-user.yml")

    if not os.path.exists(file_path):
        print(f"Creating new seed file: {file_path}")
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        content = {"records": []}
    else:
        with open(file_path, 'r') as f:
            content = yaml.safe_load(f) or {"records": []}

    if 'records' not in content:
        content['records'] = []

    users = generate_users(count)
    content['records'].extend(users)

    with open(file_path, 'w') as f:
        yaml.dump(content, f, sort_keys=False, default_flow_style=False)

    print(f"Successfully added {count} users to {file_path}")
    print(f"Total records in file: {len(content['records'])}")

if __name__ == "__main__":
    main()
