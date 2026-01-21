import React, { useState } from 'react';

const WeightManager = ({ weightData, setWeightData }) => {
  const [weight, setWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [height, setHeight] = useState('');

  const addWeightRecord = () => {
    if (!weight) return;
    
    const newRecord = {
      id: Date.now(),
      weight: parseFloat(weight),
      date: new Date().toLocaleDateString('zh-CN')
    };
    
    setWeightData([newRecord, ...weightData]);
    setWeight('');
  };

  const calculateBMI = () => {
    if (!height || !weightData.length) return null;
    const latestWeight = weightData[0]?.weight;
    if (!latestWeight) return null;
    
    const heightInMeters = parseFloat(height) / 100;
    return (latestWeight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return { text: '偏瘦', color: '#3498db' };
    if (bmi < 24) return { text: '正常', color: '#2ecc71' };
    if (bmi < 28) return { text: '偏胖', color: '#f39c12' };
    return { text: '肥胖', color: '#e74c3c' };
  };

  const getWeightTrend = () => {
    if (weightData.length < 2) return null;
    const recent = weightData.slice(0, 2);
    const difference = recent[0].weight - recent[1].weight;
    return difference > 0 ? '下降' : difference < 0 ? '上升' : '稳定';
  };

  const currentBMI = calculateBMI();
  const bmiCategory = currentBMI ? getBMICategory(currentBMI) : null;
  const weightTrend = getWeightTrend();

  return (
    <div className="weight-manager fade-in">
      {/* 统计卡片 */}
      <div className="stats-grid">
        <div className="glass-card stat-card">
          <div className="stat-value">
            {weightData.length > 0 ? weightData[0].weight : '--'} kg
          </div>
          <div className="stat-label">当前体重</div>
        </div>
        
        <div className="glass-card stat-card">
          <div className="stat-value">{currentBMI || '--'}</div>
          <div className="stat-label">BMI指数</div>
          {bmiCategory && (
            <div style={{ color: bmiCategory.color, fontSize: '12px' }}>
              {bmiCategory.text}
            </div>
          )}
        </div>
        
        <div className="glass-card stat-card">
          <div className="stat-value">{weightTrend || '--'}</div>
          <div className="stat-label">体重趋势</div>
        </div>
        
        <div className="glass-card stat-card">
          <div className="stat-value">{weightData.length}</div>
          <div className="stat-label">记录天数</div>
        </div>
      </div>

      {/* 添加记录表单 */}
      <div className="glass-card">
        <h3 style={{ color: 'white', marginBottom: '20px' }}>📝 添加体重记录</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div className="form-group">
            <label>体重 (kg)</label>
            <input
              type="number"
              step="0.1"
              className="form-control"
              placeholder="请输入体重"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label>身高 (cm)</label>
            <input
              type="number"
              className="form-control"
              placeholder="请输入身高"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label>目标体重 (kg)</label>
            <input
              type="number"
              step="0.1"
              className="form-control"
              placeholder="请输入目标体重"
              value={targetWeight}
              onChange={(e) => setTargetWeight(e.target.value)}
            />
          </div>
        </div>
        
        <button 
          className="btn btn-primary" 
          onClick={addWeightRecord}
          style={{ marginTop: '15px' }}
        >
          添加记录
        </button>
      </div>

      {/* 简单图表 */}
      <div className="glass-card">
        <h3 style={{ color: 'white', marginBottom: '20px' }}>📊 体重趋势图</h3>
        <div className="chart-container">
          {weightData.length > 0 ? (
            <div style={{ width: '100%', height: '250px', position: 'relative' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-end',
                height: '200px',
                padding: '0 20px'
              }}>
                {weightData.slice(0, 7).reverse().map((record, index) => {
                  const maxWeight = Math.max(...weightData.map(w => w.weight));
                  const minWeight = Math.min(...weightData.map(w => w.weight));
                  const height = ((record.weight - minWeight) / (maxWeight - minWeight)) * 180 + 20;
                  
                  return (
                    <div key={record.id} style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      flex: 1
                    }}>
                      <div style={{
                        width: '30px',
                        height: `${height}px`,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '5px',
                        marginBottom: '5px'
                      }} />
                      <div style={{ 
                        fontSize: '10px', 
                        color: 'rgba(255,255,255,0.8)',
                        textAlign: 'center'
                      }}>
                        {record.date.split('/').slice(0, 2).join('/')}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div style={{ color: 'rgba(255,255,255,0.7)' }}>
              暂无数据，请添加体重记录
            </div>
          )}
        </div>
      </div>

      {/* 历史记录 */}
      {weightData.length > 0 && (
        <div className="glass-card">
          <h3 style={{ color: 'white', marginBottom: '20px' }}>📋 历史记录</h3>
          <div className="record-list">
            {weightData.map((record) => (
              <div key={record.id} className="record-item">
                <div className="record-date">{record.date}</div>
                <div className="record-value">{record.weight} kg</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeightManager;