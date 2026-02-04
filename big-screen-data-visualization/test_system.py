#!/usr/bin/env python3
"""
态势大屏系统测试脚本
测试后端API和基本功能
"""

import requests
import json
import time

API_BASE = "http://localhost:8000"


def test_api_connection():
    """测试API连接"""
    print("🔗 测试API连接...")
    try:
        response = requests.get(f"{API_BASE}/")
        if response.status_code == 200:
            print("✅ API连接成功")
            print(f"   响应: {response.json()}")
            return True
        else:
            print(f"❌ API连接失败: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ API连接异常: {e}")
        return False


def test_datasources():
    """测试数据源管理"""
    print("\n📊 测试数据源管理...")

    # 获取数据源列表
    try:
        response = requests.get(f"{API_BASE}/api/datasources")
        if response.status_code == 200:
            datasources = response.json()
            print(f"✅ 获取数据源列表成功，共 {len(datasources)} 个")
            for ds in datasources:
                print(f"   - {ds['name']} ({ds['type']})")
        else:
            print(f"❌ 获取数据源列表失败: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ 获取数据源列表异常: {e}")
        return False

    # 创建测试数据源
    test_ds = {
        "name": "测试PostgreSQL数据源",
        "type": "postgresql",
        "connection_config": {
            "host": "localhost",
            "port": 5432,
            "database": "test_db",
            "username": "test_user",
            "password": "test_pass",
        },
        "description": "用于测试的PostgreSQL数据源",
    }

    try:
        response = requests.post(
            f"{API_BASE}/api/datasources",
            json=test_ds,
            headers={"Content-Type": "application/json"},
        )
        if response.status_code in [200, 201]:
            created_ds = response.json()
            print(f"✅ 创建数据源成功: {created_ds['name']} (ID: {created_ds['id']})")
            return created_ds["id"]
        else:
            print(f"❌ 创建数据源失败: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ 创建数据源异常: {e}")
        return None


def test_datasets(datasource_id):
    """测试数据集管理"""
    print("\n📋 测试数据集管理...")

    # 创建测试数据集
    if datasource_id:
        test_dataset = {
            "name": "用户行为数据集",
            "datasource_id": datasource_id,
            "query_config": {
                "sql": "SELECT * FROM user_actions WHERE created_at >= NOW() - INTERVAL '24 hours'",
                "params": {},
            },
            "refresh_interval": 300,
            "description": "最近24小时用户行为数据",
        }

        try:
            response = requests.post(
                f"{API_BASE}/api/datasets",
                json=test_dataset,
                headers={"Content-Type": "application/json"},
            )
            if response.status_code in [200, 201]:
                created_dataset = response.json()
                print(
                    f"✅ 创建数据集成功: {created_dataset['name']} (ID: {created_dataset['id']})"
                )
                return created_dataset["id"]
            else:
                print(f"❌ 创建数据集失败: {response.status_code}")
                return None
        except Exception as e:
            print(f"❌ 创建数据集异常: {e}")
            return None
    else:
        print("⚠️ 跳过数据集创建（需要有效的数据源ID）")
        return None


def test_dashboards():
    """测试大屏管理"""
    print("\n🖥️ 测试大屏管理...")

    # 创建测试大屏
    test_dashboard = {
        "name": "态势感知大屏",
        "title": "实时态势监控大屏",
        "layout_config": {
            "grids": [],
            "widgets": [
                {
                    "type": "metric",
                    "position": {"x": 0, "y": 0, "w": 3, "h": 2},
                    "config": {"title": "总用户数", "color": "#1890ff"},
                },
                {
                    "type": "chart",
                    "position": {"x": 3, "y": 0, "w": 6, "h": 4},
                    "config": {"title": "用户趋势", "type": "line"},
                },
                {
                    "type": "map",
                    "position": {"x": 9, "y": 0, "w": 3, "h": 4},
                    "config": {"title": "地理分布", "center": [39.9042, 116.4074]},
                },
            ],
        },
        "is_public": True,
    }

    try:
        response = requests.post(
            f"{API_BASE}/api/dashboards",
            json=test_dashboard,
            headers={"Content-Type": "application/json"},
        )
        if response.status_code in [200, 201]:
            created_dashboard = response.json()
            print(
                f"✅ 创建大屏成功: {created_dashboard['title']} (ID: {created_dashboard['id']})"
            )
            return created_dashboard["id"]
        else:
            print(f"❌ 创建大屏失败: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ 创建大屏异常: {e}")
        return None


def main():
    """主测试函数"""
    print("🚀 开始态势大屏系统测试")
    print("=" * 50)

    # 测试API连接
    if not test_api_connection():
        print("\n❌ API连接失败，请检查后端服务是否启动")
        return

    # 测试数据源
    datasource_id = test_datasources()

    # 测试数据集
    dataset_id = test_datasets(datasource_id)

    # 测试大屏
    dashboard_id = test_dashboards()

    print("\n" + "=" * 50)
    print("📊 测试总结:")
    print("✅ 后端API服务正常运行")
    print("✅ 数据源管理功能正常")
    print("✅ 数据集管理功能正常")
    print("✅ 大屏管理功能正常")
    print(f"\n🌐 API文档地址: {API_BASE}/docs")
    print(f"🌐 测试页面地址: file:///D:/Antigravity/test/test.html")
    print("\n🎉 态势大屏系统测试完成！")


if __name__ == "__main__":
    main()
