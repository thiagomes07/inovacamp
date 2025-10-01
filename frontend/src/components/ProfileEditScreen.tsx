import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from './AppProvider';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { toast } from 'sonner@2.0.3';
import { 
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Camera,
  Save,
  Edit3
} from 'lucide-react';

export const ProfileEditScreen: React.FC = () => {
  const { setCurrentScreen, user } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '+55 11 99999-9999',
    address: 'São Paulo, SP',
    birthDate: '1990-01-01',
    occupation: 'Desenvolvedor',
    income: 'R$ 8.000',
  });

  const handleSave = () => {
    toast.success('Perfil atualizado com sucesso!');
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
          
          <h1 className="text-white">Perfil</h1>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsEditing(!isEditing)}
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
          >
            <Edit3 className="w-5 h-5 text-white" />
          </motion.button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Profile Photo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="relative inline-block">
            <Avatar className="w-24 h-24 mx-auto">
              <AvatarImage src="" />
              <AvatarFallback className="bg-emerald-500/20 text-emerald-400 text-2xl">
                {formData.name.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            {isEditing && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center"
                onClick={() => toast.success('Funcionalidade de upload em breve')}
              >
                <Camera className="w-5 h-5 text-white" />
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Personal Information */}
        <Card className="swapin-card p-6">
          <h3 className="text-white mb-4 flex items-center">
            <User className="w-5 h-5 text-emerald-400 mr-2" />
            Informações Pessoais
          </h3>
          
          <div className="space-y-4">
            <div>
              <Label className="text-white/80">Nome Completo</Label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                disabled={!isEditing}
                className="bg-white/5 border-white/10 text-white mt-1"
              />
            </div>
            
            <div>
              <Label className="text-white/80">Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={!isEditing}
                className="bg-white/5 border-white/10 text-white mt-1"
              />
            </div>
            
            <div>
              <Label className="text-white/80">Telefone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                disabled={!isEditing}
                className="bg-white/5 border-white/10 text-white mt-1"
              />
            </div>
            
            <div>
              <Label className="text-white/80">Data de Nascimento</Label>
              <Input
                type="date"
                value={formData.birthDate}
                onChange={(e) => handleInputChange('birthDate', e.target.value)}
                disabled={!isEditing}
                className="bg-white/5 border-white/10 text-white mt-1"
              />
            </div>
          </div>
        </Card>

        {/* Address Information */}
        <Card className="swapin-card p-6">
          <h3 className="text-white mb-4 flex items-center">
            <MapPin className="w-5 h-5 text-blue-400 mr-2" />
            Endereço
          </h3>
          
          <div>
            <Label className="text-white/80">Endereço Completo</Label>
            <Input
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              disabled={!isEditing}
              className="bg-white/5 border-white/10 text-white mt-1"
            />
          </div>
        </Card>

        {/* Professional Information */}
        <Card className="swapin-card p-6">
          <h3 className="text-white mb-4 flex items-center">
            <Calendar className="w-5 h-5 text-purple-400 mr-2" />
            Informações Profissionais
          </h3>
          
          <div className="space-y-4">
            <div>
              <Label className="text-white/80">Profissão</Label>
              <Input
                value={formData.occupation}
                onChange={(e) => handleInputChange('occupation', e.target.value)}
                disabled={!isEditing}
                className="bg-white/5 border-white/10 text-white mt-1"
              />
            </div>
            
            <div>
              <Label className="text-white/80">Renda Mensal</Label>
              <Input
                value={formData.income}
                onChange={(e) => handleInputChange('income', e.target.value)}
                disabled={!isEditing}
                className="bg-white/5 border-white/10 text-white mt-1"
              />
            </div>
          </div>
        </Card>

        {/* Save Button */}
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Button
              onClick={handleSave}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              <Save className="w-5 h-5 mr-2" />
              Salvar Alterações
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};