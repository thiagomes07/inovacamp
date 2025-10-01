import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from './AppProvider';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { 
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  PieChart as PieChartIcon,
  BarChart3,
  Calendar,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';

export const PortfolioAnalyticsScreen: React.FC = () => {
  const { 
    setCurrentScreen, 
    portfolioLoans, 
    portfolioStats, 
    riskCategories 
  } = useApp();

  const [timeRange, setTimeRange] = useState('6m'); // 1m, 3m, 6m, 1y, all
  const [selectedMetric, setSelectedMetric] = useState('returns'); // returns, volume, risk

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      minimumFractionDigits: 0 
    });
  };

  // Mock performance data
  const performanceData = [
    { month: 'Jan', returns: 1200, invested: 15000, roi: 8.0 },
    { month: 'Feb', returns: 1850, invested: 22000, roi: 8.4 },
    { month: 'Mar', returns: 2100, invested: 28000, roi: 7.5 },
    { month: 'Apr', returns: 2650, invested: 35000, roi: 7.6 },
    { month: 'May', returns: 3200, invested: 42000, roi: 7.6 },
    { month: 'Jun', returns: 4100, invested: 55000, roi: 7.5 }
  ];

  // Risk distribution data for pie chart
  const riskDistributionData = Object.entries(portfolioStats.riskDistribution).map(([category, data]) => {
    const riskCat = riskCategories.find(r => r.name === category);
    return {
      name: riskCat?.label || category,
      value: data.amount,
      percentage: data.percentage,
      color: riskCat?.color || '#666',
      loans: data.loans
    };
  });

  // Monthly income trend
  const monthlyIncomeData = [
    { month: 'Jan', income: 890, target: 1000 },
    { month: 'Feb', income: 1150, target: 1200 },
    { month: 'Mar', income: 1340, target: 1400 },
    { month: 'Apr', income: 1680, target: 1600 },
    { month: 'May', income: 1920, target: 1800 },
    { month: 'Jun', income: 2340, target: 2000 }
  ];

  // Loan performance by category
  const categoryPerformanceData = riskCategories.map(category => {
    const categoryLoans = portfolioLoans.filter(loan => loan.riskCategory === category.name);
    const totalAmount = categoryLoans.reduce((sum, loan) => sum + loan.amount, 0);
    const totalReturns = categoryLoans.reduce((sum, loan) => sum + loan.totalInterestEarned, 0);
    const avgROI = totalAmount > 0 ? (totalReturns / totalAmount) * 100 : 0;
    
    return {
      category: category.label,
      loans: categoryLoans.length,
      amount: totalAmount,
      returns: totalReturns,
      roi: avgROI,
      color: category.color
    };
  }).filter(data => data.loans > 0);

  const totalROI = portfolioStats.averageROI;
  const monthlyGrowth = 12.5; // Mock data
  const projectedAnnualReturn = portfolioStats.monthlyIncome * 12;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 pb-20">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-white/20 px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => setCurrentScreen('portfolio')}
              variant="ghost"
              size="sm"
              className="rounded-full w-12 h-12 p-0 bg-slate-100/50 hover:bg-slate-200/50 border border-slate-200/50"
            >
              <ArrowLeft className="w-5 h-5 text-slate-700" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Portfolio Analytics</h1>
              <p className="text-sm text-slate-600">Performance insights & metrics</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button className="bg-white/60 backdrop-blur border-0 text-slate-700 hover:bg-white/80 rounded-xl px-4 shadow-lg">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0 rounded-xl p-3 shadow-lg shadow-indigo-500/25">
              <RefreshCw className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="px-6 py-8 space-y-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 border-0 shadow-xl shadow-emerald-500/25 text-white relative overflow-hidden rounded-3xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full transform translate-x-16 -translate-y-16"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <Badge className="bg-white/20 text-white border-0 backdrop-blur">Total ROI</Badge>
              </div>
              <h3 className="text-4xl font-bold mb-2">
                {totalROI.toFixed(1)}%
              </h3>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-white" />
                <p className="text-white/80">+{monthlyGrowth}% this month</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 border-0 shadow-xl shadow-indigo-500/25 text-white relative overflow-hidden rounded-3xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full transform translate-x-16 -translate-y-16"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <Badge className="bg-white/20 text-white border-0 backdrop-blur">Projected Annual</Badge>
              </div>
              <h3 className="text-4xl font-bold mb-2">
                {formatCurrency(projectedAnnualReturn)}
              </h3>
              <p className="text-white/80">Based on current performance</p>
            </div>
          </Card>
        </div>

        {/* Time Range Selector */}
        <Card className="p-6 bg-white/60 backdrop-blur border-0 shadow-lg rounded-3xl">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-2xl font-bold text-slate-900">Performance Overview</h4>
            <div className="flex bg-slate-100 rounded-2xl p-2">
              {['1m', '3m', '6m', '1y', 'all'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 text-sm rounded-xl transition-all duration-200 font-medium ${
                    timeRange === range 
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
                      : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
                  }`}
                >
                  {range.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Performance Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#666' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#666' }}
                  tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    name === 'returns' ? formatCurrency(value) : formatCurrency(value),
                    name === 'returns' ? 'Returns' : 'Invested'
                  ]}
                  labelStyle={{ color: '#666' }}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="invested" 
                  stackId="1"
                  stroke="#007AFF" 
                  fill="#007AFF"
                  fillOpacity={0.1}
                />
                <Area 
                  type="monotone" 
                  dataKey="returns" 
                  stackId="1"
                  stroke="#00C853" 
                  fill="#00C853"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Risk Distribution */}
        <Card className="p-4">
          <h4 className="text-lg mb-4 flex items-center">
            <PieChartIcon className="w-5 h-5 mr-2 text-[#007AFF]" />
            Risk Distribution
          </h4>
          <div className="flex items-center justify-between">
            {/* Pie Chart */}
            <div className="w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {riskDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => [formatCurrency(value), 'Amount']}
                    labelStyle={{ color: '#666' }}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex-1 ml-6 space-y-3">
              {riskDistributionData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatCurrency(item.value)}</p>
                    <p className="text-xs text-gray-500">{item.percentage.toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Monthly Income Trend */}
        <Card className="p-4">
          <h4 className="text-lg mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-[#007AFF]" />
            Monthly Income vs Target
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyIncomeData} barCategoryGap={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#666' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#666' }}
                  tickFormatter={(value) => `R$ ${(value / 1000).toFixed(1)}k`}
                />
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    formatCurrency(value),
                    name === 'income' ? 'Actual Income' : 'Target'
                  ]}
                  labelStyle={{ color: '#666' }}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="target" fill="#007AFF" fillOpacity={0.3} />
                <Bar dataKey="income" fill="#00C853" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category Performance */}
        <Card className="p-4">
          <h4 className="text-lg mb-4">Performance by Risk Category</h4>
          <div className="space-y-4">
            {categoryPerformanceData.map((category, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="font-medium">{category.category}</span>
                    <Badge variant="secondary" className="text-xs">
                      {category.loans} loans
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatCurrency(category.returns)}</p>
                    <p className="text-xs text-gray-500">{category.roi.toFixed(1)}% ROI</p>
                  </div>
                </div>
                <Progress 
                  value={category.roi} 
                  className="h-2"
                  style={{
                    backgroundColor: `${category.color}20`
                  }}
                />
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Invested: {formatCurrency(category.amount)}</span>
                  <span>{category.roi.toFixed(1)}% return</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Performance Metrics Summary */}
        <Card className="p-4">
          <h4 className="text-lg mb-4">Portfolio Metrics</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Loans</span>
                <span className="font-medium">{portfolioStats.activeLoans}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Completed Loans</span>
                <span className="font-medium text-[#00C853]">{portfolioStats.completedLoans}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Defaulted Loans</span>
                <span className="font-medium text-[#FF3B30]">{portfolioStats.defaultedLoans}</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Invested</span>
                <span className="font-medium">{formatCurrency(portfolioStats.totalInvested)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Returns</span>
                <span className="font-medium text-[#00C853]">{formatCurrency(portfolioStats.totalReturns)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Monthly Income</span>
                <span className="font-medium text-[#007AFF]">{formatCurrency(portfolioStats.monthlyIncome)}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};