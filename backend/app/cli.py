import argparse
import sys
from app.db.init_db import init_db
from app.db.seeds import seed_db
from app.db.session import SessionLocal

def seed_command(args):
    """
    Initialize database and seed with initial data.
    """
    print("Initializing database tables...")
    init_db()
    
    print("Seeding database...")
    db = SessionLocal()
    try:
        seed_db(db)
    finally:
        db.close()
    print("Database seeding completed.")

def main():
    parser = argparse.ArgumentParser(description="VibeCRM Backend CLI")
    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # Seed command
    seed_parser = subparsers.add_parser("seed", help="Initialize and seed the database")
    seed_parser.set_defaults(func=seed_command)

    if len(sys.argv) == 1:
        parser.print_help(sys.stderr)
        sys.exit(1)

    args = parser.parse_args()
    if hasattr(args, 'func'):
        args.func(args)
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
