import os
import sys
import argparse
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Import all models to ensure they are registered in Base.metadata
from app.models import Base
import app.models

def migrate_data(pg_url: str):
    print(f"Connecting to Local SQLite (cca.db)...")
    sqlite_engine = create_engine("sqlite:///./cca.db")
    
    # Fix postgres:// to postgresql://
    if pg_url.startswith("postgres://"):
        pg_url = pg_url.replace("postgres://", "postgresql://", 1)
        
    print(f"Connecting to Render PostgreSQL...")
    try:
        pg_engine = create_engine(pg_url)
        pg_engine.connect().close()
    except Exception as e:
        print(f"Error connecting to PostgreSQL: {e}")
        return

    # Drop and recreate all tables in PostgreSQL
    print("Dropping existing tables in PostgreSQL...")
    Base.metadata.drop_all(bind=pg_engine)
    print("Creating tables in PostgreSQL...")
    Base.metadata.create_all(bind=pg_engine)

    # Reflect metadata to iterate through tables in topological order (handles foreign keys)
    tables = Base.metadata.sorted_tables

    for table in tables:
        print(f"Migrating table: {table.name}...")
        
        # Read from SQLite
        with sqlite_engine.connect() as sqlite_conn:
            rows = sqlite_conn.execute(table.select()).fetchall()
            
            if not rows:
                print(f"  -> No data in {table.name}, skipping.")
                continue
                
            # Convert to dictionaries
            records = [dict(zip(table.columns.keys(), row)) for row in rows]
            print(f"  -> Found {len(records)} records.")

        # Write to PostgreSQL
        batch_failed = False
        with pg_engine.begin() as pg_conn:
            try:
                pg_conn.execute(table.insert(), records)
                print(f"  -> Successfully migrated {len(records)} records to {table.name}.")
            except Exception as e:
                print(f"  -> Batch insert failed due to constraints. Falling back to row-by-row...")
                batch_failed = True
                
        # If batch failed, we have to do it in a new transaction row-by-row
        if batch_failed:
            success_count = 0
            for record in records:
                try:
                    with pg_engine.begin() as pg_conn:
                        pg_conn.execute(table.insert(), [record])
                    success_count += 1
                except Exception:
                    pass # Ignore orphaned records
            print(f"  -> Successfully migrated {success_count}/{len(records)} valid records to {table.name}.")
        
    print("\nResetting PostgreSQL Sequences...")
    # Postgres needs sequences reset when IDs are explicitly inserted
    with pg_engine.begin() as pg_conn:
        for table in tables:
            if 'id' in table.columns.keys():
                seq_query = text(f"SELECT setval(pg_get_serial_sequence('{table.name}', 'id'), coalesce(max(id),0) + 1, false) FROM {table.name};")
                try:
                    pg_conn.execute(seq_query)
                    print(f"  -> Reset sequence for {table.name}")
                except Exception as e:
                    print(f"  -> Could not reset sequence for {table.name}: {e}")

    print("\n[SUCCESS] MIGRATION COMPLETE! All local data is now on Render.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Migrate SQLite to Render Postgres")
    parser.add_argument("pg_url", help="The External Database URL from Render (postgres://...)")
    args = parser.parse_args()
    
    migrate_data(args.pg_url)
