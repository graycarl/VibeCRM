from sqlalchemy import Table, Column, Integer, String, MetaData, Text, Float, Boolean, Date, ForeignKey, inspect, text
from sqlalchemy.schema import CreateTable
from app.db.session import engine

class SchemaService:
    def create_object_table(self, object_name: str):
        """
        Creates a physical table for a new Custom Object.
        Table name format: data_{object_name}
        """
        table_name = f"data_{object_name}"
        metadata = MetaData()
        
        # Define standard columns
        # id (PK), uid (UUID), created_on, modified_on, owner_id, record_type
        table = Table(
            table_name,
            metadata,
            Column("id", Integer, primary_key=True, autoincrement=True),
            Column("uid", String(36), unique=True, nullable=False),
            Column("created_on", String), # Storing as ISO string
            Column("modified_on", String),
            Column("owner_id", Integer, nullable=True), # FK to User (data_user.id)
            Column("record_type", String, nullable=True) # Storing record type name
        )
        
        with engine.begin() as conn:
            # Check if table already exists
            check_stmt = text(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table_name}'")
            if not conn.execute(check_stmt).fetchone():
                conn.execute(CreateTable(table))
            
    def delete_object_table(self, object_name: str):
        """
        Drops the physical table for a Custom Object.
        """
        table_name = f"data_{object_name}"
        with engine.begin() as conn:
            conn.execute(text(f"DROP TABLE IF EXISTS {table_name}"))

    def add_column(self, object_name: str, field_name: str, data_type: str):
        """
        Adds a column to the physical table.
        """
        table_name = f"data_{object_name}"
        
        # Mapping Metadata data_type to SQLite SQL type
        sql_type = "TEXT"
        if data_type == "Number":
            sql_type = "REAL"
        elif data_type == "Boolean":
            sql_type = "INTEGER"
        elif data_type == "Lookup":
            sql_type = "INTEGER" # FK ID
        elif data_type in ["Date", "Datetime"]:
            sql_type = "TEXT"
        # record_type is just TEXT but handled via explicit creation or migrations
        
        with engine.begin() as conn:
            # Check if column already exists
            check_stmt = text(f"PRAGMA table_info({table_name})")
            columns = [row[1] for row in conn.execute(check_stmt).fetchall()]
            if field_name not in columns:
                conn.execute(text(f"ALTER TABLE {table_name} ADD COLUMN {field_name} {sql_type}"))

    def ensure_record_type_column(self, object_name: str):
        """
        Ensures record_type column exists (for migration of existing tables).
        """
        self.add_column(object_name, "record_type", "Text")

    def remove_column(self, object_name: str, field_name: str):
        """
        Removes a column from the physical table.
        Requires SQLite 3.35+
        """
        table_name = f"data_{object_name}"
        with engine.begin() as conn:
             conn.execute(text(f"ALTER TABLE {table_name} DROP COLUMN {field_name}"))

schema_service = SchemaService()
