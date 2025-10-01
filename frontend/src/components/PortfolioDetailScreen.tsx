import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from './AppProvider';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner@2.0.3';
import { 
  ArrowLeft,
  Calendar,
  DollarSign,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  Phone,
  Mail,
  MessageCircle,
  Shield,
  User,
  CreditCard,
  Target,
  BarChart3,
  FileText,
  Download,
  Share2
} from 'lucide-react';

export const PortfolioDetailScreen: React.FC = () => {
  const { 
    setCurrentScreen, 
    selectedPortfolioLoan: loan, 
    riskCategories 
  } = useApp();

  const [activeTab, setActiveTab] = useState('overview');

  if (!loan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h3 className="text-lg mb-2">No loan selected</h3>
          <p className="text-gray-600 mb-4">Please select a loan from your portfolio</p>
          <Button onClick={() => setCurrentScreen('portfolio')}>
            Back to Portfolio
          </Button>
        </Card>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      minimumFractionDigits: 2 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-[#00C853]';
      case 'late': return 'bg-[#FF9500]';
      case 'completed': return 'bg-[#007AFF]';
      case 'defaulted': return 'bg-[#FF3B30]';
      case 'paid': return 'bg-[#00C853]';
      case 'pending': return 'bg-[#FF9500]';
      case 'missed': return 'bg-[#FF3B30]';
      default: return 'bg-gray-500';
    }
  };

  const riskCategory = riskCategories.find(r => r.name === loan.riskCategory);
  const progressPercentage = (loan.paymentsReceived / loan.totalPayments) * 100;
  const remainingAmount = loan.amount - (loan.paymentsReceived * loan.monthlyPayment);
  const totalExpectedReturn = loan.amount + (loan.monthlyPayment * loan.totalPayments) - loan.amount;

  const handleContactBorrower = (method: 'phone' | 'email' | 'whatsapp') => {
    switch (method) {
      case 'phone':
        toast.success('Opening phone dialer...');
        break;
      case 'email':
        toast.success('Opening email client...');
        break;
      case 'whatsapp':
        toast.success('Opening WhatsApp...');
        break;
    }
  };

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
              <h1 className="text-2xl font-bold text-slate-900">Investment Details</h1>
              <p className="text-sm text-slate-600">{loan.borrowerName}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button className="bg-white/60 backdrop-blur border-0 text-slate-700 hover:bg-white/80 rounded-xl px-4 shadow-lg">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0 rounded-xl px-4 shadow-lg shadow-indigo-500/25">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      <div className="px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 bg-white/60 backdrop-blur border-0 rounded-2xl p-2 shadow-lg">
            <TabsTrigger value="overview" className="rounded-xl font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg">Overview</TabsTrigger>
            <TabsTrigger value="payments" className="rounded-xl font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg">Payments</TabsTrigger>
            <TabsTrigger value="borrower" className="rounded-xl font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg">Borrower</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8 mt-8">
            {/* Loan Status Card */}
            <Card className="p-8 bg-white/60 backdrop-blur border-0 shadow-lg rounded-3xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-16 h-16 shadow-lg">
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xl font-bold">
                      {loan.borrowerName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">{loan.borrowerName}</h3>
                    <p className="text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-lg inline-block mt-1">ID: {loan.id}</p>
                  </div>
                </div>
                <Badge className={`${getStatusColor(loan.status)} text-white border-0 px-6 py-3 rounded-2xl font-bold text-lg shadow-lg`}>
                  {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-6">
                <div className="space-y-2">
                  <p className="text-sm text-slate-600 font-medium">Investment Amount</p>
                  <p className="text-4xl font-bold text-slate-900">{formatCurrency(loan.amount)}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-slate-600 font-medium">Monthly Rate</p>
                  <p className="text-4xl font-bold text-emerald-600">{loan.interestRate}%</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-700">Payment Progress</span>
                  <span className="font-bold text-slate-900">{loan.paymentsReceived}/{loan.totalPayments} payments</span>
                </div>
                <div className="relative">
                  <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>Started: {new Date(loan.startDate).toLocaleDateString('pt-BR')}</span>
                  <span className="font-bold">{progressPercentage.toFixed(1)}% complete</span>
                </div>
              </div>
            </Card>

            {/* Financial Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 border-0 shadow-xl shadow-emerald-500/25 text-white relative overflow-hidden rounded-3xl">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full transform translate-x-12 -translate-y-12"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <Badge className="bg-white/20 text-white border-0 backdrop-blur">Interest Earned</Badge>
                  </div>
                  <h3 className="text-3xl font-bold mb-2">
                    {formatCurrency(loan.totalInterestEarned)}
                  </h3>
                  <p className="text-white/80">
                    {((loan.totalInterestEarned / loan.amount) * 100).toFixed(1)}% total return
                  </p>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 border-0 shadow-xl shadow-indigo-500/25 text-white relative overflow-hidden rounded-3xl">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full transform translate-x-12 -translate-y-12"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <Badge className="bg-white/20 text-white border-0 backdrop-blur">Monthly Income</Badge>
                  </div>
                  <h3 className="text-3xl font-bold mb-2">
                    {formatCurrency(loan.monthlyPayment)}
                  </h3>
                  <p className="text-white/80">
                    Next: {loan.status === 'active' ? new Date(loan.nextPaymentDate).toLocaleDateString('pt-BR') : 'N/A'}
                  </p>
                </div>
              </Card>
            </div>

            {/* Risk Assessment */}
            <Card className="p-4">
              <h4 className="text-lg mb-3 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-[#007AFF]" />
                Risk Assessment
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: riskCategory?.color }}
                    />
                    <div>
                      <p className="font-medium">{riskCategory?.label} Risk</p>
                      <p className="text-sm text-gray-600">{riskCategory?.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-medium">{loan.borrowerScore}</p>
                    <p className="text-sm text-gray-600">Credit Score</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-3 border-t">
                  <div className="text-center">
                    <p className="text-lg">{loan.duration}</p>
                    <p className="text-xs text-gray-600">Months</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg">{formatCurrency(remainingAmount)}</p>
                    <p className="text-xs text-gray-600">Remaining</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg">{formatCurrency(totalExpectedReturn)}</p>
                    <p className="text-xs text-gray-600">Total Expected</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-4">
              <h4 className="text-lg mb-3">Quick Actions</h4>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="h-12"
                  onClick={() => handleContactBorrower('whatsapp')}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact Borrower
                </Button>
                <Button 
                  variant="outline" 
                  className="h-12"
                  onClick={() => setActiveTab('payments')}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  View Payments
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6 mt-6">
            {/* Payment Summary */}
            <Card className="p-4">
              <h4 className="text-lg mb-3 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-[#007AFF]" />
                Payment History
              </h4>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl text-[#00C853]">{loan.paymentsReceived}</p>
                  <p className="text-sm text-gray-600">Paid</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl text-[#FF9500]">{loan.totalPayments - loan.paymentsReceived}</p>
                  <p className="text-sm text-gray-600">Remaining</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl">{loan.totalPayments}</p>
                  <p className="text-sm text-gray-600">Total</p>
                </div>
              </div>
            </Card>

            {/* Payment Schedule */}
            <Card className="p-4">
              <h4 className="text-lg mb-3">Payment Schedule</h4>
              <div className="space-y-3">
                {loan.paymentHistory.map((payment, index) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(payment.status)}`}>
                        {payment.status === 'paid' ? (
                          <CheckCircle className="w-4 h-4 text-white" />
                        ) : payment.status === 'pending' ? (
                          <Clock className="w-4 h-4 text-white" />
                        ) : (
                          <XCircle className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">Payment #{index + 1}</p>
                        <p className="text-sm text-gray-600">
                          Due: {new Date(payment.dueDate).toLocaleDateString('pt-BR')}
                        </p>
                        {payment.paidDate && (
                          <p className="text-sm text-[#00C853]">
                            Paid: {new Date(payment.paidDate).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(payment.amount)}</p>
                      <Badge 
                        className={`${getStatusColor(payment.status)} text-white text-xs`}
                      >
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                ))}

                {/* Future payments */}
                {Array.from({ length: loan.totalPayments - loan.paymentHistory.length }, (_, index) => {
                  const paymentNumber = loan.paymentHistory.length + index + 1;
                  const dueDate = new Date(loan.startDate);
                  dueDate.setMonth(dueDate.getMonth() + paymentNumber - 1);
                  
                  return (
                    <div key={`future-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg opacity-60">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center">
                          <Clock className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">Payment #{paymentNumber}</p>
                          <p className="text-sm text-gray-600">
                            Due: {dueDate.toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(loan.monthlyPayment)}</p>
                        <Badge variant="secondary" className="text-xs">
                          Scheduled
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="borrower" className="space-y-6 mt-6">
            {/* Borrower Info */}
            <Card className="p-4">
              <h4 className="text-lg mb-3 flex items-center">
                <User className="w-5 h-5 mr-2 text-[#007AFF]" />
                Borrower Information
              </h4>
              <div className="flex items-center space-x-4 mb-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="bg-[#007AFF] text-white text-xl">
                    {loan.borrowerName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl">{loan.borrowerName}</h3>
                  <p className="text-gray-600">ID: {loan.borrowerId}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: riskCategory?.color }}
                    />
                    <span className="text-sm">{riskCategory?.label} Risk</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Credit Profile */}
            <Card className="p-4">
              <h4 className="text-lg mb-3 flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-[#007AFF]" />
                Credit Profile
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Credit Score</p>
                  <p className="text-2xl">{loan.borrowerScore}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Risk Category</p>
                  <p className="text-lg capitalize">{riskCategory?.label}</p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Credit Score Range</span>
                  <span>{riskCategory?.minScore} - {riskCategory?.maxScore}</span>
                </div>
                <Progress 
                  value={((loan.borrowerScore - (riskCategory?.minScore || 0)) / ((riskCategory?.maxScore || 100) - (riskCategory?.minScore || 0))) * 100}
                  className="h-2 mt-2"
                />
              </div>
            </Card>

            {/* Contact Options */}
            <Card className="p-4">
              <h4 className="text-lg mb-3">Contact Options</h4>
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full h-12 justify-start"
                  onClick={() => handleContactBorrower('phone')}
                >
                  <Phone className="w-4 h-4 mr-3" />
                  Call Borrower
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full h-12 justify-start"
                  onClick={() => handleContactBorrower('email')}
                >
                  <Mail className="w-4 h-4 mr-3" />
                  Send Email
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full h-12 justify-start"
                  onClick={() => handleContactBorrower('whatsapp')}
                >
                  <MessageCircle className="w-4 h-4 mr-3" />
                  WhatsApp
                </Button>
              </div>
            </Card>

            {/* Loan Documents */}
            <Card className="p-4">
              <h4 className="text-lg mb-3 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-[#007AFF]" />
                Loan Documents
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">Loan Agreement</span>
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">Credit Report</span>
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">Payment Schedule</span>
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};