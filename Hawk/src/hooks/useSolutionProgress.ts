
import { useState, useEffect } from 'react';

interface SolutionProgress {
  alertId: string;
  completedSteps: number[];
  selectedTemplate?: string;
  lastUpdated: string;
}

export const useSolutionProgress = (alertId: string) => {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  const storageKey = `solution-progress-${alertId}`;

  // Load progress from localStorage on mount
  useEffect(() => {
    const savedProgress = localStorage.getItem(storageKey);
    if (savedProgress) {
      try {
        const progress: SolutionProgress = JSON.parse(savedProgress);
        setCompletedSteps(progress.completedSteps || []);
        setSelectedTemplate(progress.selectedTemplate || '');
      } catch (error) {
        console.error('Error loading solution progress:', error);
      }
    }
  }, [storageKey]);

  // Save progress to localStorage whenever it changes
  const saveProgress = (steps: number[], template?: string) => {
    const progress: SolutionProgress = {
      alertId,
      completedSteps: steps,
      selectedTemplate: template || selectedTemplate,
      lastUpdated: new Date().toISOString(),
    };
    
    localStorage.setItem(storageKey, JSON.stringify(progress));
  };

  const toggleStepCompletion = (stepId: number) => {
    const newSteps = completedSteps.includes(stepId)
      ? completedSteps.filter(id => id !== stepId)
      : [...completedSteps, stepId];
    
    setCompletedSteps(newSteps);
    saveProgress(newSteps);
  };

  const updateTemplate = (template: string) => {
    setSelectedTemplate(template);
    saveProgress(completedSteps, template);
  };

  const resetProgress = () => {
    setCompletedSteps([]);
    setSelectedTemplate('');
    localStorage.removeItem(storageKey);
  };

  const getProgressPercentage = (totalSteps: number) => {
    return totalSteps > 0 ? (completedSteps.length / totalSteps) * 100 : 0;
  };

  return {
    completedSteps,
    selectedTemplate,
    toggleStepCompletion,
    updateTemplate,
    resetProgress,
    getProgressPercentage,
  };
};
