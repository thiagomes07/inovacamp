import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from './AppProvider';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { toast } from 'sonner@2.0.3';
import { 
  ArrowLeft,
  User,
  Shield,
  Bell,
  CreditCard,
  Eye,
  HelpCircle,
  Palette,
  Globe,
  Download,
  FileText,
  ChevronRight,
  Settings,
  Lock,
  Smartphone,
  Mail,
  MessageSquare,
  DollarSign,
  Camera,
  Key,
  Fingerprint,
  Moon,
  Sun,
  Languages,
  Archive
} from 'lucide-react';

interface ConfigSectionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  onClick?: () => void;
  badge?: string;
}

const ConfigSection: React.FC<ConfigSectionProps> = ({ 
  icon, 
  title, 
  description, 
  action, 
  onClick, 
  badge 
}) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className="swapin-card p-4 mb-3 cursor-pointer"
    onClick={onClick}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
          {icon}
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-white">{title}</h3>
            {badge && (
              <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                {badge}
              </Badge>
            )}
          </div>
          <p className="text-white/60">{description}</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {action}
        <ChevronRight className="w-5 h-5 text-white/40" />
      </div>
    </div>
  </motion.div>
);

export const ConfigScreen: React.FC = () => {
  const { setCurrentScreen, user } = useApp();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const handleSectionClick = (section: string) => {
    switch (section) {
      case 'profile':
        setCurrentScreen('profile-edit');
        break;
      case 'security':
        setCurrentScreen('security-settings');
        break;
      case 'notifications':
      case 'appearance':
      case 'region':
      case 'privacy':
      case 'backup':
      case 'help':
      case 'legal':
        setActiveSection(section);
        break;
      default:
        toast.success(`Abrindo ${section}...`);
    }
  };

  const renderMainConfig = () => (
    <div className="p-6 space-y-6">
      {/* Profile Header */}
      <div className="swapin-card p-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Avatar className="w-16 h-16">
              <AvatarImage src="" />
              <AvatarFallback className="bg-emerald-500/20 text-emerald-400">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center"
              onClick={() => toast.success('Recurso de alteração de foto em breve')}
            >
              <Camera className="w-4 h-4 text-white" />
            </motion.button>
          </div>
          <div>
            <h2 className="text-white text-xl">{user?.name || 'Usuário'}</h2>
            <p className="text-white/60">{user?.email || 'user@swapin.com'}</p>
            <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 mt-1">
              {user?.role === 'borrower' ? 'Tomador' : 'Emprestador'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Account & Profile */}
      <div>
        <h3 className="text-white/80 mb-3">Conta e Perfil</h3>
        <ConfigSection
          icon={<User className="w-5 h-5 text-emerald-400" />}
          title="Informações Pessoais"
          description="Gerencie seus dados pessoais e documentos"
          onClick={() => handleSectionClick('profile')}
        />
        <ConfigSection
          icon={<Shield className="w-5 h-5 text-blue-400" />}
          title="Segurança"
          description="Senha, autenticação e segurança da conta"
          onClick={() => handleSectionClick('security')}
          badge="2FA Ativo"
        />
        <ConfigSection
          icon={<CreditCard className="w-5 h-5 text-purple-400" />}
          title="Configurações da Conta"
          description="Limites, preferências e configurações bancárias"
          onClick={() => handleSectionClick('account')}
        />
      </div>

      {/* Notifications & Preferences */}
      <div>
        <h3 className="text-white/80 mb-3">Notificações e Preferências</h3>
        <ConfigSection
          icon={<Bell className="w-5 h-5 text-yellow-400" />}
          title="Notificações"
          description="Configure alertas e notificações"
          action={
            <Switch
              checked={notificationsEnabled}
              onCheckedChange={setNotificationsEnabled}
              onClick={(e) => e.stopPropagation()}
            />
          }
          onClick={() => handleSectionClick('notifications')}
        />
        <ConfigSection
          icon={<Palette className="w-5 h-5 text-pink-400" />}
          title="Aparência"
          description="Tema, cores e personalização"
          action={
            <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
              <Sun className="w-4 h-4 text-white/60" />
              <Switch
                checked={darkMode}
                onCheckedChange={setDarkMode}
              />
              <Moon className="w-4 h-4 text-white/60" />
            </div>
          }
          onClick={() => handleSectionClick('appearance')}
        />
        <ConfigSection
          icon={<Globe className="w-5 h-5 text-green-400" />}
          title="Região e Moedas"
          description="Idioma, moedas e configurações regionais"
          onClick={() => handleSectionClick('region')}
        />
      </div>

      {/* Privacy & Security */}
      <div>
        <h3 className="text-white/80 mb-3">Privacidade e Dados</h3>
        <ConfigSection
          icon={<Eye className="w-5 h-5 text-indigo-400" />}
          title="Privacidade"
          description="Controle de dados e configurações de privacidade"
          onClick={() => handleSectionClick('privacy')}
        />
        <ConfigSection
          icon={<Download className="w-5 h-5 text-cyan-400" />}
          title="Backup e Recuperação"
          description="Backup de dados e recuperação de conta"
          onClick={() => handleSectionClick('backup')}
        />
      </div>

      {/* Help & Legal */}
      <div>
        <h3 className="text-white/80 mb-3">Suporte e Legal</h3>
        <ConfigSection
          icon={<HelpCircle className="w-5 h-5 text-orange-400" />}
          title="Ajuda e Suporte"
          description="Central de ajuda, FAQ e contato"
          onClick={() => handleSectionClick('help')}
        />
        <ConfigSection
          icon={<FileText className="w-5 h-5 text-gray-400" />}
          title="Termos e Privacidade"
          description="Políticas, termos de uso e regulamentações"
          onClick={() => handleSectionClick('legal')}
        />
      </div>

      {/* Quick Actions */}
      <div className="flex space-x-3">
        <Button
          variant="outline"
          className="flex-1 bg-white/5 border-white/10 hover:bg-white/10"
          onClick={() => toast.success('Saindo da conta...')}
        >
          Sair da Conta
        </Button>
        <Button
          variant="destructive"
          className="flex-1"
          onClick={() => toast.error('Função de exclusão temporariamente desabilitada')}
        >
          Excluir Conta
        </Button>
      </div>
    </div>
  );

  const renderSecuritySection = () => (
    <div className="p-6 space-y-4">
      <h2 className="text-white text-xl mb-6">Segurança</h2>
      
      <ConfigSection
        icon={<Key className="w-5 h-5 text-emerald-400" />}
        title="Alterar Senha"
        description="Modificar sua senha de acesso"
        onClick={() => toast.success('Tela de alteração de senha em breve')}
      />
      
      <ConfigSection
        icon={<Fingerprint className="w-5 h-5 text-blue-400" />}
        title="Autenticação Biométrica"
        description="Digital e reconhecimento facial"
        action={
          <Switch
            checked={biometricEnabled}
            onCheckedChange={setBiometricEnabled}
            onClick={(e) => e.stopPropagation()}
          />
        }
        onClick={() => handleSectionClick('biometric')}
      />
      
      <ConfigSection
        icon={<Smartphone className="w-5 h-5 text-purple-400" />}
        title="Autenticação em Dois Fatores"
        description="SMS e aplicativo autenticador"
        badge="Ativo"
        onClick={() => handleSectionClick('2fa')}
      />
      
      <ConfigSection
        icon={<Shield className="w-5 h-5 text-red-400" />}
        title="Dispositivos Conectados"
        description="Gerencie dispositivos autorizados"
        onClick={() => handleSectionClick('devices')}
      />
    </div>
  );

  const renderNotificationsSection = () => (
    <div className="p-6 space-y-4">
      <h2 className="text-white text-xl mb-6">Notificações</h2>
      
      <ConfigSection
        icon={<Bell className="w-5 h-5 text-yellow-400" />}
        title="Notificações Push"
        description="Alertas instantâneos no dispositivo"
        action={
          <Switch
            checked={notificationsEnabled}
            onCheckedChange={setNotificationsEnabled}
            onClick={(e) => e.stopPropagation()}
          />
        }
      />
      
      <ConfigSection
        icon={<Mail className="w-5 h-5 text-blue-400" />}
        title="Notificações por Email"
        description="Resumos e alertas importantes por email"
        action={
          <Switch
            checked={true}
            onCheckedChange={() => {}}
            onClick={(e) => e.stopPropagation()}
          />
        }
      />
      
      <ConfigSection
        icon={<MessageSquare className="w-5 h-5 text-green-400" />}
        title="SMS"
        description="Códigos de verificação e alertas críticos"
        action={
          <Switch
            checked={true}
            onCheckedChange={() => {}}
            onClick={(e) => e.stopPropagation()}
          />
        }
      />
      
      <ConfigSection
        icon={<DollarSign className="w-5 h-5 text-emerald-400" />}
        title="Alertas de Transação"
        description="Notificações para todas as movimentações"
        action={
          <Switch
            checked={true}
            onCheckedChange={() => {}}
            onClick={(e) => e.stopPropagation()}
          />
        }
      />
    </div>
  );

  const renderCurrentSection = () => {
    switch (activeSection) {
      case 'security':
        return renderSecuritySection();
      case 'notifications':
        return renderNotificationsSection();
      default:
        return renderMainConfig();
    }
  };

  return (
    <div className="min-h-screen swapin-gradient pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 swapin-glass border-b border-white/10">
        <div className="flex items-center justify-between p-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (activeSection) {
                setActiveSection(null);
              } else {
                setCurrentScreen('home');
              }
            }}
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </motion.button>
          
          <div className="text-center">
            <h1 className="text-white">
              {activeSection ? 
                activeSection.charAt(0).toUpperCase() + activeSection.slice(1) : 
                'Configurações'
              }
            </h1>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
            onClick={() => toast.success('Opções avançadas em breve')}
          >
            <Settings className="w-5 h-5 text-white" />
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <motion.div
        key={activeSection || 'main'}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        {renderCurrentSection()}
      </motion.div>
    </div>
  );
};