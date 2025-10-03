import React, { useState, useRef, useEffect } from 'react';
import { createPopper } from '@popperjs/core';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Bar, Doughnut, PolarArea, Radar } from 'react-chartjs-2';
import { portfolioData, riskMetrics, benchmarkData } from '../data/portfolioData';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler
);

const PortfolioAnalyzer = () => {
  const [showTooltip, setShowTooltip] = useState(null);
  const tooltipRef = useRef(null);
  const popperInstance = useRef(null);
  const { holdings, totalInvestment, totalProfit, totalReturn } = portfolioData;

  useEffect(() => {
    return () => {
      if (popperInstance.current) {
        popperInstance.current.destroy();
      }
    };
  }, []);

  // 도넛 차트 중앙 텍스트 플러그인
  const centerTextPlugin = {
    id: 'centerText',
    beforeDraw: (chart) => {
      if (chart.config.type === 'doughnut') {
        const { width, height, ctx } = chart;
        ctx.restore();
        const fontSize = Math.min(width, height) / 12;
        ctx.font = `bold ${fontSize}px Inter, sans-serif`;
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#2d3748';
        
        const text1 = '총 투자금액';
        const text2 = `${totalInvestment.toLocaleString()}원`;
        const text3 = `수익률 +${totalReturn}%`;
        
        const textX = Math.round(width / 2);
        const textY = Math.round(height / 2);
        
        ctx.font = `600 ${fontSize * 0.7}px Inter, sans-serif`;
        ctx.fillStyle = '#718096';
        ctx.fillText(text1, textX, textY - fontSize * 0.8);
        
        ctx.font = `bold ${fontSize}px Inter, sans-serif`;
        ctx.fillStyle = '#2d3748';
        ctx.fillText(text2, textX, textY);
        
        ctx.font = `600 ${fontSize * 0.8}px Inter, sans-serif`;
        ctx.fillStyle = '#43e97b';
        ctx.fillText(text3, textX, textY + fontSize * 0.9);
        
        ctx.save();
      }
    }
  };

  // 포트폴리오 구성 도넛 차트
  const portfolioChartData = {
    labels: holdings.map(h => h.symbol),
    datasets: [{
      data: holdings.map(h => h.currentValue),
      backgroundColor: [
        'rgba(102, 126, 234, 0.8)',
        'rgba(118, 75, 162, 0.8)',
        'rgba(240, 147, 251, 0.8)',
        'rgba(245, 87, 108, 0.8)',
        'rgba(79, 172, 254, 0.8)',
        'rgba(67, 233, 123, 0.8)'
      ],
      borderColor: [
        'rgba(102, 126, 234, 1)',
        'rgba(118, 75, 162, 1)',
        'rgba(240, 147, 251, 1)',
        'rgba(245, 87, 108, 1)',
        'rgba(79, 172, 254, 1)',
        'rgba(67, 233, 123, 1)'
      ],
      borderWidth: 3,
      hoverOffset: 15
    }]
  };

  // 수익률 바 차트
  const returnChartData = {
    labels: holdings.map(h => h.symbol),
    datasets: [{
      label: '수익률 (%)',
      data: holdings.map(h => h.returnRate),
      backgroundColor: holdings.map(h =>
        h.returnRate >= 0
          ? 'rgba(67, 233, 123, 0.8)'
          : 'rgba(245, 87, 108, 0.8)'
      ),
      borderColor: holdings.map(h =>
        h.returnRate >= 0
          ? 'rgba(67, 233, 123, 1)'
          : 'rgba(245, 87, 108, 1)'
      ),
      borderWidth: 2,
      borderRadius: 8,
      borderSkipped: false,
    }]
  };

  // 섹터 분산 폴라 차트
  const sectorData = holdings.reduce((acc, holding) => {
    const existing = acc.find(item => item.sector === holding.sector);
    if (existing) {
      existing.value += holding.currentValue;
    } else {
      acc.push({ sector: holding.sector, value: holding.currentValue });
    }
    return acc;
  }, []);

  const sectorChartData = {
    labels: sectorData.map(s => s.sector),
    datasets: [{
      data: sectorData.map(s => s.value),
      backgroundColor: [
        'rgba(102, 126, 234, 0.7)',
        'rgba(118, 75, 162, 0.7)',
        'rgba(240, 147, 251, 0.7)',
        'rgba(245, 87, 108, 0.7)',
        'rgba(79, 172, 254, 0.7)',
        'rgba(67, 233, 123, 0.7)'
      ],
      borderColor: [
        'rgba(102, 126, 234, 1)',
        'rgba(118, 75, 162, 1)',
        'rgba(240, 147, 251, 1)',
        'rgba(245, 87, 108, 1)',
        'rgba(79, 172, 254, 1)',
        'rgba(67, 233, 123, 1)'
      ],
      borderWidth: 2
    }]
  };

  // 위험도 레이더 차트
  const riskChartData = {
    labels: ['베타', '샤프비율', '변동성 (역)', 'VaR (역)', '최대낙폭 (역)'],
    datasets: [{
      label: '위험도 지표',
      data: [
        riskMetrics.beta * 20,
        riskMetrics.sharpeRatio * 20,
        (100 - riskMetrics.volatility) * 2,
        (100 + riskMetrics.var95) * 2,
        (100 + riskMetrics.maxDrawdown) * 2
      ],
      backgroundColor: 'rgba(102, 126, 234, 0.2)',
      borderColor: 'rgba(102, 126, 234, 1)',
      borderWidth: 3,
      pointBackgroundColor: 'rgba(102, 126, 234, 1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(102, 126, 234, 1)',
      pointRadius: 6,
      pointHoverRadius: 8
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(102, 126, 234, 1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          afterLabel: function(context) {
            const dataIndex = context.dataIndex;
            const holding = holdings[dataIndex];
            return `보유 주식: ${holding.shares}주`;
          }
        }
      }
    }
  };

  const barOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          callback: function(value) {
            return value + '%';
          }
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 200,
        grid: {
          color: 'rgba(102, 126, 234, 0.2)'
        },
        angleLines: {
          color: 'rgba(102, 126, 234, 0.2)'
        },
        pointLabels: {
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          }
        }
      }
    }
  };

  const tooltips = {
    beta: "베타 계수 (Beta): 시장 전체와 비교한 위험도입니다. 1.0이면 시장과 같은 위험, 1.5면 시장보다 50% 더 위험, 0.5면 시장보다 50% 덜 위험합니다. 예: 시장이 10% 오르면 베타 1.5인 주식은 15% 오를 가능성이 높습니다.",
    sharpe: "샤프 비율 (Sharpe Ratio): 위험 대비 수익률입니다. 1.0 이상이면 좋고, 2.0 이상이면 매우 좋습니다. 예: 샤프비율 1.5는 '위험 1단위당 1.5의 수익을 얻는다'는 뜻입니다. 은행 예금보다 얼마나 더 효율적인지 보여줍니다.",
    var: "VaR (Value at Risk): 95% 확률로 하루에 잃을 수 있는 최대 금액입니다. -2.8%라면 '100일 중 95일은 2.8% 이상 손실이 나지 않는다'는 뜻입니다. 쉽게 말해 '거의 확실한 최대 손실 한계'입니다.",
    maxDrawdown: "최대 낙폭 (Maximum Drawdown): 역사상 가장 큰 손실 구간입니다. -12.5%라면 '과거에 최고점에서 12.5%까지 떨어진 적이 있다'는 뜻입니다. 투자자가 견뎌야 할 최악의 상황을 미리 보여줍니다.",
    volatility: "변동성 (Volatility): 가격이 얼마나 들쭉날쭉한지 나타냅니다. 18%라면 '1년 동안 보통 ±18% 범위에서 움직인다'는 뜻입니다. 높으면 큰 수익도 가능하지만 큰 손실도 가능합니다.",
    riskAnalysis: "위험도 분석: 포트폴리오가 얼마나 위험한지 5가지 지표로 측정합니다. 바깥쪽으로 갈수록 좋은 상태입니다. 베타(시장 대비 위험도), 샤프비율(효율성), 변동성/VaR/최대낙폭(안정성)을 종합적으로 보여줍니다.",
    sectorAnalysis: "섹터 분산: 투자금이 어떤 업종에 얼마나 분산되어 있는지 보여줍니다. 한 업종에 너무 집중되면 그 업종이 부진할 때 큰 손실을 볼 수 있어서, 여러 업종에 고르게 투자하는 것이 안전합니다."
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '24px',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    },
    maxWidth: { maxWidth: '1400px', margin: '0 auto' },
    card: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '20px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
      padding: '32px',
      marginBottom: '24px',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.2)'
    },
    chartCard: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '20px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
      padding: '24px',
      marginBottom: '24px',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.2)',
      height: '650px'
    },
    grid2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '24px' },
    grid3: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' },
    grid4: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' },
    statCard: {
      padding: '24px',
      borderRadius: '16px',
      textAlign: 'center',
      background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
      border: '1px solid rgba(255,255,255,0.3)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      cursor: 'pointer'
    },
    title: {
      fontSize: '36px',
      fontWeight: '700',
      marginBottom: '16px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      textAlign: 'center'
    },
    subtitle: {
      fontSize: '20px',
      fontWeight: '600',
      marginBottom: '20px',
      color: '#2d3748',
      display: 'flex',
      alignItems: 'center'
    },
    chartContainer: {
      height: '320px',
      position: 'relative'
    },
    metric: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px',
      padding: '12px 16px',
      backgroundColor: 'rgba(102, 126, 234, 0.05)',
      borderRadius: '12px',
      border: '1px solid rgba(102, 126, 234, 0.1)',
      transition: 'all 0.3s ease'
    },
    suggestion: {
      padding: '20px',
      borderRadius: '16px',
      marginBottom: '16px',
      border: '1px solid rgba(255,255,255,0.2)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
      transition: 'transform 0.3s ease'
    },
    progressBar: {
      width: '100%',
      backgroundColor: 'rgba(0,0,0,0.1)',
      borderRadius: '10px',
      height: '12px',
      marginTop: '12px',
      overflow: 'hidden'
    },
    progress: {
      height: '100%',
      borderRadius: '10px',
      background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
      transition: 'width 0.8s ease'
    },
    tooltip: {
      position: 'absolute',
      backgroundColor: 'rgba(0,0,0,0.95)',
      color: 'white',
      padding: '16px 20px',
      borderRadius: '12px',
      fontSize: '14px',
      maxWidth: '400px',
      zIndex: 10000,
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      border: '1px solid rgba(255,255,255,0.1)',
      lineHeight: '1.5',
      pointerEvents: 'none'
    },
    footer: {
      textAlign: 'center',
      marginTop: '40px',
      padding: '20px',
      color: 'rgba(255,255,255,0.8)',
      fontSize: '14px',
      fontWeight: '500'
    }
  };

  const InfoIcon = ({ type }) => (
    <span
      style={{
        cursor: 'help',
        marginLeft: '8px',
        width: '18px',
        height: '18px',
        borderRadius: '50%',
        backgroundColor: 'rgba(102, 126, 234, 0.2)',
        color: '#667eea',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        fontWeight: 'bold',
        border: '2px solid rgba(102, 126, 234, 0.3)',
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={(e) => {
        if (popperInstance.current) {
          popperInstance.current.destroy();
        }

        setShowTooltip({ type, element: e.target });

        if (tooltipRef.current) {
          popperInstance.current = createPopper(e.target, tooltipRef.current, {
            placement: 'top',
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: [0, 8],
                },
              },
              {
                name: 'preventOverflow',
                options: {
                  boundary: 'viewport',
                },
              },
            ],
          });
        }
      }}
      onMouseLeave={() => {
        setShowTooltip(null);
        if (popperInstance.current) {
          popperInstance.current.destroy();
          popperInstance.current = null;
        }
      }}
    >
      ?
    </span>
  );

  return (
    <div style={styles.container}>
      <div style={styles.maxWidth}>
        <div style={styles.card}>
          <h1 style={styles.title}>Portfolio Analytics Dashboard</h1>
          <p style={{textAlign: 'center', color: '#718096', fontSize: '18px', marginBottom: '32px'}}>
            실시간 포트폴리오 분석 및 위험 관리 도구 FOR 동구
          </p>
          <div style={styles.grid4}>
            <div style={{...styles.statCard, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
              <h3 style={{color: 'white', margin: '0 0 12px 0', fontSize: '16px'}}>총 투자금액</h3>
              <p style={{fontSize: '28px', fontWeight: '700', color: 'white', margin: 0}}>{totalInvestment.toLocaleString()}원</p>
            </div>
            <div style={{...styles.statCard, background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'}}>
              <h3 style={{color: 'white', margin: '0 0 12px 0', fontSize: '16px'}}>총 수익</h3>
              <p style={{fontSize: '28px', fontWeight: '700', color: 'white', margin: 0}}>+{totalProfit.toLocaleString()}원</p>
            </div>
            <div style={{...styles.statCard, background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'}}>
              <h3 style={{color: 'white', margin: '0 0 12px 0', fontSize: '16px'}}>수익률</h3>
              <p style={{fontSize: '28px', fontWeight: '700', color: 'white', margin: 0}}>+{totalReturn}%</p>
            </div>
            <div style={{...styles.statCard, background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'}}>
              <h3 style={{color: '#2d3748', margin: '0 0 12px 0', fontSize: '16px'}}>환율 (USD/KRW)</h3>
              <p style={{fontSize: '28px', fontWeight: '700', color: '#2d3748', margin: 0}}>{portfolioData.exchangeRate}원</p>
            </div>
          </div>
        </div>

        <div style={styles.grid2}>
          <div style={styles.chartCard}>
            <h2 style={styles.subtitle}>📊 포트폴리오 구성</h2>
            <p style={{color: '#718096', marginBottom: '20px', fontSize: '14px'}}>
              각 자산의 비중을 시각화하여 분산 투자 현황을 확인할 수 있습니다.
            </p>
            <div style={styles.chartContainer}>
              <Doughnut data={portfolioChartData} options={chartOptions} plugins={[centerTextPlugin]} />
            </div>
            <div style={{marginTop: '16px'}}>
              {holdings.map((holding, index) => (
                <div key={holding.symbol} style={{
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '6px 12px',
                  marginBottom: '6px',
                  backgroundColor: 'rgba(102, 126, 234, 0.05)',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}>
                  <span style={{fontWeight: '600'}}>{holding.symbol}</span>
                  <span>{holding.shares}주</span>
                  <span style={{color: holding.returnRate >= 0 ? '#43e97b' : '#f5576c'}}>
                    {holding.returnRate >= 0 ? '+' : ''}{holding.returnRate}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            ...styles.chartCard,
            height: window.innerWidth <= 768 ? '450px' : '650px'
          }}>
            <h2 style={styles.subtitle}>📈 종목별 수익률</h2>
            <p style={{color: '#718096', marginBottom: '20px', fontSize: '14px'}}>
              각 종목의 수익률을 비교하여 성과가 좋은 자산과 부진한 자산을 파악합니다.
            </p>
            <div style={{
              ...styles.chartContainer,
              height: window.innerWidth <= 768 ? '350px' : '320px'
            }}>
              <Bar data={returnChartData} options={barOptions} />
            </div>
          </div>
        </div>

        <div style={styles.grid2}>
          <div style={{
            ...styles.chartCard,
            height: window.innerWidth <= 768 ? '500px' : '650px'
          }}>
            <h2 style={styles.subtitle}>🛡️ 위험도 분석</h2>
            <div style={{
              ...styles.chartContainer,
              height: window.innerWidth <= 768 ? '280px' : '320px'
            }}>
              <Radar data={riskChartData} options={radarOptions} />
            </div>
            <p style={{color: '#718096', marginTop: '20px', fontSize: '14px', lineHeight: '1.6'}}>
              포트폴리오가 얼마나 위험한지 5가지 지표로 측정합니다. 바깥쪽으로 갈수록 좋은 상태입니다.<br/>
              • <strong>베타</strong>: 시장 대비 위험도 | • <strong>샤프비율</strong>: 효율성<br/>
              • <strong>변동성</strong>: 가격 변동폭 | • <strong>VaR</strong>: 예상 최대 손실 | • <strong>최대낙폭</strong>: 역사상 최대 하락률
            </p>
          </div>

          <div style={{
            ...styles.chartCard,
            height: window.innerWidth <= 768 ? '500px' : '650px'
          }}>
            <h2 style={styles.subtitle}>🎯 섹터 분산</h2>
            <div style={{
              ...styles.chartContainer,
              height: window.innerWidth <= 768 ? '280px' : '320px'
            }}>
              <PolarArea data={sectorChartData} options={chartOptions} />
            </div>
            <p style={{color: '#718096', marginTop: '20px', fontSize: '14px', lineHeight: '1.6'}}>
              투자금이 어떤 업종에 얼마나 분산되어 있는지 보여줍니다.<br/>
              • <strong>분산투자 원칙</strong>: 한 업종에 너무 집중하면 위험 | • <strong>안전성 확보</strong>: 여러 업종에 고르게 투자
            </p>
          </div>
        </div>

        <div style={styles.grid3}>
          <div style={styles.card}>
            <h2 style={styles.subtitle}>⚠️ 위험 지표</h2>
            <div style={styles.metric}>
              <span>베타 계수 <InfoIcon type="beta" /></span>
              <span style={{fontWeight: 'bold', color: '#667eea'}}>{riskMetrics.beta}</span>
            </div>
            <div style={styles.metric}>
              <span>샤프 비율 <InfoIcon type="sharpe" /></span>
              <span style={{fontWeight: 'bold', color: '#667eea'}}>{riskMetrics.sharpeRatio}</span>
            </div>
            <div style={styles.metric}>
              <span>VaR (95%) <InfoIcon type="var" /></span>
              <span style={{fontWeight: 'bold', color: '#f5576c'}}>{riskMetrics.var95}%</span>
            </div>
            <div style={styles.metric}>
              <span>최대 낙폭 <InfoIcon type="maxDrawdown" /></span>
              <span style={{fontWeight: 'bold', color: '#f5576c'}}>{riskMetrics.maxDrawdown}%</span>
            </div>
            <div style={styles.metric}>
              <span>변동성 <InfoIcon type="volatility" /></span>
              <span style={{fontWeight: 'bold', color: '#667eea'}}>{riskMetrics.volatility}%</span>
            </div>
          </div>

          <div style={styles.card}>
            <h2 style={styles.subtitle}>📊 벤치마크 비교</h2>
            <p style={{color: '#718096', marginBottom: '20px', fontSize: '14px'}}>
              주요 지수 대비 포트폴리오 성과를 비교합니다.
            </p>
            <div style={{marginBottom: '20px'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '12px'}}>
                <span style={{fontWeight: '600'}}>내 포트폴리오</span>
                <span style={{fontWeight: 'bold', color: '#43e97b'}}>+{totalReturn}%</span>
              </div>
              <div style={styles.progressBar}>
                <div style={{...styles.progress, background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)', width: `${Math.min(totalReturn * 8, 100)}%`}}></div>
              </div>
            </div>
            <div style={{marginBottom: '20px'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '12px'}}>
                <span style={{fontWeight: '600'}}>S&P 500</span>
                <span style={{fontWeight: 'bold', color: '#667eea'}}>+{benchmarkData.SP500.return}%</span>
              </div>
              <div style={styles.progressBar}>
                <div style={{...styles.progress, width: `${Math.min(benchmarkData.SP500.return * 8, 100)}%`}}></div>
              </div>
            </div>
            <div>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '12px'}}>
                <span style={{fontWeight: '600'}}>KOSPI</span>
                <span style={{fontWeight: 'bold', color: '#764ba2'}}>+{benchmarkData.KOSPI.return}%</span>
              </div>
              <div style={styles.progressBar}>
                <div style={{...styles.progress, background: 'linear-gradient(90deg, #764ba2 0%, #667eea 100%)', width: `${Math.min(benchmarkData.KOSPI.return * 8, 100)}%`}}></div>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.card}>
          <h2 style={styles.subtitle}>💡 AI 포트폴리오 분석 결과</h2>
          <div style={styles.grid4}>
            <div style={{...styles.suggestion, background: 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)', border: '1px solid #ffeaa7'}}>
              <p style={{margin: '0 0 8px 0', fontWeight: '700', color: '#856404'}}>⚠️ 집중 위험 경고</p>
              <p style={{margin: '0 0 12px 0', fontSize: '14px', color: '#856404'}}>
                <strong>현재 상황:</strong> SCHD 비중이 45%로 과도하게 집중되어 있습니다.
              </p>
              <p style={{margin: '0 0 12px 0', fontSize: '14px', color: '#856404'}}>
                <strong>위험성:</strong> 한 종목이 전체 포트폴리오의 절반 가까이 차지하면, 해당 종목이 부진할 때 전체 수익률에 치명적 영향을 미칩니다. 
                배당주 ETF는 금리 상승 시 특히 취약하며, 성장성이 제한적입니다.
              </p>
              <p style={{margin: '0 0 12px 0', fontSize: '14px', color: '#856404'}}>
                <strong>개선 방안:</strong> SCHD 비중을 20-30%로 줄이고, 줄어든 비중을 VTI(전체시장)와 QQMQ(기술주)에 분산 배치하세요.
              </p>
              <p style={{margin: 0, fontSize: '14px', color: '#856404'}}>
                <strong>구체적 플랜:</strong> 3개월에 걸쳐 SCHD 150주 → 100주로 감축, 매도 자금으로 VTI 10주, QQMQ 5주 추가 매수
              </p>
            </div>
            
            <div style={{...styles.suggestion, background: 'linear-gradient(135deg, #cce5ff 0%, #74c0fc 100%)', border: '1px solid #74c0fc'}}>
              <p style={{margin: '0 0 8px 0', fontWeight: '700', color: '#1971c2'}}>💡 리밸런싱 제안</p>
              <p style={{margin: '0 0 12px 0', fontSize: '14px', color: '#1971c2'}}>
                <strong>현재 상황:</strong> TLT(채권) 비중이 2.4%로 너무 낮아 포트폴리오 안정성이 부족합니다.
              </p>
              <p style={{margin: '0 0 12px 0', fontSize: '14px', color: '#1971c2'}}>
                <strong>필요성:</strong> 주식 시장이 급락할 때 채권은 반대로 상승하는 경향이 있어 '헤지' 역할을 합니다. 
                현재처럼 채권 비중이 낮으면 시장 충격 시 포트폴리오 전체가 동반 하락할 위험이 큽니다.
              </p>
              <p style={{margin: '0 0 12px 0', fontSize: '14px', color: '#1971c2'}}>
                <strong>목표 비중:</strong> TLT를 5-10%까지 늘려 '60/40 포트폴리오'(주식 60%, 채권 40%)의 축소판을 구현하세요.
              </p>
              <p style={{margin: '0 0 12px 0', fontSize: '14px', color: '#1971c2'}}>
                <strong>예상 효과:</strong> 채권 10% 추가 시 최대낙폭 -12.5% → -9.8%로 개선, 변동성 18.2% → 15.6%로 감소 예상. 
                연평균 수익률은 9.9% → 8.7%로 소폭 하락하지만 위험 대비 수익률(샤프비율)은 1.23 → 1.35로 향상됩니다.
              </p>
              <p style={{margin: 0, fontSize: '14px', color: '#1971c2'}}>
                <strong>장기 전략:</strong> 경기 침체 신호가 보이면 TLT 비중을 15%까지 확대, 회복기에는 다시 5%로 축소하는 전술적 자산배분 적용
              </p>
            </div>
          </div>
          
          <div style={styles.grid4}>
            <div style={{...styles.suggestion, background: 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)', border: '1px solid #c3e6cb'}}>
              <p style={{margin: '0 0 8px 0', fontWeight: '700', color: '#155724'}}>✅ 포트폴리오 강점</p>
              <p style={{margin: '0 0 12px 0', fontSize: '14px', color: '#155724'}}>
                <strong>현재 장점:</strong> ETF 중심 구성으로 개별 종목 리스크가 잘 관리되고 있으며, 비용 효율적입니다.
              </p>
              <p style={{margin: '0 0 12px 0', fontSize: '14px', color: '#155724'}}>
                <strong>수익률 분석:</strong> 9.9% 수익률은 S&P 500(8.2%)을 상회하는 우수한 성과입니다. 
                특히 TSLA(49.3%)와 VTI(18.3%)가 포트폴리오 수익을 견인하고 있습니다.
              </p>
              <p style={{margin: 0, fontSize: '14px', color: '#155724'}}>
                <strong>유지 전략:</strong> 현재의 ETF 중심 전략을 유지하되, 개별 종목(NEE, TSLA) 비중이 10%를 넘지 않도록 관리하세요.
              </p>
            </div>
            
            <div style={{...styles.suggestion, background: 'linear-gradient(135deg, #e2e3ff 0%, #b197fc 100%)', border: '1px solid #b197fc'}}>
              <p style={{margin: '0 0 8px 0', fontWeight: '700', color: '#5f3dc4'}}>🎯 장기 목표 (1-3년)</p>
              <p style={{margin: '0 0 12px 0', fontSize: '14px', color: '#5f3dc4'}}>
                <strong>글로벌 분산:</strong> 현재 100% 미국 투자로 지역 집중 위험이 있습니다. 
                VEA(선진국), VWO(신흥국) ETF를 추가하여 지역 분산을 구현하세요.
              </p>
              <p style={{margin: '0 0 12px 0', fontSize: '14px', color: '#5f3dc4'}}>
                <strong>목표 배분:</strong> 미국 70%, 선진국 20%, 신흥국 10%로 글로벌 분산 완성
              </p>
              <p style={{margin: '0 0 12px 0', fontSize: '14px', color: '#5f3dc4'}}>
                <strong>섹터 다각화:</strong> 현재 기술주 편중(VTI+QQMQ+TSLA = 45%)을 완화하기 위해 
                헬스케어(VHT), 소비재(VDC) ETF 추가 고려
              </p>
              <p style={{margin: '0 0 12px 0', fontSize: '14px', color: '#5f3dc4'}}>
                <strong>예상 효과:</strong> 글로벌 분산 완성 시 베타 1.15 → 0.95로 하락, 최대낙폭 -12.5% → -8.2%로 개선. 
                미국 경기침체 시에도 선진국/신흥국 성장으로 손실 완충 효과 기대. 장기 연평균 수익률 9.5-11.2% 목표 가능.
              </p>
              <p style={{margin: '0 0 12px 0', fontSize: '14px', color: '#5f3dc4'}}>
                <strong>수익 시뮬레이션:</strong> 현재 4,100만원 → 3년 후 5,800-6,200만원 예상 (연복리 12% 가정). 
                분산투자로 변동성은 줄이면서 안정적 성장 달성 가능.
              </p>
              <p style={{margin: 0, fontSize: '14px', color: '#5f3dc4'}}>
                <strong>실행 로드맵:</strong> 6개월마다 신규 자금의 30%를 국제 ETF에 투자, 
                1년 후 리밸런싱으로 목표 비중 달성, 2년 후 섹터 ETF 추가로 완전한 분산 포트폴리오 구축
              </p>
            </div>
          </div>
        </div>

        {showTooltip && (
          <div
            ref={tooltipRef}
            style={{
              ...styles.tooltip,
              visibility: showTooltip ? 'visible' : 'hidden'
            }}
          >
            {tooltips[showTooltip.type]}
          </div>
        )}

        <div style={styles.footer}>
          <p style={{margin: 0}}>Made from d9 | Portfolio Analytics Dashboard</p>
          <p style={{margin: '8px 0 0 0', fontSize: '12px', opacity: 0.7}}>
            Real-time portfolio analysis and risk management tool
          </p>
        </div>
      </div>
    </div>
  );
};

export default PortfolioAnalyzer;
