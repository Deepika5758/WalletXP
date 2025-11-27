import React, { useState } from 'react';
import { PiggyBank, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function AddSavingModal({ isOpen, onClose, goal, onSubmit }) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount) return;
    
    onSubmit({
      goal_id: goal.id,
      amount: parseFloat(amount),
      note,
      date: new Date().toISOString().split('T')[0]
    });
    
    setAmount('');
    setNote('');
    onClose();
  };

  const remaining = goal ? goal.target_amount - goal.current_amount : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PiggyBank className="w-5 h-5" />
            Add Savings to {goal?.name}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 bg-indigo-50 rounded-xl text-center">
            <p className="text-sm text-indigo-600">Remaining to save</p>
            <p className="text-2xl font-bold text-indigo-700">₹{remaining.toLocaleString()}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-lg font-semibold"
              max={remaining}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Note (optional)</label>
            <Textarea
              placeholder="E.g., Saved from this week's budget"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
            />
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Savings
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
