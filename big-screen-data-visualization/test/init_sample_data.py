import sqlite3
import json
from datetime import datetime
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def init_sample_data():
    db_path = "situational_dashboard.db"
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    print(f"Initializing full advanced sample data in {db_path}...")

    # 1. 清理旧数据
    tables = ["users", "datasources", "datasets", "dashboards", "widgets"]
    for table in tables:
        try:
            cursor.execute(f"DELETE FROM {table}")
        except sqlite3.OperationalError:
            pass

    # 2. 创建用户
    users = [
        (
            "admin",
            "admin@example.com",
            pwd_context.hash("admin_password"),
            "系统管理员",
            1,
            1,
        ),
    ]
    cursor.executemany(
        "INSERT INTO users (username, email, hashed_password, full_name, is_active, is_admin, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
            (u[0], u[1], u[2], u[3], u[4], u[5], datetime.utcnow(), datetime.utcnow())
            for u in users
        ],
    )

    # 3. 创建通用数据源
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

    # 4. 定义数据集
    dataset_configs = [
        # 销售
        (
            "全国销售分布",
            {"type": "echarts_map", "query": "SELECT name, value FROM sales"},
        ),
        (
            "地区业绩联动",
            {
                "type": "chart",
                "query": "SELECT month as label, value FROM sales_trend WHERE region=:region",
            },
        ),
        # 城市
        (
            "各区GDP走势",
            {
                "type": "chart",
                "query": "SELECT month as label, gdp as value FROM gdp_stats WHERE region=:region",
            },
        ),
        (
            "各区人口增长",
            {
                "type": "chart",
                "query": "SELECT month as label, pop as value FROM pop_stats WHERE region=:region",
            },
        ),
        (
            "各区平均工资",
            {
                "type": "chart",
                "query": "SELECT month as label, salary as value FROM salary_stats WHERE region=:region",
            },
        ),
        (
            "GDP排行",
            {
                "type": "chart",
                "query": "SELECT region as label, gdp as value FROM gdp_rank",
            },
        ),
        # 工厂
        (
            "生产线效能",
            {
                "type": "chart",
                "query": "SELECT month as label, eff as value FROM factory_stats WHERE line=:region",
            },
        ),
        (
            "安全风险统计",
            {
                "type": "chart",
                "query": "SELECT type as label, count as value FROM safety_stats WHERE line=:region",
            },
        ),
        (
            "实时产出",
            {
                "type": "metric",
                "query": "SELECT amount as value FROM output_stats WHERE line=:region",
            },
        ),
        (
            "异常日志",
            {"type": "table", "query": "SELECT * FROM factory_logs WHERE line=:region"},
        ),
        # 基础通用
        (
            "天气趋势",
            {
                "type": "chart",
                "query": "SELECT time as label, temp as value FROM weather",
            },
        ),
        (
            "资源占用",
            {"type": "metric", "query": "SELECT usage as value FROM system_resources"},
        ),
    ]

    dataset_ids = {}
    for name, conf in dataset_configs:
        cursor.execute(
            "INSERT INTO datasets (name, datasource_id, query_config, refresh_interval, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (
                name,
                source_id,
                json.dumps(conf),
                30,
                f"{name} 数据",
                datetime.utcnow(),
                datetime.utcnow(),
            ),
        )
        dataset_ids[name] = cursor.lastrowid

    # 5. 创建 5 个大屏
    dashboards = [
        (
            "销售指挥中心",
            [
                # 中心地图
                {
                    "type": "echarts_map",
                    "ds": dataset_ids["全国销售分布"],
                    "pos": {"x": 3, "y": 0, "w": 6, "h": 12},
                    "conf": {"title": "全国销售分布 (点击省份联动)"},
                },
                # 左侧 3个面板
                {
                    "type": "metric",
                    "ds": dataset_ids["实时产出"],
                    "pos": {"x": 0, "y": 0, "w": 3, "h": 4},
                    "conf": {"title": "实时销售额", "suffix": "元"},
                },
                {
                    "type": "chart",
                    "ds": dataset_ids["地区业绩联动"],
                    "pos": {"x": 0, "y": 4, "w": 3, "h": 4},
                    "conf": {"title": "近半年销售趋势", "type": "line"},
                },
                {
                    "type": "chart",
                    "ds": dataset_ids["地区业绩联动"],
                    "pos": {"x": 0, "y": 8, "w": 3, "h": 4},
                    "conf": {"title": "近半年销售产品趋势", "type": "line"},
                },
                # 右侧 3个面板
                {
                    "type": "chart",
                    "ds": dataset_ids["地区业绩联动"],
                    "pos": {"x": 9, "y": 0, "w": 3, "h": 4},
                    "conf": {"title": "近半年Top 10产品", "type": "bar"},
                },
                {
                    "type": "chart",
                    "ds": dataset_ids["地区业绩联动"],
                    "pos": {"x": 9, "y": 4, "w": 3, "h": 4},
                    "conf": {"title": "区域销售占比", "type": "pie"},
                },
                {
                    "type": "table",
                    "ds": dataset_ids["地区业绩联动"],
                    "pos": {"x": 9, "y": 8, "w": 3, "h": 4},
                    "conf": {"title": "最新订单动态"},
                },
            ],
        ),
        (
            "智慧城市运行态势监测",
            [
                {
                    "type": "three_city",
                    "ds": None,
                    "pos": {"x": 3, "y": 0, "w": 6, "h": 12},
                    "conf": {"title": "北京市 3D 实景孪生 (点击区域联动)"},
                },
                {
                    "type": "chart",
                    "ds": dataset_ids["各区GDP走势"],
                    "pos": {"x": 0, "y": 0, "w": 3, "h": 4},
                    "conf": {"title": "各区GDP近半年走势", "type": "line"},
                },
                {
                    "type": "chart",
                    "ds": dataset_ids["各区人口增长"],
                    "pos": {"x": 0, "y": 4, "w": 3, "h": 4},
                    "conf": {"title": "各区人口增长情况", "type": "bar"},
                },
                {
                    "type": "chart",
                    "ds": dataset_ids["各区平均工资"],
                    "pos": {"x": 0, "y": 8, "w": 3, "h": 4},
                    "conf": {"title": "各区平均工资情况", "type": "line"},
                },
                {
                    "type": "chart",
                    "ds": dataset_ids["GDP排行"],
                    "pos": {"x": 9, "y": 0, "w": 3, "h": 4},
                    "conf": {"title": "GDP排行 Top 10", "type": "bar"},
                },
                {
                    "type": "chart",
                    "ds": dataset_ids["各区人口增长"],
                    "pos": {"x": 9, "y": 4, "w": 3, "h": 4},
                    "conf": {"title": "人口增长 Top 10", "type": "bar"},
                },
                {
                    "type": "chart",
                    "ds": dataset_ids["各区平均工资"],
                    "pos": {"x": 9, "y": 8, "w": 3, "h": 4},
                    "conf": {"title": "平均工资 Top 10", "type": "bar"},
                },
            ],
        ),
        (
            "工厂生产线安全与效能概览",
            [
                {
                    "type": "three_factory",
                    "ds": None,
                    "pos": {"x": 3, "y": 0, "w": 6, "h": 9},
                    "conf": {"title": "生产线 3D 实景 (点击流水线联动)"},
                },
                {
                    "type": "chart",
                    "ds": dataset_ids["生产线效能"],
                    "pos": {"x": 0, "y": 0, "w": 3, "h": 4},
                    "conf": {"title": "各时段生产效能", "type": "line"},
                },
                {
                    "type": "chart",
                    "ds": dataset_ids["安全风险统计"],
                    "pos": {"x": 0, "y": 4, "w": 3, "h": 5},
                    "conf": {"title": "安全风险因素分析", "type": "pie"},
                },
                {
                    "type": "chart",
                    "ds": dataset_ids["生产线效能"],
                    "pos": {"x": 9, "y": 0, "w": 3, "h": 4},
                    "conf": {"title": "设备稼动率趋势", "type": "bar"},
                },
                {
                    "type": "chart",
                    "ds": dataset_ids["安全风险统计"],
                    "pos": {"x": 9, "y": 4, "w": 3, "h": 5},
                    "conf": {"title": "近半年隐患分布", "type": "pie"},
                },
                {
                    "type": "metric",
                    "ds": dataset_ids["实时产出"],
                    "pos": {"x": 3, "y": 9, "w": 3, "h": 3},
                    "conf": {"title": "今日累计产量"},
                },
                {
                    "type": "table",
                    "ds": dataset_ids["异常日志"],
                    "pos": {"x": 6, "y": 9, "w": 6, "h": 3},
                    "conf": {"title": "实时生产异常日志"},
                },
            ],
        ),
        (
            "网络流量监控",
            [
                {
                    "type": "chart",
                    "ds": dataset_ids["天气趋势"],
                    "pos": {"x": 0, "y": 0, "w": 12, "h": 6},
                    "conf": {"title": "骨干网流量实时监控", "type": "line"},
                },
                {
                    "type": "metric",
                    "ds": dataset_ids["资源占用"],
                    "pos": {"x": 0, "y": 6, "w": 6, "h": 6},
                    "conf": {"title": "DDoS防护状态"},
                },
                {
                    "type": "table",
                    "ds": dataset_ids["异常日志"],
                    "pos": {"x": 6, "y": 6, "w": 6, "h": 6},
                    "conf": {"title": "攻击日志详情"},
                },
            ],
        ),
        (
            "能源能耗分析",
            [
                {
                    "type": "chart",
                    "ds": dataset_ids["天气趋势"],
                    "pos": {"x": 0, "y": 0, "w": 12, "h": 6},
                    "conf": {"title": "园区能耗趋势", "type": "bar"},
                },
                {
                    "type": "metric",
                    "ds": dataset_ids["资源占用"],
                    "pos": {"x": 0, "y": 6, "w": 12, "h": 6},
                    "conf": {"title": "碳排放实时指标"},
                },
            ],
        ),
    ]

    for name, widgets in dashboards:
        cursor.execute(
            "INSERT INTO dashboards (name, title, layout_config, is_public, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
            (name, name, json.dumps({}), 1, datetime.utcnow(), datetime.utcnow()),
        )
        db_id = cursor.lastrowid
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
    print(
        "Full Advanced Sample Data (Factory + City + Sales + Others) restored and initialized successfully."
    )


if __name__ == "__main__":
    init_sample_data()
