import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, FileText, Copy, Check, DollarSign, Download, Calendar } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { MaskedInput } from '../../../shared/components/ui/MaskedInput';
import { toast } from 'sonner@2.0.3';

interface BoletoDepositProps {
  onBack: () => void;
  onComplete: () => void;
}

type BoletoStep = 'amount' | 'boleto-details';

export const BoletoDeposit: React.FC<BoletoDepositProps> = ({ onBack, onComplete }) => {
  const [currentStep, setCurrentStep] = useState<BoletoStep>('amount');
  const [amount, setAmount] = useState('');
  const [boletoGenerated, setBoletoGenerated] = useState(false);
  const [barcodeCopied, setBarcodeCopied] = useState(false);

  const handleAmountNext = () => {
    if (!amount || parseFloat(amount.replace(/[^\d,]/g, '').replace(',', '.')) <= 0) {
      toast.error('Digite um valor válido');
      return;
    }
    setCurrentStep('boleto-details');
    setBoletoGenerated(true);
  };

  const copyBarcode = () => {
    navigator.clipboard.writeText(mockBoletoData.barcode);
    setBarcodeCopied(true);
    toast.success('Código de barras copiado!');
    setTimeout(() => setBarcodeCopied(false), 2000);
  };

  const downloadBoleto = () => {
    toast.success('Download do boleto iniciado!');
    // In production, this would trigger actual PDF download
  };

  const handleComplete = () => {
    const numericAmount = parseFloat(amount.replace(/[^\d,]/g, '').replace(',', '.'));
    toast.success(`Depósito de R$ ${numericAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} confirmado!`);
    onComplete();
  };

  const numericAmount = amount ? parseFloat(amount.replace(/[^\d,]/g, '').replace(',', '.')) : 0;

  // Mock boleto data
  const now = new Date();
  const dueDate = new Date(now);
  dueDate.setDate(dueDate.getDate() + 3); // 3 days from now

  const mockBoletoData = {
    barcode: '00190000090123456789012345678901234567890123456789',
    digitableLine: '00190.00009 01234.567890 12345.678901 2 34567890123456789',
    dueDate: dueDate.toLocaleDateString('pt-BR'),
    documentNumber: '000000001',
    amount: numericAmount,
    beneficiary: 'Swapin Fintech Ltda',
    cnpj: '12.345.678/0001-90'
  };

  const renderAmountStep = () => (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Button
          onClick={onBack}
          variant="outline"
          size="sm"
          className="border-gray-600"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white">Depósito via Boleto</h1>
          <p className="text-gray-300">Digite o valor que deseja receber</p>
        </div>
      </div>

      <Card className="backdrop-blur-md bg-white/10 border-white/20 p-6 space-y-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-orange-600/20 flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-8 h-8 text-orange-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Qual valor deseja receber?</h2>
          <p className="text-gray-300">O boleto será gerado instantaneamente</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-white font-medium mb-2 block">Valor do depósito</label>
            <MaskedInput
              mask="currency"
              placeholder="R$ 0,00"
              value={amount}
              onChange={setAmount}
              className="text-lg h-14"
            />
          </div>

          {/* Quick amount buttons */}
          <div className="grid grid-cols-3 gap-3">
            {['500', '1000', '2000'].map((quickAmount) => (
              <Button
                key={quickAmount}
                variant="outline"
                onClick={() => setAmount(`R$ ${quickAmount},00`)}
                className="border-gray-600 text-gray-300 hover:bg-orange-600/10 hover:border-orange-600"
              >
                R$ {quickAmount}
              </Button>
            ))}
          </div>

          <Button
            onClick={handleAmountNext}
            className="w-full bg-orange-600 hover:bg-orange-700 py-3"
            disabled={!amount}
          >
            Gerar boleto
          </Button>
        </div>

        {/* Info about boleto */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-400 font-semibold text-sm">i</span>
            </div>
            <div>
              <p className="text-blue-300 font-medium mb-1">Sobre o boleto</p>
              <p className="text-blue-200 text-sm">
                O boleto terá vencimento em 3 dias e pode ser pago em qualquer banco, 
                casa lotérica ou pelo internet banking.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderBoletoDetailsStep = () => (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Button
          onClick={() => setCurrentStep('amount')}
          variant="outline"
          size="sm"
          className="border-gray-600"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white">Boleto Gerado</h1>
          <p className="text-gray-300">Seu boleto está pronto para pagamento</p>
        </div>
      </div>

      <Card className="backdrop-blur-md bg-white/10 border-white/20 p-6 space-y-6">
        {/* Success indicator */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-green-600/20 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Boleto gerado com sucesso!</h2>
          <p className="text-gray-300">Você pode pagar até {mockBoletoData.dueDate}</p>
        </div>

        {/* Amount and details */}
        <div className="bg-gray-800/50 rounded-xl p-4 space-y-3">
          <div className="text-center border-b border-gray-600 pb-3">
            <p className="text-gray-300 mb-1">Valor do boleto</p>
            <p className="text-3xl font-bold text-orange-400">
              R$ {numericAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-400">Vencimento:</span>
              <p className="text-white">{mockBoletoData.dueDate}</p>
            </div>
            <div>
              <span className="text-gray-400">Documento:</span>
              <p className="text-white">{mockBoletoData.documentNumber}</p>
            </div>
            <div className="col-span-2">
              <span className="text-gray-400">Beneficiário:</span>
              <p className="text-white">{mockBoletoData.beneficiary}</p>
            </div>
          </div>
        </div>

        {/* Barcode */}
        <div className="bg-gray-800/50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-300 font-medium">Código de barras:</span>
            <Button 
              size="sm" 
              variant="outline"
              onClick={copyBarcode}
              className={`${barcodeCopied ? 'bg-orange-600 border-orange-600' : 'border-gray-600'} transition-colors`}
            >
              {barcodeCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          <div className="font-mono text-sm text-white bg-gray-900 p-3 rounded-lg break-all">
            {mockBoletoData.barcode}
          </div>
        </div>

        {/* Digitable line */}
        <div className="bg-gray-800/50 rounded-xl p-4">
          <span className="text-gray-300 font-medium mb-3 block">Linha digitável:</span>
          <div className="font-mono text-sm text-white bg-gray-900 p-3 rounded-lg">
            {mockBoletoData.digitableLine}
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <Button
            onClick={downloadBoleto}
            variant="outline"
            className="w-full border-orange-600 text-orange-400 hover:bg-orange-600/10"
          >
            <Download className="w-4 h-4 mr-2" />
            Baixar boleto (PDF)
          </Button>

          <Button
            onClick={handleComplete}
            className="w-full bg-orange-600 hover:bg-orange-700 py-3"
          >
            Já paguei o boleto
          </Button>
        </div>

        {/* Instructions */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <h3 className="text-blue-300 font-medium mb-2">Como pagar:</h3>
          <ul className="text-blue-200 text-sm space-y-1">
            <li>• Internet banking: cole o código de barras</li>
            <li>• App do banco: escaneie o código de barras</li>
            <li>• Agência/lotérica: apresente o boleto impresso</li>
            <li>• ATM: digite a linha digitável</li>
          </ul>
        </div>

        {/* Warning about due date */}
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-yellow-400" />
            <p className="text-yellow-300 font-medium">Vencimento em 3 dias</p>
          </div>
          <p className="text-yellow-200 text-sm mt-1">
            Após o vencimento, o boleto pode ter juros ou não ser aceito.
          </p>
        </div>
      </Card>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {currentStep === 'amount' ? renderAmountStep() : renderBoletoDetailsStep()}
    </motion.div>
  );
};