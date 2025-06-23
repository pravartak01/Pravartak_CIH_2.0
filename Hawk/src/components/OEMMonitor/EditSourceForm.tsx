
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OEMSource } from '@/types';

interface EditSourceFormProps {
  source: OEMSource;
  onUpdate: (source: OEMSource) => void;
  onCancel: () => void;
}

const EditSourceForm: React.FC<EditSourceFormProps> = ({ source, onUpdate, onCancel }) => {
  const [editedSource, setEditedSource] = React.useState<OEMSource>(source);

  const handleChange = (field: keyof OEMSource, value: string) => {
    setEditedSource((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor={`edit-name-${source.id}`}>Name</Label>
            <Input 
              id={`edit-name-${source.id}`}
              value={editedSource.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor={`edit-url-${source.id}`}>URL</Label>
            <Input 
              id={`edit-url-${source.id}`}
              value={editedSource.url}
              onChange={(e) => handleChange('url', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor={`edit-system-${source.id}`}>System Type</Label>
            <Input 
              id={`edit-system-${source.id}`}
              value={editedSource.system_type}
              onChange={(e) => handleChange('system_type', e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onCancel}>Cancel</Button>
            <Button onClick={() => onUpdate(editedSource)}>Save</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EditSourceForm;
