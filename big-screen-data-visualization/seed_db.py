import sqlite3
import json
from datetime import datetime


def seed():
    conn = sqlite3.connect("backend/situational_dashboard.db")
    cursor = conn.cursor()

    # Create table check (already done by FastAPI, but just in case)

    # 1. Add a DataSource (API type)
    cursor.execute(
        """
        INSERT INTO datasources (name, type, connection_config, description, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
    """,
        (
            "Mock API",
            "api",
            json.dumps({"url": "http://localhost:8000/api"}),
            "Internal mock data source",
            datetime.utcnow(),
            datetime.utcnow(),
        ),
    )
    datasource_id = cursor.lastrowid

    # 2. Add Datasets
    # Map Dataset
    cursor.execute(
        """
        INSERT INTO datasets (name, datasource_id, query_config, refresh_interval, description, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """,
        (
            "China Map Data",
            datasource_id,
            json.dumps({"type": "map"}),
            60,
            "Main map data",
            datetime.utcnow(),
            datetime.utcnow(),
        ),
    )
    map_dataset_id = cursor.lastrowid

    # Chart Dataset
    cursor.execute(
        """
        INSERT INTO datasets (name, datasource_id, query_config, refresh_interval, description, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """,
        (
            "Regional Stats",
            datasource_id,
            json.dumps({"type": "chart"}),
            30,
            "Bar/Line chart data",
            datetime.utcnow(),
            datetime.utcnow(),
        ),
    )
    chart_dataset_id = cursor.lastrowid

    # Metric Dataset
    cursor.execute(
        """
        INSERT INTO datasets (name, datasource_id, query_config, refresh_interval, description, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """,
        (
            "Total Business Metric",
            datasource_id,
            json.dumps({"type": "metric"}),
            10,
            "Live stats",
            datetime.utcnow(),
            datetime.utcnow(),
        ),
    )
    metric_dataset_id = cursor.lastrowid

    # 3. Add Dashboard
    cursor.execute(
        """
        INSERT INTO dashboards (name, title, layout_config, is_public, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
    """,
        (
            "IntegratedSituational",
            "综合态势大屏 - 旗舰版",
            json.dumps({}),
            1,
            datetime.utcnow(),
            datetime.utcnow(),
        ),
    )
    dashboard_id = cursor.lastrowid

    # 4. Add Widgets
    # Center Map
    cursor.execute(
        """
        INSERT INTO widgets (dashboard_id, dataset_id, type, config, position, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """,
        (
            dashboard_id,
            map_dataset_id,
            "echarts_map",
            json.dumps({"title": "全国业务态势图"}),
            json.dumps({"x": 3, "y": 0, "w": 6, "h": 8}),
            datetime.utcnow(),
            datetime.utcnow(),
        ),
    )

    # Left Bar
    cursor.execute(
        """
        INSERT INTO widgets (dashboard_id, dataset_id, type, config, position, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """,
        (
            dashboard_id,
            chart_dataset_id,
            "chart",
            json.dumps({"title": "分区域业务量", "type": "bar"}),
            json.dumps({"x": 0, "y": 0, "w": 3, "h": 4}),
            datetime.utcnow(),
            datetime.utcnow(),
        ),
    )

    # Left Pie (using same dataset for simplicity)
    cursor.execute(
        """
        INSERT INTO widgets (dashboard_id, dataset_id, type, config, position, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """,
        (
            dashboard_id,
            chart_dataset_id,
            "chart",
            json.dumps({"title": "业务占比", "type": "pie"}),
            json.dumps({"x": 0, "y": 4, "w": 3, "h": 4}),
            datetime.utcnow(),
            datetime.utcnow(),
        ),
    )

    # Right Line
    cursor.execute(
        """
        INSERT INTO widgets (dashboard_id, dataset_id, type, config, position, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """,
        (
            dashboard_id,
            chart_dataset_id,
            "chart",
            json.dumps({"title": "业务增长趋势", "type": "line"}),
            json.dumps({"x": 9, "y": 0, "w": 3, "h": 4}),
            datetime.utcnow(),
            datetime.utcnow(),
        ),
    )

    # Bottom Metrics
    cursor.execute(
        """
        INSERT INTO widgets (dashboard_id, dataset_id, type, config, position, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """,
        (
            dashboard_id,
            metric_dataset_id,
            "metric",
            json.dumps({"title": "核心数据指标"}),
            json.dumps({"x": 3, "y": 8, "w": 6, "h": 2}),
            datetime.utcnow(),
            datetime.utcnow(),
        ),
    )

    conn.commit()
    conn.close()
    print("Database seeded successfully with Integrated Situational Dashboard.")


if __name__ == "__main__":
    seed()
