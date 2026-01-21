import React, { useState, useEffect } from 'react';
import WeightManager from './components/WeightManager';
import RunningTracker from './components/RunningTracker';
import HealthRecommendations from './components/HealthRecommendations';

function App() {
  const [activeTab, setActiveTab] = useState('weight');
  const [weightData, setWeightData] = useState([]);
  const [runningData, setRunningData] = useState([]);

  // 从本地存储加载数据
  useEffect(() => {
    const savedWeightData = localStorage.getItem('weightData');
    const savedRunningData = localStorage.getItem('runningData');
    
    if (savedWeightData) {
      setWeightData(JSON.parse(savedWeightData));
    }
    
    if (savedRunningData) {
      setRunningData(JSON.parse(savedRunningData));
    }
  }, []);

  // 保存数据到本地存储
  useEffect(() => {
    localStorage.setItem('weightData', JSON.stringify(weightData));
  }, [weightData]);

  useEffect(() => {
    localStorage.setItem('runningData', JSON.stringify(runningData));
  }, [runningData]);

  const tabs = [
    { id: 'weight', label: '体重管理', icon: '⚖️' },
    { id: 'running', label: '跑步记录', icon: '🏃' },
    { id: 'health', label: '健康方案', icon: '💪' }
  ];

  return (
    <div className="app">
      {/* 导航栏 */}
      <nav className="navbar">
        <h1>🏃‍♂️ Fitness Tracker</h1>
        <div className="nav-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* 主内容区域 */}
      <main className="main-content">
        {activeTab === 'weight' && (
          <WeightManager 
            weightData={weightData} 
            setWeightData={setWeightData} 
          />
        )}
        
        {activeTab === 'running' && (
          <RunningTracker 
            runningData={runningData} 
            setRunningData={setRunningData} 
          />
        )}
        
        {activeTab === 'health' && (
          <HealthRecommendations 
            weightData={weightData}
            runningData={runningData}
          />
        )}
      </main>
    </div>
  );
}

export default App;