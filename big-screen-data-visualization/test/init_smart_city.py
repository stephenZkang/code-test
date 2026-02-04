import sqlite3
import json
from datetime import datetime


def init_smart_city_data():
    db_path = "situational_dashboard.db"
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    print(f"Initializing Smart City Dashboard in {db_path}...")

    # 1. Clean up old Smart City data
    cursor.execute("SELECT id FROM dashboards WHERE name='智慧城市可视化大屏'")
    old_db = cursor.fetchone()
    if old_db:
        cursor.execute("DELETE FROM widgets WHERE dashboard_id=?", (old_db[0],))
        cursor.execute("DELETE FROM dashboards WHERE id=?", (old_db[0],))

    # 2. Get Datasource ID
    row = cursor.fetchone()
    if row:
        source_id = row[0]
    else:
        cursor.execute(
            "INSERT INTO datasources (name, type, connection_config, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
            (
                "统一数据中心",
                "sqlite",
                json.dumps({"database": "situational_dashboard.db"}),
                "全业务实时库",
                datetime.utcnow(),
                datetime.utcnow(),
            ),
        )
        source_id = cursor.lastrowid

    # 2. Define Datasets for Smart City
    datasets = [
        {
            "name": "城市人口地域分布",
            "type": "echarts_map",
            "mock_data": [
                {"name": "越秀区", "value": 115},
                {"name": "海珠区", "value": 181},
                {"name": "荔湾区", "value": 123},
                {"name": "天河区", "value": 224},
                {"name": "白云区", "value": 374},
                {"name": "黄埔区", "value": 126},
                {"name": "番禺区", "value": 265},
                {"name": "花都区", "value": 110},
                {"name": "南沙区", "value": 84},
                {"name": "从化区", "value": 73},
                {"name": "增城区", "value": 146},
            ],
        },
        {
            "name": "人口流入流出",
            "type": "chart",
            "mock_data": [
                {"label": "2018年", "value": [35, 15]},
                {"label": "2019年", "value": [38, 18]},
                {"label": "2020年", "value": [42, 20]},
                {"label": "2021年", "value": [48, 22]},
                {"label": "2022年", "value": [45, 25]},
                {"label": "2023年", "value": [50, 28]},
            ],
        },
        {
            "name": "城市人口性别分布",
            "type": "chart",
            "mock_data": [
                {"name": "男性比例", "value": 62.22},
                {"name": "女性比例", "value": 37.78},
            ],
        },
        {
            "name": "城市人口年龄分布",
            "type": "chart",
            "mock_data": [
                {"label": "0-18", "value": 35822},
                {"label": "19-24", "value": 65321},
                {"label": "25-34", "value": 192344},
                {"label": "35-44", "value": 234567},
                {"label": "45-54", "value": 101234},
                {"label": "55-64", "value": 38762},
                {"label": "65以上", "value": 13566},
            ],
        },
        {
            "name": "人口增长趋势",
            "type": "chart",
            "mock_data": [
                {"label": "2018年", "value": 1200},
                {"label": "2019年", "value": 2500},
                {"label": "2020年", "value": 4800},
                {"label": "2021年", "value": 3500},
                {"label": "2022年", "value": 2800},
            ],
        },
        {
            "name": "出生和死亡情况-出生",
            "type": "metric",
            "mock_data": {"value": 28800, "label": "2023年 新生婴儿数"},
        },
        {
            "name": "出生和死亡情况-死亡",
            "type": "metric",
            "mock_data": {"value": 12345, "label": "2023年 死亡人口数"},
        },
        {
            "name": "人口学历",
            "type": "chart",
            "mock_data": [
                {"name": "本科", "value": 35},
                {"name": "硕士", "value": 15},
                {"name": "博士", "value": 5},
                {"name": "高中", "value": 25},
                {"name": "职中", "value": 10},
                {"name": "其他", "value": 10},
            ],
        },
    ]

    dataset_ids = {}
    for ds in datasets:
        cursor.execute(
            "INSERT INTO datasets (name, datasource_id, query_config, refresh_interval, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (
                ds["name"],
                source_id,
                json.dumps({"type": ds["type"], "mock_data": ds["mock_data"]}),
                60,
                f"{ds['name']} 数据",
                datetime.utcnow(),
                datetime.utcnow(),
            ),
        )
        dataset_ids[ds["name"]] = cursor.lastrowid

    # 3. Create Dashboard
    dashboard_name = "智慧城市可视化大屏"
    layout_config = {
        "backgroundImage": "https://img.zcool.cn/community/01f9b359b3a0bca801211d258b3a0b.jpg@1280w_1l_2o_100sh.jpg"  # Example city night background
    }
    cursor.execute(
        "INSERT INTO dashboards (name, title, layout_config, is_public, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
        (
            dashboard_name,
            dashboard_name,
            json.dumps(layout_config),
            1,
            datetime.utcnow(),
            datetime.utcnow(),
        ),
    )
    db_id = cursor.lastrowid

    # 4. Add Widgets
    widgets = [
        {
            "type": "echarts_map",
            "ds": dataset_ids["城市人口地域分布"],
            "pos": {"x": 0, "y": 0, "w": 3, "h": 7},
            "conf": {"title": "城市人口地域分布"},
        },
        {
            "type": "chart",
            "ds": dataset_ids["人口流入流出"],
            "pos": {"x": 0, "y": 7, "w": 3, "h": 5},
            "conf": {
                "title": "人口流入流出",
                "type": "bar",
                "seriesNames": ["流入量", "流出量"],
                "colors": ["#1890ff", "#52c41a"],
            },
        },
        {
            "type": "chart",
            "ds": dataset_ids["城市人口性别分布"],
            "pos": {"x": 9, "y": 0, "w": 3, "h": 4},
            "conf": {"title": "城市人口性别分布", "type": "pie", "donut": True},
        },
        {
            "type": "chart",
            "ds": dataset_ids["城市人口年龄分布"],
            "pos": {"x": 9, "y": 4, "w": 3, "h": 4},
            "conf": {"title": "城市人口年龄分布", "type": "bar", "color": "#1890ff"},
        },
        {
            "type": "chart",
            "ds": dataset_ids["人口增长趋势"],
            "pos": {"x": 9, "y": 8, "w": 3, "h": 4},
            "conf": {"title": "人口增长趋势", "type": "line", "color": "#fa8c16"},
        },
        {
            "type": "metric",
            "ds": dataset_ids["出生和死亡情况-出生"],
            "pos": {"x": 3, "y": 8, "w": 1.5, "h": 4},
            "conf": {"title": "出生情况", "circleStyle": True, "valueColor": "#00d2ff"},
        },
        {
            "type": "metric",
            "ds": dataset_ids["出生和死亡情况-死亡"],
            "pos": {"x": 4.5, "y": 8, "w": 1.5, "h": 4},
            "conf": {"title": "死亡情况", "circleStyle": True, "valueColor": "#1890ff"},
        },
        {
            "type": "metric",
            "ds": dataset_ids["出生和死亡情况-死亡"],
            "pos": {"x": 4.5, "y": 8, "w": 1.5, "h": 4},
            "conf": {"title": "死亡情况", "suffix": "人"},
        },
        {
            "type": "chart",
            "ds": dataset_ids["人口学历"],
            "pos": {"x": 6, "y": 8, "w": 3, "h": 4},
            "conf": {"title": "人口学历", "type": "pie"},
        },
        {
            "type": "three_city",
            "ds": None,
            "pos": {"x": 3, "y": 0, "w": 6, "h": 8},
            "conf": {"title": "城市实景全景"},
        },
    ]

    for w in widgets:
        cursor.execute(
            "INSERT INTO widgets (dashboard_id, dataset_id, type, config, position, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (
                db_id,
                w["ds"],
                w["type"],
                json.dumps(w["conf"]),
                json.dumps(w["pos"]),
                datetime.utcnow(),
                datetime.utcnow(),
            ),
        )

    conn.commit()
    conn.close()
    print("Smart City Dashboard initialized successfully.")


if __name__ == "__main__":
    init_smart_city_data()
