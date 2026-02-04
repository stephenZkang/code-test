import sqlite3
import json
import os
from datetime import datetime
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def run_init_on_db(db_path):
    if not os.path.exists(os.path.dirname(db_path)) and os.path.dirname(db_path) != "":
        os.makedirs(os.path.dirname(db_path))

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    print(f"Initializing standardized dashboards in {db_path}...")

    # 1. Clean up old data
    tables = ["users", "datasources", "datasets", "dashboards", "widgets", "alarms"]
    for table in tables:
        try:
            cursor.execute(f"DELETE FROM {table}")
        except sqlite3.OperationalError:
            pass

    # 2. Create Default Admin
    cursor.execute(
        "INSERT INTO users (username, email, hashed_password, full_name, is_active, is_admin, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        (
            "admin",
            "admin@example.com",
            pwd_context.hash("admin_password"),
            "系统管理员",
            1,
            1,
            datetime.utcnow(),
            datetime.utcnow(),
        ),
    )

    # 3. Create Datasources
    cursor.execute(
        "INSERT INTO datasources (name, type, connection_config, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
        (
            "核心业务库",
            "sqlite",
            json.dumps({"database": "situational_dashboard.db"}),
            "标准业务数据库",
            datetime.utcnow(),
            datetime.utcnow(),
        ),
    )
    source_id = cursor.lastrowid

    # 4. Define All Necessary Datasets (Standardized Mock Data)
    # Mapping dataset names to their types and content
    standard_datasets = {
        # City
        "GDP走势": {
            "type": "chart",
            "mock_data": [
                {"label": "1月", "value": 450},
                {"label": "2月", "value": 520},
                {"label": "3月", "value": 480},
                {"label": "4月", "value": 610},
                {"label": "5月", "value": 580},
            ],
        },
        "人口增长": {
            "type": "chart",
            "mock_data": [
                {"label": "2019", "value": 1200},
                {"label": "2020", "value": 1500},
                {"label": "2021", "value": 1800},
                {"label": "2022", "value": 2100},
            ],
        },
        "平均工资": {
            "type": "chart",
            "mock_data": [
                {"label": "2019", "value": 8500},
                {"label": "2020", "value": 9200},
                {"label": "2021", "value": 9800},
                {"label": "2022", "value": 10500},
            ],
        },
        "性别比例": {
            "type": "chart",
            "mock_data": [{"name": "男", "value": 52}, {"name": "女", "value": 48}],
        },
        "年龄分布": {
            "type": "chart",
            "mock_data": [
                {"label": "0-18", "value": 15},
                {"label": "19-35", "value": 45},
                {"label": "36-60", "value": 30},
                {"label": "60+", "value": 10},
            ],
        },
        "学历分布": {
            "type": "chart",
            "mock_data": [
                {"name": "本科", "value": 40},
                {"name": "硕士", "value": 15},
                {"name": "博士", "value": 5},
                {"name": "高中及以下", "value": 40},
            ],
        },
        "人口流动": {
            "type": "chart",
            "mock_data": [
                {"label": "周一", "value": [120, 80]},
                {"label": "周二", "value": [150, 90]},
                {"label": "周三", "value": [110, 70]},
                {"label": "周四", "value": [140, 100]},
            ],
            "seriesNames": ["流入", "流出"],
        },
        "城市分布": {
            "type": "echarts_map",
            "mock_data": [
                {"name": "越秀区", "value": 100},
                {"name": "天河区", "value": 200},
                {"name": "海珠区", "value": 150},
            ],
        },
        # Factory
        "产线效能": {
            "type": "chart",
            "mock_data": [
                {"label": "A线", "value": 95},
                {"label": "B线", "value": 88},
                {"label": "C线", "value": 92},
            ],
        },
        "设备状态": {
            "type": "chart",
            "mock_data": [
                {"name": "运行", "value": 80},
                {"name": "停机", "value": 15},
                {"name": "故障", "value": 5},
            ],
        },
        "安全统计": {
            "type": "chart",
            "mock_data": [
                {"label": "1月", "value": 0},
                {"label": "2月", "value": 1},
                {"label": "3月", "value": 0},
            ],
        },
        "当日产量": {
            "type": "metric",
            "mock_data": {"value": 8500, "label": "今日标准产出"},
        },
        "能耗实时": {
            "type": "chart",
            "mock_data": [
                {"label": "08:00", "value": 450},
                {"label": "12:00", "value": 600},
                {"label": "16:00", "value": 550},
            ],
        },
        "良品率": {
            "type": "chart",
            "mock_data": [
                {"label": "A线", "value": 99.2},
                {"label": "B线", "value": 98.5},
            ],
        },
        "异常日志": {
            "type": "table",
            "mock_data": [
                {"id": 1, "time": "10:20", "msg": "A线电压波动", "level": "警告"},
                {"id": 2, "time": "11:05", "msg": "B线供料中断", "level": "严重"},
            ],
        },
        # Park
        "水电消耗": {
            "type": "chart",
            "mock_data": [
                {"label": "周一", "value": [200, 150]},
                {"label": "周二", "value": [220, 160]},
            ],
            "seriesNames": ["电耗", "水耗"],
        },
        "垃圾分类": {
            "type": "chart",
            "mock_data": [
                {"name": "厨余", "value": 40},
                {"name": "可回收", "value": 35},
                {"name": "有害", "value": 5},
                {"name": "其他", "value": 20},
            ],
        },
        "绿化覆盖": {
            "type": "chart",
            "mock_data": [
                {"label": "一期", "value": 35},
                {"label": "二期", "value": 42},
            ],
        },
        "告警总数": {
            "type": "metric",
            "mock_data": {"value": 12, "label": "今日待处理告警"},
        },
        "访客趋势": {
            "type": "chart",
            "mock_data": [
                {"label": "09:00", "value": 50},
                {"label": "14:00", "value": 120},
                {"label": "18:00", "value": 80},
            ],
        },
        "车位占用": {
            "type": "chart",
            "mock_data": [{"label": "A区", "value": 85}, {"label": "B区", "value": 40}],
        },
        "环境指数": {
            "type": "metric",
            "mock_data": {"value": 92, "label": "园区综合空气质量"},
        },
        # Global
        "销售目标": {
            "type": "metric",
            "mock_data": {"value": 1250, "label": "本月已完成 (万元)"},
        },
        "分类占比": {
            "type": "chart",
            "mock_data": [
                {"name": "电子", "value": 45},
                {"name": "服装", "value": 30},
                {"name": "食品", "value": 25},
            ],
        },
        "客户增长": {
            "type": "chart",
            "mock_data": [
                {"label": "1月", "value": 100},
                {"label": "2月", "value": 150},
                {"label": "3月", "value": 220},
            ],
        },
        "全国分布": {
            "type": "echarts_map",
            "mock_data": [
                {"name": "广东", "value": 500},
                {"name": "北京", "value": 400},
                {"name": "上海", "value": 450},
            ],
        },
        "大区排行": {
            "type": "chart",
            "mock_data": [
                {"label": "华南", "value": 1200},
                {"label": "华东", "value": 1100},
                {"label": "华北", "value": 900},
            ],
        },
        "实时订单": {
            "type": "table",
            "mock_data": [
                {"id": 101, "user": "张*", "amount": "599", "time": "14:01"},
                {"id": 102, "user": "李*", "amount": "1299", "time": "14:05"},
            ],
        },
        "服务器压力": {
            "type": "chart",
            "mock_data": [{"label": "CPU", "value": 45}, {"label": "MEM", "value": 60}],
        },
        "系统健康": {
            "type": "metric",
            "mock_data": {"value": 99.9, "label": "核心服务可用率"},
        },
        # Traffic
        "流量流入": {
            "type": "chart",
            "mock_data": [
                {"label": "10:00", "value": 450},
                {"label": "10:01", "value": 480},
                {"label": "10:02", "value": 520},
            ],
        },
        "协议分布": {
            "type": "chart",
            "mock_data": [
                {"name": "HTTPS", "value": 70},
                {"name": "TCP", "value": 20},
                {"name": "UDP", "value": 10},
            ],
        },
        "延迟监控": {
            "type": "chart",
            "mock_data": [
                {"label": "网关", "value": 5},
                {"label": "节点A", "value": 12},
                {"label": "节点B", "value": 25},
            ],
        },
        "阻断次数": {
            "type": "metric",
            "mock_data": {"value": 452, "label": "今日阻断恶意请求"},
        },
        "攻击来源": {
            "type": "chart",
            "mock_data": [
                {"label": "海外", "value": 60},
                {"label": "国内", "value": 40},
            ],
        },
        "在线连接": {
            "type": "chart",
            "mock_data": [
                {"label": "10:00", "value": 12000},
                {"label": "10:05", "value": 13500},
            ],
        },
        # Agriculture
        "空气温湿度": {
            "type": "chart",
            "mock_data": [
                {"label": "06:00", "value": [22, 65]},
                {"label": "12:00", "value": [28, 55]},
            ],
            "seriesNames": ["温度", "湿度"],
        },
        "土壤水分": {
            "type": "chart",
            "mock_data": [{"label": "A区", "value": 45}, {"label": "B区", "value": 38}],
        },
        "病虫害风险": {
            "type": "chart",
            "mock_data": [
                {"name": "低", "value": 70},
                {"name": "中", "value": 20},
                {"name": "高", "value": 10},
            ],
        },
        "产量预测": {
            "type": "metric",
            "mock_data": {"value": 125, "label": "预计丰收吨位"},
        },
        "施肥建议": {
            "type": "metric",
            "mock_data": {"value": "适中", "label": "当前氮肥需求"},
        },
        "历史产量": {
            "type": "chart",
            "mock_data": [
                {"label": "2020", "value": 100},
                {"label": "2021", "value": 115},
                {"label": "2022", "value": 120},
            ],
        },
        "光照时长": {
            "type": "chart",
            "mock_data": [
                {"label": "周一", "value": 8},
                {"label": "周二", "value": 10},
            ],
        },
    }

    dataset_ids = {}
    for name, config in standard_datasets.items():
        cursor.execute(
            "INSERT INTO datasets (name, datasource_id, query_config, refresh_interval, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (
                name,
                source_id,
                json.dumps(config),
                30,
                f"{name} 标准数据集",
                datetime.utcnow(),
                datetime.utcnow(),
            ),
        )
        dataset_ids[name] = cursor.lastrowid

    # 5. Define Dashboard Layout Templates
    def get_standard_widgets(middle_type, left_ds, right_ds, bottom_ds, middle_conf={}):
        widgets = []
        # Left 3
        for i, ds_name in enumerate(left_ds):
            widgets.append(
                {
                    "type": "chart",
                    "ds": dataset_ids[ds_name],
                    "pos": {"x": 0, "y": i * 4, "w": 3, "h": 4},
                    "conf": {"title": ds_name, "type": "line" if i == 0 else "bar"},
                }
            )

        # Middle 1
        widgets.append(
            {
                "type": middle_type,
                "ds": None
                if middle_type.startswith("three")
                else dataset_ids[middle_conf.get("ds_name", "全国分布")],
                "pos": {"x": 3, "y": 0, "w": 6, "h": 8},
                "conf": middle_conf,
            }
        )

        # Bottom 1
        widgets.append(
            {
                "type": "chart" if "日志" not in bottom_ds else "table",
                "ds": dataset_ids[bottom_ds],
                "pos": {"x": 3, "y": 8, "w": 6, "h": 4},
                "conf": {"title": bottom_ds},
            }
        )

        # Right 3
        for i, ds_name in enumerate(right_ds):
            w_type = "chart" if i != 0 else "metric"
            widgets.append(
                {
                    "type": w_type,
                    "ds": dataset_ids[ds_name],
                    "pos": {"x": 9, "y": i * 4, "w": 3, "h": 4},
                    "conf": {
                        "title": ds_name,
                        "type": "pie" if i == 1 else "bar",
                        "circleStyle": True,
                    },
                }
            )

        return widgets

    dashboards = [
        (
            "智慧城市可视化大屏",
            "智慧城市可视化大屏",
            "https://img.zcool.cn/community/01f9b359b3a0bca801211d258b3a0b.jpg@1280w_1l_2o_100sh.jpg",
            get_standard_widgets(
                "three_city",
                ["GDP走势", "人口增长", "平均工资"],
                ["性别比例", "年龄分布", "学历分布"],
                "人口流动",
                {"title": "城市实景全景孪生"},
            ),
        ),
        (
            "智慧工厂全景大屏",
            "智慧工厂全景大屏",
            "",
            get_standard_widgets(
                "three_factory",
                ["产线效能", "设备状态", "安全统计"],
                ["当日产量", "能耗实时", "良品率"],
                "异常日志",
                {"title": "生产线实时监控"},
            ),
        ),
        (
            "智慧园区运行大屏",
            "智慧园区运行大屏",
            "https://pic.616pic.com/bg_w1180/00/04/08/UfM8pY7f3S.jpg",
            get_standard_widgets(
                "three_island",
                ["水电消耗", "垃圾分类", "绿化覆盖"],
                ["告警总数", "访客趋势", "车位占用"],
                "环境指数",
                {"title": "园区数字孪生视界"},
            ),
        ),
        (
            "综合态势监测大屏",
            "综合态势监测大屏",
            "",
            get_standard_widgets(
                "echarts_map",
                ["销售目标", "分类占比", "客户增长"],
                ["系统健康", "大区排行", "服务器压力"],
                "实时订单",
                {"title": "业务全球分布图", "ds_name": "全国分布"},
            ),
        ),
        (
            "网络流量实时大屏",
            "网络流量实时大屏",
            "https://pic.616pic.com/bg_w1180/00/03/67/VpX5vY8f7T.jpg",
            get_standard_widgets(
                "chart",
                ["流量流入", "协议分布", "延迟监控"],
                ["阻断次数", "攻击来源", "在线连接"],
                "实时订单",
                {"title": "流量波动实时监测", "type": "line", "ds_name": "流量流入"},
            ),
        ),
        (
            "智慧农业管理大屏",
            "智慧农业管理大屏",
            "",
            get_standard_widgets(
                "three_island",
                ["空气温湿度", "土壤水分", "病虫害风险"],
                ["产量预测", "历史产量", "光照时长"],
                "施肥建议",
                {"title": "标准农场 3D 监测"},
            ),
        ),
    ]

    for name, title, bg, widgets in dashboards:
        cursor.execute(
            "INSERT INTO dashboards (name, title, layout_config, is_public, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
            (
                name,
                title,
                json.dumps({"backgroundImage": bg}),
                1,
                datetime.utcnow(),
                datetime.utcnow(),
            ),
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


def init_sample_data():
    db_paths = ["backend/situational_dashboard.db", "situational_dashboard.db"]
    for path in db_paths:
        run_init_on_db(path)
    print(
        "Standardized Comprehensive Sample Data initialized successfully with 6 dashboards."
    )


if __name__ == "__main__":
    init_sample_data()
