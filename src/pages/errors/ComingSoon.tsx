import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Rocket } from 'lucide-react';

interface ComingSoonProps {
  title: string;
  description: string;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ title, description }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="p-6 bg-gradient-primary rounded-3xl shadow-glow mb-8 animate-float">
        <Rocket className="w-16 h-16 text-primary-foreground" />
      </div>
      
      <h1 className="text-3xl font-bold mb-3">{title}</h1>
      <p className="text-muted-foreground max-w-md mb-8">{description}</p>
      
      <div className="glass-card rounded-2xl p-6 mb-8">
        <p className="text-sm text-muted-foreground mb-4">Esta sección estará disponible pronto. Mantente atento a las actualizaciones.</p>
        <div className="flex gap-2 justify-center">
          <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
          <div className="w-3 h-3 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.2s' }} />
          <div className="w-3 h-3 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
      
      <Button variant="outline" asChild>
        <Link to="/dashboard">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Dashboard
        </Link>
      </Button>
    </div>
  );
};

export default ComingSoon;
