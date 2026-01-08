import yaml
from faker import Faker
import os
import sys
import random
from datetime import date

def generate_accounts(n=100):
    fake = Faker()
    records = []
    for _ in range(n):
        # Generate data matching the account object fields
        records.append({
            "object": "account",
            "data": {
                "name": fake.company(), # Using company name for accounts usually fits better
                "age": random.randint(1, 100),
                "is_happly": random.choice([True, False]),
                "birth": fake.date_of_birth(minimum_age=1, maximum_age=100).isoformat()
            }
        })
    return records

def main():
    count = 100
    if len(sys.argv) > 1:
        try:
            count = int(sys.argv[1])
        except ValueError:
            print(f"Invalid count, using default: {count}")

    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    file_path = os.path.join(project_root, "db", "seed", "record-account.yml")

    if not os.path.exists(file_path):
        print(f"Creating new seed file: {file_path}")
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        content = {"records": []}
    else:
        with open(file_path, 'r') as f:
            content = yaml.safe_load(f) or {"records": []}

    if 'records' not in content:
        content['records'] = []

    accounts = generate_accounts(count)
    content['records'].extend(accounts)

    with open(file_path, 'w') as f:
        yaml.dump(content, f, sort_keys=False, default_flow_style=False)

    print(f"Successfully added {count} accounts to {file_path}")
    print(f"Total records in file: {len(content['records'])}")

if __name__ == "__main__":
    main()
