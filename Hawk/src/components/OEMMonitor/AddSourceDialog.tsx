
import React, { useState } from 'react';
import { Plus, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AddSourceDialogProps {
  isAddingSource: boolean;
  onAddSource: (name: string, url: string, systemType: string) => Promise<void>;
}

const AddSourceDialog: React.FC<AddSourceDialogProps> = ({ isAddingSource, onAddSource }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newSource, setNewSource] = useState({
    name: '',
    url: '',
    system_type: '',
  });

  const handleSubmit = async () => {
    await onAddSource(newSource.name, newSource.url, newSource.system_type);
    setNewSource({ name: '', url: '', system_type: '' });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="flex items-center gap-1">
          <Plus className="h-4 w-4" /> Add Source
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add OEM Source</DialogTitle>
          <DialogDescription>
            Add a vendor website to monitor for security vulnerabilities
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Source Name</Label>
            <Input 
              id="name" 
              placeholder="e.g. Microsoft Windows Updates" 
              value={newSource.name}
              onChange={(e) => setNewSource({...newSource, name: e.target.value})}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="url">Website URL</Label>
            <Input 
              id="url" 
              placeholder="e.g. https://msrc.microsoft.com/update-guide" 
              value={newSource.url}
              onChange={(e) => setNewSource({...newSource, url: e.target.value})}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="system_type">System Type</Label>
            <Input 
              id="system_type" 
              placeholder="e.g. Windows" 
              value={newSource.system_type}
              onChange={(e) => setNewSource({...newSource, system_type: e.target.value})}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isAddingSource || !newSource.name || !newSource.url || !newSource.system_type}
          >
            {isAddingSource ? <Loader className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
            Add Source
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddSourceDialog;
