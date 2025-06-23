
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert as AlertType } from '@/types';
import SolutionProvider from './SolutionProvider';

interface AlertSolutionModalProps {
  alert: AlertType | null;
  isOpen: boolean;
  onClose: () => void;
}

const AlertSolutionModal: React.FC<AlertSolutionModalProps> = ({ 
  alert, 
  isOpen, 
  onClose 
}) => {
  if (!alert) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Security Solution Guide</DialogTitle>
        </DialogHeader>
        <SolutionProvider alert={alert} />
      </DialogContent>
    </Dialog>
  );
};

export default AlertSolutionModal;
