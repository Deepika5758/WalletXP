import React, { useState } from 'react';
import { Target, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function CreateGoalModal({ isOpen, onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [frequency, setFrequency] = useState('daily');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !targetAmount || !deadline) return;
    
    onSubmit({
      name,
      target_amount: parseFloat(targetAmount),
      current_amount: 0,
      start_date: new Date().toISOString().split('T')[0],
      deadline,
      frequency,
      status: 'active'
    });
    
    setName('');
    setTargetAmount('');
    setDeadline('');
    setFrequency('daily');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Create Saving Goal
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Goal Name</label>
            <Input
              placeholder="E.g., Emergency Fund, Vacation, New Phone"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Amount (₹)</label>
            <Input
              type="number"
              placeholder="50000"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              className="text-lg font-semibold"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
            <Input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Saving Frequency</label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600">
              <Plus className="w-4 h-4 mr-2" />
              Create Goal
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
