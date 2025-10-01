import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from './AppProvider';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { toast } from 'sonner@2.0.3';
import { 
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  Filter,
  Search,
  PieChart,
  Calendar,
  Target,
  BarChart3,
  Wallet,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import type { PortfolioFilter, PortfolioLoan } from './AppProvider';

export const PortfolioScreen: React.FC = () => {
  const { 
    setCurrentScreen, 
    portfolioLoans, 
    portfolioStats, 
    riskCategories,
    getFilteredPortfolioLoans,
    setSelectedPortfolioLoan 
  } = useApp();

  const [filter, setFilter] = useState<PortfolioFilter>({
    status: 'all',
    riskCategory: 'all',
    sortBy: 'payment_date',
    sortOrder: 'asc'
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filteredLoans = getFilteredPortfolioLoans(filter).filter(loan =>
    loan.borrowerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loan.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLoanClick = (loan: PortfolioLoan) => {
    setSelectedPortfolioLoan(loan);
    setCurrentScreen('portfolio-detail');
  };

  const getStatusColor = (status: PortfolioLoan['status']) => {
    switch (status) {
      case 'active': return 'bg-[#00C853]';
      case 'late': return 'bg-[#FF9500]';
      case 'completed': return 'bg-[#007AFF]';
      case 'defaulted': return 'bg-[#FF3B30]';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: PortfolioLoan['status']) => {
    switch (status) {
      case 'active': return 'Active';
      case 'late': return 'Late';
      case 'completed': return 'Completed';
      case 'defaulted': return 'Defaulted';
      default: return 'Unknown';
    }
  };

  const getRiskCategoryColor = (category: string) => {
    const riskCat = riskCategories.find(r => r.name === category);
    return riskCat?.color || '#666';
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      minimumFractionDigits: 2 
    });
  };

  return (
    <div className="min-h-screen swapin-gradient pb-20">
      {/* Header */}
      <div className="swapin-glass border-b border-white/10 px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => setCurrentScreen('home')}
              variant="ghost"
              size="sm"
              className="rounded-full w-12 h-12 p-0 swapin-glass hover:bg-white/20 border-0"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </Button>
            <div>
              <h1 className="text-2xl text-white font-bold">Carteira</h1>
              <p className="text-sm text-white/70">Visão geral dos seus investimentos e ativos</p>
            </div>
          </div>
          <Button
            onClick={() => setCurrentScreen('portfolio-analytics')}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-0 rounded-xl px-6 shadow-lg shadow-emerald-500/25"
            size="sm"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </Button>
        </div>
      </div>

      <div className="px-6 py-8 space-y-8">
        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Total Invested */}
          <Card className="p-6 bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 border-0 shadow-xl shadow-indigo-500/25 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full transform translate-x-16 -translate-y-16"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <Badge className="bg-white/20 text-white border-0 backdrop-blur">
                  Total Invested
                </Badge>
              </div>
              <h3 className="text-3xl font-bold mb-2">
                {formatCurrency(portfolioStats.totalInvested)}
              </h3>
              <p className="text-white/80">
                {portfolioStats.activeLoans + portfolioStats.completedLoans} active investments
              </p>
            </div>
          </Card>

          {/* Total Returns */}
          <Card className="p-6 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 border-0 shadow-xl shadow-emerald-500/25 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full transform translate-x-16 -translate-y-16"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <Badge className="bg-white/20 text-white border-0 backdrop-blur">
                  Total Returns
                </Badge>
              </div>
              <h3 className="text-3xl font-bold mb-2">
                {formatCurrency(portfolioStats.totalReturns)}
              </h3>
              <div className="flex items-center space-x-2">
                <ArrowUpRight className="w-4 h-4 text-white" />
                <p className="text-white/80">
                  {portfolioStats.averageROI.toFixed(1)}% average ROI
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Monthly Income & Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-5 text-center bg-white/60 backdrop-blur border-0 shadow-lg">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <p className="text-xl font-bold text-slate-900">{formatCurrency(portfolioStats.monthlyIncome)}</p>
            <p className="text-sm text-slate-600 mt-1">Monthly Income</p>
          </Card>

          <Card className="p-5 text-center bg-white/60 backdrop-blur border-0 shadow-lg">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <p className="text-xl font-bold text-slate-900">{portfolioStats.activeLoans}</p>
            <p className="text-sm text-slate-600 mt-1">Active Loans</p>
          </Card>

          <Card className="p-5 text-center bg-white/60 backdrop-blur border-0 shadow-lg">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Target className="w-6 h-6 text-white" />
            </div>
            <p className="text-xl font-bold text-slate-900">{portfolioStats.completedLoans}</p>
            <p className="text-sm text-slate-600 mt-1">Completed</p>
          </Card>
        </div>

        {/* Risk Distribution */}
        <Card className="p-6 bg-white/60 backdrop-blur border-0 shadow-lg">
          <h4 className="text-xl font-bold mb-6 flex items-center text-slate-900">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center mr-3">
              <PieChart className="w-5 h-5 text-white" />
            </div>
            Risk Distribution
          </h4>
          <div className="space-y-4">
            {Object.entries(portfolioStats.riskDistribution).map(([category, data]) => {
              const riskCat = riskCategories.find(r => r.name === category);
              return (
                <div key={category} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-xl shadow-lg"
                        style={{ 
                          backgroundColor: riskCat?.color,
                          boxShadow: `0 4px 14px 0 ${riskCat?.color}40`
                        }}
                      />
                      <span className="font-medium text-slate-900 capitalize">{riskCat?.label}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">{formatCurrency(data.amount)}</p>
                      <p className="text-sm text-slate-600">{data.percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500 ease-out"
                        style={{ 
                          width: `${data.percentage}%`,
                          background: `linear-gradient(90deg, ${riskCat?.color}, ${riskCat?.color}dd)`
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search loans or borrowers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-4 bg-white/60 backdrop-blur border-0 rounded-2xl shadow-lg focus:ring-2 focus:ring-indigo-500/20 focus:bg-white/80 transition-all duration-200"
              />
            </div>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              className={`w-12 h-12 rounded-2xl border-0 transition-all duration-200 ${
                showFilters 
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25' 
                  : 'bg-white/60 backdrop-blur text-slate-700 hover:bg-white/80'
              }`}
            >
              <Filter className="w-5 h-5" />
            </Button>
          </div>

          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0, y: -10 }}
              animate={{ height: 'auto', opacity: 1, y: 0 }}
              exit={{ height: 0, opacity: 0, y: -10 }}
              className="overflow-hidden"
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <Card className="p-6 bg-white/60 backdrop-blur border-0 shadow-lg rounded-3xl space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Status</label>
                    <Select
                      value={filter.status}
                      onValueChange={(value: any) => setFilter(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger className="bg-white/80 border-0 rounded-xl shadow-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white/95 backdrop-blur border-0 rounded-xl shadow-xl">
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="late">Late</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="defaulted">Defaulted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Risk Category</label>
                    <Select
                      value={filter.riskCategory}
                      onValueChange={(value: any) => setFilter(prev => ({ ...prev, riskCategory: value }))}
                    >
                      <SelectTrigger className="bg-white/80 border-0 rounded-xl shadow-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white/95 backdrop-blur border-0 rounded-xl shadow-xl">
                        <SelectItem value="all">All Categories</SelectItem>
                        {riskCategories.map(category => (
                          <SelectItem key={category.name} value={category.name}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Sort By</label>
                    <Select
                      value={filter.sortBy}
                      onValueChange={(value: any) => setFilter(prev => ({ ...prev, sortBy: value }))}
                    >
                      <SelectTrigger className="bg-white/80 border-0 rounded-xl shadow-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white/95 backdrop-blur border-0 rounded-xl shadow-xl">
                        <SelectItem value="amount">Amount</SelectItem>
                        <SelectItem value="rate">Interest Rate</SelectItem>
                        <SelectItem value="payment_date">Payment Date</SelectItem>
                        <SelectItem value="risk">Risk Score</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Order</label>
                    <Select
                      value={filter.sortOrder}
                      onValueChange={(value: any) => setFilter(prev => ({ ...prev, sortOrder: value }))}
                    >
                      <SelectTrigger className="bg-white/80 border-0 rounded-xl shadow-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white/95 backdrop-blur border-0 rounded-xl shadow-xl">
                        <SelectItem value="asc">Ascending</SelectItem>
                        <SelectItem value="desc">Descending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Loans List */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-2xl font-bold text-slate-900">Your Investments</h4>
            <Badge className="bg-slate-100 text-slate-700 border-0 px-4 py-2 rounded-xl">
              {filteredLoans.length} loans
            </Badge>
          </div>
          <div className="space-y-4">
            {filteredLoans.map((loan) => (
              <motion.div
                key={loan.id}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <Card 
                  className="p-6 cursor-pointer bg-white/60 backdrop-blur border-0 shadow-lg hover:shadow-xl rounded-3xl transition-all duration-300"
                  onClick={() => handleLoanClick(loan)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-14 h-14 shadow-lg">
                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-lg font-bold">
                          {loan.borrowerName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h5 className="font-bold text-slate-900 text-lg">{loan.borrowerName}</h5>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm text-slate-600">Score: {loan.borrowerScore}</p>
                          <div 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: getRiskCategoryColor(loan.riskCategory) }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        className={`${getStatusColor(loan.status)} text-white border-0 px-4 py-2 rounded-xl font-medium`}
                      >
                        {getStatusText(loan.status)}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-4">
                    <div className="space-y-1">
                      <p className="text-sm text-slate-600 font-medium">Investment Amount</p>
                      <p className="text-2xl font-bold text-slate-900">{formatCurrency(loan.amount)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-slate-600 font-medium">Monthly Rate</p>
                      <p className="text-2xl font-bold text-emerald-600">{loan.interestRate}%</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-lg shadow-lg"
                        style={{ 
                          backgroundColor: getRiskCategoryColor(loan.riskCategory),
                          boxShadow: `0 4px 12px 0 ${getRiskCategoryColor(loan.riskCategory)}40`
                        }}
                      />
                      <span className="font-medium text-slate-700 capitalize">
                        {riskCategories.find(r => r.name === loan.riskCategory)?.label} Risk
                      </span>
                    </div>
                    {loan.status === 'active' && (
                      <div className="flex items-center space-x-2 text-sm text-slate-600 bg-slate-100 px-3 py-2 rounded-xl">
                        <Calendar className="w-4 h-4" />
                        <span>Next: {new Date(loan.nextPaymentDate).toLocaleDateString('pt-BR')}</span>
                      </div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">Payment Progress</span>
                      <span className="text-sm font-bold text-slate-900">{loan.paymentsReceived}/{loan.totalPayments} payments</span>
                    </div>
                    <div className="relative">
                      <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${(loan.paymentsReceived / loan.totalPayments) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <div className="space-y-1">
                      <p className="text-sm text-slate-600">Monthly Income</p>
                      <p className="font-bold text-slate-900">{formatCurrency(loan.monthlyPayment)}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-sm text-slate-600">Total Earned</p>
                      <p className="font-bold text-emerald-600">{formatCurrency(loan.totalInterestEarned)}</p>
                    </div>
                    <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 rounded-xl px-6 shadow-lg">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredLoans.length === 0 && (
            <Card className="p-12 text-center bg-white/60 backdrop-blur border-0 shadow-lg rounded-3xl">
              <div className="w-20 h-20 bg-gradient-to-br from-slate-200 to-slate-300 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-slate-500" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">No investments found</h3>
              <p className="text-slate-600 mb-6 max-w-sm mx-auto">
                No loans match your current filters or search criteria
              </p>
              <Button
                onClick={() => {
                  setFilter({
                    status: 'all',
                    riskCategory: 'all',
                    sortBy: 'payment_date',
                    sortOrder: 'asc'
                  });
                  setSearchTerm('');
                }}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0 rounded-xl px-8 py-3 shadow-lg"
              >
                Clear All Filters
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};