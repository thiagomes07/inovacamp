import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from './AppProvider';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';
import { 
  ArrowLeft,
  Shield,
  Key,
  Fingerprint,
  Smartphone,
  Eye,
  EyeOff,
  Clock,
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react';

export const SecuritySettingsScreen: React.FC = () => {
  const { setCurrentScreen } = useApp();
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [showDevices, setShowDevices] = useState(false);

  const connectedDevices = [
    {
      id: 1,
      name: 'iPhone 14 Pro',
      type: 'Mobile',
      lastAccess: '2 minutos atrás',
      location: 'São Paulo, SP',
      current: true
    },
    {
      id: 2,
      name: 'MacBook Pro',
      type: 'Desktop',
      lastAccess: '1 hora atrás',
      location: 'São Paulo, SP',
      current: false
    },
    {
      id: 3,
      name: 'iPad Air',
      type: 'Tablet',
      lastAccess: '1 dia atrás',
      location: 'Rio de Janeiro, RJ',
      current: false
    }
  ];

  const securityLog = [
    {
      id: 1,
      action: 'Login realizado',
      device: 'iPhone 14 Pro',
      time: '2 minutos atrás',
      success: true
    },
    {
      id: 2,
      action: 'Senha alterada',
      device: 'MacBook Pro',
      time: '3 dias atrás',
      success: true
    },
    {
      id: 3,
      action: 'Tentativa de login falhada',
      device: 'Desconhecido',
      time: '1 semana atrás',
      success: false
    }
  ];

  const handleDeviceRemoval = (deviceId: number) => {
    toast.success('Dispositivo removido com sucesso');
  };

  return (
    <div className="min-h-screen swapin-gradient pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 swapin-glass border-b border-white/10">
        <div className="flex items-center justify-between p-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentScreen('config')}
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </motion.button>
          
          <h1 className="text-white">Segurança</h1>
          
          <div className="w-10" /> {/* Spacer */}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Security Status */}
        <Card className="swapin-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white flex items-center">
              <Shield className="w-5 h-5 text-emerald-400 mr-2" />
              Status de Segurança
            </h3>
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
              Alto
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-white/5 rounded-lg">
              <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-white/80 text-sm">2FA Ativo</p>
            </div>
            <div className="text-center p-3 bg-white/5 rounded-lg">
              <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-white/80 text-sm">Biometria</p>
            </div>
            <div className="text-center p-3 bg-white/5 rounded-lg">
              <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-white/80 text-sm">Senha Forte</p>
            </div>
            <div className="text-center p-3 bg-white/5 rounded-lg">
              <AlertTriangle className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <p className="text-white/80 text-sm">KYC Pendente</p>
            </div>
          </div>
        </Card>

        {/* Authentication Methods */}
        <Card className="swapin-card p-6">
          <h3 className="text-white mb-4 flex items-center">
            <Key className="w-5 h-5 text-blue-400 mr-2" />
            Métodos de Autenticação
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                  <Fingerprint className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-white">Biometria</p>
                  <p className="text-white/60 text-sm">Digital e Face ID</p>
                </div>
              </div>
              <Switch
                checked={biometricEnabled}
                onCheckedChange={setBiometricEnabled}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-white">Autenticação em Dois Fatores</p>
                  <p className="text-white/60 text-sm">SMS e App Authenticator</p>
                </div>
              </div>
              <Switch
                checked={twoFactorEnabled}
                onCheckedChange={setTwoFactorEnabled}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-white">Alertas de Login</p>
                  <p className="text-white/60 text-sm">Notificações para novos acessos</p>
                </div>
              </div>
              <Switch
                checked={loginAlerts}
                onCheckedChange={setLoginAlerts}
              />
            </div>
          </div>
        </Card>

        {/* Password Security */}
        <Card className="swapin-card p-6">
          <h3 className="text-white mb-4 flex items-center">
            <Key className="w-5 h-5 text-purple-400 mr-2" />
            Senha e Acesso
          </h3>
          
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start bg-white/5 border-white/10 hover:bg-white/10"
              onClick={() => toast.success('Redirecionando para alteração de senha...')}
            >
              <Key className="w-4 h-4 mr-2" />
              Alterar Senha
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start bg-white/5 border-white/10 hover:bg-white/10"
              onClick={() => toast.success('Configurando questões de segurança...')}
            >
              <Shield className="w-4 h-4 mr-2" />
              Questões de Segurança
            </Button>
          </div>
        </Card>

        {/* Connected Devices */}
        <Card className="swapin-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white flex items-center">
              <Smartphone className="w-5 h-5 text-cyan-400 mr-2" />
              Dispositivos Conectados
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDevices(!showDevices)}
              className="text-emerald-400 hover:bg-white/10"
            >
              {showDevices ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
          
          {showDevices && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              {connectedDevices.map((device) => (
                <div key={device.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                      <Smartphone className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="text-white text-sm">{device.name}</p>
                        {device.current && (
                          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                            Atual
                          </Badge>
                        )}
                      </div>
                      <p className="text-white/60 text-xs">{device.lastAccess} • {device.location}</p>
                    </div>
                  </div>
                  {!device.current && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeviceRemoval(device.id)}
                      className="text-red-400 hover:bg-red-500/20"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </motion.div>
          )}
        </Card>

        {/* Security Log */}
        <Card className="swapin-card p-6">
          <h3 className="text-white mb-4 flex items-center">
            <Clock className="w-5 h-5 text-orange-400 mr-2" />
            Atividade Recente
          </h3>
          
          <div className="space-y-3">
            {securityLog.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${log.success ? 'bg-emerald-400' : 'bg-red-400'}`} />
                  <div>
                    <p className="text-white text-sm">{log.action}</p>
                    <p className="text-white/60 text-xs">{log.device} • {log.time}</p>
                  </div>
                </div>
                {log.success ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Emergency Actions */}
        <Card className="swapin-card p-6">
          <h3 className="text-white mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
            Ações de Emergência
          </h3>
          
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start border-red-500/30 text-red-400 hover:bg-red-500/20"
              onClick={() => toast.error('Conta temporariamente bloqueada')}
            >
              Bloquear Conta Temporariamente
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start border-orange-500/30 text-orange-400 hover:bg-orange-500/20"
              onClick={() => toast.success('Desconectando todos os dispositivos...')}
            >
              Desconectar Todos os Dispositivos
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};