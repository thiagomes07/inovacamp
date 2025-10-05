import React from 'react';
import { motion } from 'motion/react';
import { Card } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { 
  CheckCircle2, 
  Circle, 
  Upload, 
  ExternalLink,
  Plus,
  FileText,
  Image as ImageIcon
} from 'lucide-react';

interface Mission {
  id: string;
  title: string;
  description: string;
  points: number;
  icon: React.ElementType;
  completed: boolean;
  type: 'verification' | 'document' | 'connection' | 'payment' | 'custom';
  category?: string;
}

interface ScoreMissionCardProps {
  mission: Mission;
  onComplete: () => void;
  onUpload: () => void;
  onConnect: () => void;
}

export const ScoreMissionCard: React.FC<ScoreMissionCardProps> = ({
  mission,
  onComplete,
  onUpload,
  onConnect,
}) => {
  const Icon = mission.icon;

  const getActionButton = () => {
    if (mission.completed) {
      return (
        <Button 
          size="sm" 
          disabled
          className="bg-green-600/50 text-green-300 cursor-not-allowed"
        >
          <CheckCircle2 className="w-4 h-4 mr-1" />
          Concluído
        </Button>
      );
    }

    switch (mission.type) {
      case 'document':
        return (
          <Button 
            size="sm" 
            onClick={onUpload}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Upload className="w-4 h-4 mr-1" />
            Enviar docs
          </Button>
        );

      case 'connection':
        return (
          <Button 
            size="sm" 
            onClick={onConnect}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            Conectar
          </Button>
        );

      case 'verification':
        if (mission.id === 'verify_identity') {
          return (
            <Button 
              size="sm" 
              onClick={onUpload}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <ImageIcon className="w-4 h-4 mr-1" />
              Verificar
            </Button>
          );
        }
        return (
          <Button 
            size="sm" 
            onClick={onComplete}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-1" />
            Concluir
          </Button>
        );

      case 'payment':
        return (
          <Button 
            size="sm" 
            disabled
            className="bg-gray-600/50 text-gray-400 cursor-not-allowed"
          >
            Aguardando empréstimo
          </Button>
        );

      default:
        return (
          <Button 
            size="sm" 
            onClick={onComplete}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-1" />
            Fazer agora
          </Button>
        );
    }
  };

  const getStatusIcon = () => {
    if (mission.completed) {
      return <CheckCircle2 className="w-5 h-5 text-green-400" />;
    }
    return <Circle className="w-5 h-5 text-gray-500" />;
  };

  const getPointsBadge = () => {
    const pointsColor = mission.points >= 50 
      ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      : mission.points >= 30
      ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      : mission.points >= 20
      ? 'bg-green-500/20 text-green-400 border-green-500/30'
      : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';

    return (
      <Badge 
        variant="outline" 
        className={`${pointsColor} text-xs`}
      >
        +{mission.points} pts
      </Badge>
    );
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`p-4 transition-all duration-300 ${
        mission.completed 
          ? 'bg-green-500/10 border-green-500/30 backdrop-blur-md' 
          : 'bg-gray-800/50 border-gray-700 backdrop-blur-md hover:border-gray-600'
      }`}>
        {/* Desktop Layout (≥640px) */}
        <div className="hidden sm:flex items-start gap-4">
          {/* Status Icon */}
          <div className="mt-1 flex-shrink-0">
            {getStatusIcon()}
          </div>

          {/* Mission Icon */}
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            mission.completed 
              ? 'bg-green-500/20' 
              : 'bg-gray-700/50'
          }`}>
            <Icon className={`w-5 h-5 ${
              mission.completed ? 'text-green-400' : 'text-gray-400'
            }`} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1">
                <h3 className={`font-semibold ${
                  mission.completed ? 'text-green-300' : 'text-white'
                }`}>
                  {mission.title}
                </h3>
                <p className={`text-sm ${
                  mission.completed ? 'text-green-200/70' : 'text-gray-400'
                }`}>
                  {mission.description}
                </p>
              </div>
              {getPointsBadge()}
            </div>

            {/* Action Button */}
            <div className="flex justify-end">
              {getActionButton()}
            </div>
          </div>
        </div>

        {/* Mobile Layout (<640px) - Auto Layout Structure */}
        <div className="flex sm:hidden justify-between items-center gap-4">
          {/* Left Group: Status + Icon + Text Block (flex-grow: 1) */}
          <div className="flex-1 flex-shrink-1 basis-0 overflow-hidden">
            <div className="flex items-start gap-3">
              {/* Status Icon */}
              <div className="mt-0.5 flex-shrink-0">
                {getStatusIcon()}
              </div>

              {/* Mission Icon */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                mission.completed 
                  ? 'bg-green-500/20' 
                  : 'bg-gray-700/50'
              }`}>
                <Icon className={`w-4 h-4 ${
                  mission.completed ? 'text-green-400' : 'text-gray-400'
                }`} />
              </div>

              {/* Text Block: Title + Description */}
              <div className="flex flex-col items-start flex-1 min-w-0">
                <h3 className={`text-sm font-semibold leading-tight mb-1 ${
                  mission.completed ? 'text-green-300' : 'text-white'
                }`}>
                  {mission.title}
                </h3>
                <p className={`text-xs leading-relaxed ${
                  mission.completed ? 'text-green-200/70' : 'text-gray-400'
                }`}>
                  {mission.description}
                </p>
              </div>
            </div>
          </div>

          {/* Right Group: Points + Button (flex-shrink: 0) */}
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            {/* Points Badge */}
            {getPointsBadge()}
            
            {/* Action Button */}
            {getActionButton()}
          </div>
        </div>

        {/* Additional Info for specific missions */}
        {mission.id === 'connect_bank' && !mission.completed && (
          <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-blue-400 text-xs">
              🔒 Conexão segura via Open Finance. Seus dados bancários ficam protegidos.
            </p>
          </div>
        )}

        {mission.id === 'first_payment' && !mission.completed && (
          <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-yellow-400 text-xs">
              🏆 Maior bonificação de score! Disponível após aprovação do primeiro empréstimo.
            </p>
          </div>
        )}

        {(mission.id === 'connect_uber' || mission.id === 'connect_ifood') && !mission.completed && (
          <div className="mt-3 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
            <p className="text-purple-400 text-xs">
              ⭐ Para profissionais de transporte e entrega. Aumenta credibilidade do perfil.
            </p>
          </div>
        )}
      </Card>
    </motion.div>
  );
};