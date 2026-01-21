import React, { useState, useEffect } from 'react';

const HealthRecommendations = ({ weightData, runningData }) => {
  const [selectedGoal, setSelectedGoal] = useState('general');
  const [recommendations, setRecommendations] = useState([]);

  // 计算用户数据
  const getUserStats = () => {
    const latestWeight = weightData.length > 0 ? weightData[0].weight : null;
    const weightTrend = weightData.length >= 2 ? 
      weightData[0].weight - weightData[1].weight : 0;
    
    const totalRunning = runningData.reduce((sum, run) => sum + run.distance, 0);
    const avgPace = runningData.length > 0 ? 
      runningData.reduce((sum, run) => sum + parseFloat(run.pace), 0) / runningData.length : 0;
    
    return {
      latestWeight,
      weightTrend,
      totalRunning,
      avgPace,
      runFrequency: runningData.length
    };
  };

  // 生成个性化推荐
  const generateRecommendations = (goal) => {
    const stats = getUserStats();
    let recs = [];

    if (goal === 'weight-loss') {
      recs = [
        {
          title: '🥗 饮食建议',
          content: [
            '控制每日热量摄入，建议比基础代谢少300-500大卡',
            '增加蛋白质摄入，每公斤体重1.2-1.6克',
            '多食用高纤维蔬菜，增加饱腹感',
            '避免高糖、高脂肪的加工食品'
          ]
        },
        {
          title: '🏃 运动计划',
          content: [
            '每周进行3-4次有氧运动，每次30-45分钟',
            '结合2-3次力量训练，增加肌肉量',
            '建议心率保持在最大心率的60-70%',
            '可选择快走、慢跑、游泳等低冲击运动'
          ]
        },
        {
          title: '💧 生活习惯',
          content: [
            '每日饮水2000-2500ml',
            '保证7-8小时充足睡眠',
            '避免熬夜，规律作息',
            '定期监测体重变化'
          ]
        }
      ];
    } else if (goal === 'muscle-gain') {
      recs = [
        {
          title: '💪 饮食建议',
          content: [
            '增加热量摄入，建议比基础代谢多300-500大卡',
            '蛋白质摄入量提高到每公斤体重1.6-2.2克',
            '训练后30分钟内补充蛋白质和碳水化合物',
            '多食用瘦肉、鸡蛋、豆制品等优质蛋白'
          ]
        },
        {
          title: '🏋️ 训练计划',
          content: [
            '每周进行3-4次力量训练',
            '采用渐进式超负荷原则，逐步增加重量',
            '每个肌群每周训练2-3次',
            '保证动作标准，避免受伤'
          ]
        },
        {
          title: '😴 恢复建议',
          content: [
            '训练后充分休息，肌肉需要48-72小时恢复',
            '保证8-9小时睡眠质量',
            '适当进行拉伸和泡沫轴放松',
            '避免过度训练'
          ]
        }
      ];
    } else if (goal === 'endurance') {
      recs = [
        {
          title: '🏃 耐力训练',
          content: [
            '逐步增加跑步距离，每周增幅不超过10%',
            '进行间歇训练，提高速度耐力',
            '每周安排1次长距离慢跑',
            '交叉训练：游泳、骑行等'
          ]
        },
        {
          title: '⚡ 配速策略',
          content: [
            '学习控制配速，避免开始过快',
            '进行负分割训练',
            '练习呼吸节奏，2-2或3-2模式',
            '上下坡技巧练习'
          ]
        },
        {
          title: '🍎 营养补给',
          content: [
            '运动前2小时适量补充碳水化合物',
            '长时间运动中及时补充电解质',
            '运动后30分钟内补充蛋白质和碳水',
            '日常饮食注意铁质和B族维生素摄入'
          ]
        }
      ];
    } else {
      recs = [
        {
          title: '🌟 通用健康建议',
          content: [
            '保持规律作息，早睡早起',
            '均衡饮食，多吃蔬菜水果',
            '适量运动，每周至少150分钟中等强度运动',
            '保持心理健康，学会压力管理'
          ]
        },
        {
          title: '📊 健康监测',
          content: [
            '定期体检，了解身体状况',
            '监测血压、血糖等关键指标',
            '记录运动和饮食，养成健康习惯',
            '设定阶段性健康目标'
          ]
        },
        {
          title: '🧘 身心平衡',
          content: [
            '练习冥想或瑜伽，缓解压力',
            '培养兴趣爱好，保持心情愉悦',
            '与朋友家人保持良好关系',
            '适当户外活动，接触阳光和自然'
          ]
        }
      ];
    }

    // 基于用户数据调整推荐
    if (stats.latestWeight && stats.latestWeight > 70) {
      recs.push({
        title: '⚠️ 特别提醒',
        content: [
          '您的体重较高，建议优先咨询医生',
          '运动强度要从低开始，循序渐进',
          '如有不适，立即停止并就医',
          '建议配合专业营养师指导'
        ]
      });
    }

    if (stats.runFrequency < 2 && stats.runFrequency > 0) {
      recs.push({
        title: '📈 运动频率提升',
        content: [
          '您目前的运动频率较低，建议逐步增加',
          '从每周2次开始，逐步提升到3-4次',
          '每次运动时间可以较短，但要保持规律',
          '找到自己喜欢的运动方式，更容易坚持'
        ]
      });
    }

    return recs;
  };

  useEffect(() => {
    setRecommendations(generateRecommendations(selectedGoal));
  }, [selectedGoal, weightData, runningData]);

  const stats = getUserStats();

  const goals = [
    { id: 'general', label: '综合健康', icon: '🌟' },
    { id: 'weight-loss', label: '减脂瘦身', icon: '🔥' },
    { id: 'muscle-gain', label: '增肌塑形', icon: '💪' },
    { id: 'endurance', label: '提升耐力', icon: '⚡' }
  ];

  return (
    <div className="health-recommendations fade-in">
      {/* 用户状态概览 */}
      <div className="glass-card">
        <h3 style={{ color: 'white', marginBottom: '20px' }}>📊 您的健康状态</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">
              {stats.latestWeight ? `${stats.latestWeight} kg` : '--'}
            </div>
            <div className="stat-label">当前体重</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-value">{stats.totalRunning} km</div>
            <div className="stat-label">累计跑步</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-value">{stats.runFrequency} 次</div>
            <div className="stat-label">跑步次数</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-value">
              {stats.avgPace > 0 ? `${stats.avgPace} min/km` : '--'}
            </div>
            <div className="stat-label">平均配速</div>
          </div>
        </div>
      </div>

      {/* 目标选择 */}
      <div className="glass-card">
        <h3 style={{ color: 'white', marginBottom: '20px' }}>🎯 选择您的健康目标</h3>
        <div className="nav-tabs" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
          {goals.map(goal => (
            <button
              key={goal.id}
              className={`nav-tab ${selectedGoal === goal.id ? 'active' : ''}`}
              onClick={() => setSelectedGoal(goal.id)}
              style={{ margin: '5px' }}
            >
              <span>{goal.icon}</span> {goal.label}
            </button>
          ))}
        </div>
      </div>

      {/* 健康推荐 */}
      <div style={{ marginTop: '30px' }}>
        {recommendations.map((rec, index) => (
          <div key={index} className="glass-card" style={{ marginBottom: '20px' }}>
            <h4 style={{ color: 'white', marginBottom: '15px' }}>{rec.title}</h4>
            <ul style={{ 
              listStyle: 'none', 
              padding: 0, 
              margin: 0,
              color: 'rgba(255,255,255,0.9)'
            }}>
              {rec.content.map((item, itemIndex) => (
                <li 
                  key={itemIndex} 
                  style={{ 
                    marginBottom: '10px',
                    paddingLeft: '20px',
                    position: 'relative'
                  }}
                >
                  <span style={{ 
                    position: 'absolute', 
                    left: 0,
                    color: '#2ecc71'
                  }}>
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* 激励卡片 */}
      <div className="glass-card" style={{ 
        background: 'linear-gradient(135deg, rgba(46, 204, 113, 0.1) 0%, rgba(39, 174, 96, 0.1) 100%)',
        border: '1px solid rgba(46, 204, 113, 0.3)',
        textAlign: 'center'
      }}>
        <h3 style={{ color: '#2ecc71', marginBottom: '15px' }}>💡 今日激励</h3>
        <p style={{ 
          color: 'rgba(255,255,255,0.9)', 
          fontSize: '16px',
          lineHeight: '1.6',
          fontStyle: 'italic'
        }}>
          "健康不是一切，但没有健康就没有一切。坚持运动，合理饮食，每一个小小的进步都在让你成为更好的自己！"
        </p>
      </div>
    </div>
  );
};

export default HealthRecommendations;