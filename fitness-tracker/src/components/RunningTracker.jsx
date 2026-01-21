import React, { useState } from 'react';

const RunningTracker = ({ runningData, setRunningData }) => {
  const [distance, setDistance] = useState('');
  const [time, setTime] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // 计时器功能
  React.useEffect(() => {
    let interval;
    if (isRunning && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, startTime]);

  const startStopwatch = () => {
    if (!isRunning) {
      setStartTime(Date.now() - elapsedTime);
      setIsRunning(true);
    } else {
      setIsRunning(false);
    }
  };

  const resetStopwatch = () => {
    setIsRunning(false);
    setStartTime(null);
    setElapsedTime(0);
  };

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const addRunningRecord = () => {
    if (!distance || !time) return;
    
    const [minutes, seconds] = time.split(':').map(Number);
    const totalMinutes = minutes + (seconds || 0) / 60;
    const pace = totalMinutes / parseFloat(distance); // 配速：分钟/公里
    
    const newRecord = {
      id: Date.now(),
      distance: parseFloat(distance),
      time: time,
      pace: pace.toFixed(2),
      date: new Date().toLocaleDateString('zh-CN'),
      timestamp: new Date().toLocaleString('zh-CN')
    };
    
    setRunningData([newRecord, ...runningData]);
    setDistance('');
    setTime('');
    resetStopwatch();
  };

  const calculateStats = () => {
    if (runningData.length === 0) return { totalDistance: 0, totalTime: 0, avgPace: 0 };
    
    const totalDistance = runningData.reduce((sum, record) => sum + record.distance, 0);
    const avgPace = runningData.reduce((sum, record) => sum + parseFloat(record.pace), 0) / runningData.length;
    
    return {
      totalDistance: totalDistance.toFixed(1),
      avgPace: avgPace.toFixed(2),
      runCount: runningData.length
    };
  };

  const stats = calculateStats();

  return (
    <div className="running-tracker fade-in">
      {/* 统计卡片 */}
      <div className="stats-grid">
        <div className="glass-card stat-card">
          <div className="stat-value">{stats.totalDistance} km</div>
          <div className="stat-label">总距离</div>
        </div>
        
        <div className="glass-card stat-card">
          <div className="stat-value">{stats.avgPace} min/km</div>
          <div className="stat-label">平均配速</div>
        </div>
        
        <div className="glass-card stat-card">
          <div className="stat-value">{stats.runCount}</div>
          <div className="stat-label">跑步次数</div>
        </div>
        
        <div className="glass-card stat-card">
          <div className="stat-value">
            {stats.runCount > 0 ? (stats.totalDistance / stats.runCount).toFixed(1) : '0'} km
          </div>
          <div className="stat-label">平均距离</div>
        </div>
      </div>

      {/* 跑步记录表单 */}
      <div className="glass-card">
        <h3 style={{ color: 'white', marginBottom: '20px' }}>🏃‍♂️ 记录跑步数据</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div className="form-group">
            <label>距离 (km)</label>
            <input
              type="number"
              step="0.1"
              className="form-control"
              placeholder="请输入跑步距离"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label>时间 (分钟:秒)</label>
            <input
              type="text"
              className="form-control"
              placeholder="格式: 25:30"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
        </div>

        {/* 秒表功能 */}
        <div className="glass-card" style={{ marginTop: '20px', background: 'rgba(255,255,255,0.05)' }}>
          <h4 style={{ color: 'white', marginBottom: '15px' }}>⏱️ 秒表</h4>
          <div style={{ 
            fontSize: '48px', 
            color: 'white', 
            textAlign: 'center', 
            fontWeight: 'bold',
            marginBottom: '20px'
          }}>
            {formatTime(elapsedTime)}
          </div>
          <div style={{ textAlign: 'center' }}>
            <button 
              className={`btn ${isRunning ? 'btn-danger' : 'btn-primary'}`}
              onClick={startStopwatch}
              style={{ marginRight: '10px' }}
            >
              {isRunning ? '暂停' : '开始'}
            </button>
            <button 
              className="btn"
              onClick={resetStopwatch}
            >
              重置
            </button>
          </div>
        </div>
        
        <button 
          className="btn btn-primary" 
          onClick={addRunningRecord}
          style={{ marginTop: '15px' }}
        >
          添加记录
        </button>
      </div>

      {/* 跑步趋势图 */}
      <div className="glass-card">
        <h3 style={{ color: 'white', marginBottom: '20px' }}>📊 跑步趋势</h3>
        <div className="chart-container">
          {runningData.length > 0 ? (
            <div style={{ width: '100%', height: '250px', position: 'relative' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-end',
                height: '200px',
                padding: '0 20px'
              }}>
                {runningData.slice(0, 7).reverse().map((record, index) => {
                  const maxDistance = Math.max(...runningData.map(r => r.distance));
                  const height = (record.distance / maxDistance) * 180 + 20;
                  
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
                        background: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)',
                        borderRadius: '5px',
                        marginBottom: '5px'
                      }} />
                      <div style={{ 
                        fontSize: '10px', 
                        color: 'rgba(255,255,255,0.8)',
                        textAlign: 'center'
                      }}>
                        {record.distance}km
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div style={{ color: 'rgba(255,255,255,0.7)' }}>
              暂无数据，请添加跑步记录
            </div>
          )}
        </div>
      </div>

      {/* 历史记录 */}
      {runningData.length > 0 && (
        <div className="glass-card">
          <h3 style={{ color: 'white', marginBottom: '20px' }}>📋 跑步历史</h3>
          <div className="record-list">
            {runningData.map((record) => (
              <div key={record.id} className="record-item">
                <div>
                  <div className="record-date">{record.date}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
                    {record.timestamp}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div className="record-value">{record.distance} km</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
                    {record.time}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="record-value">{record.pace} min/km</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RunningTracker;