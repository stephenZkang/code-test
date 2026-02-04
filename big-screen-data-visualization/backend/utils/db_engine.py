from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import pandas as pd
from typing import Dict, Any, List


def get_engine_url(ds_type: str, config: Dict[str, Any]) -> str:
    if ds_type == "mysql":
        # mysql+pymysql://user:password@host:port/dbname
        return f"mysql+pymysql://{config['username']}:{config['password']}@{config['host']}:{config.get('port', 3306)}/{config['database']}"
    elif ds_type == "postgresql":
        # postgresql://user:password@host:port/dbname
        return f"postgresql://{config['username']}:{config['password']}@{config['host']}:{config.get('port', 5432)}/{config['database']}"
    elif ds_type == "sqlite":
        # sqlite:///path/to/db
        return f"sqlite:///{config['database']}"
    else:
        raise ValueError(f"Unsupported data source type: {ds_type}")


def test_connection(ds_type: str, config: Dict[str, Any]) -> bool:
    try:
        url = get_engine_url(ds_type, config)
        engine = create_engine(
            url, connect_args={"connect_timeout": 5} if ds_type != "sqlite" else {}
        )
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return True
    except Exception as e:
        print(f"Connection test failed: {e}")
        return False


def execute_query(
    ds_type: str, config: Dict[str, Any], query: str
) -> List[Dict[str, Any]]:
    url = get_engine_url(ds_type, config)
    engine = create_engine(url)
    with engine.connect() as connection:
        df = pd.read_sql(text(query), connection)
        return df.to_dict(orient="records")
