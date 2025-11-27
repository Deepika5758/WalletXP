import React, { useState } from 'react';
import { X, Receipt, Camera, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import ExpenseScanner from './ExpenseScanner';

const CATEGORIES = [
  { value: 'food', label: '🍔 Food', color: 'bg-orange-500' },
  { value: 'transport', label: '🚗 Transport', color: 'bg-blue-500' },
  { value: 'shopping', label: '🛍️ Shopping', color: 'bg-pink-500' },
  { value: 'entertainment', label: '🎬 Entertainment', color: 'bg-purple-500' },
  { value: 'utilities', label: '💡 Utilities', color: 'bg-yellow-500' },
  { value: 'healthcare', label: '🏥 Healthcare', color: 'bg-red-500' },
  { value: 'education', label: '📚 Education', color: 'bg-indigo-500' },
  { value: 'rent', label: '🏠 Rent', color: 'bg-gray-500' },
  { value: 'groceries', label: '🛒 Groceries', color: 'bg-green-500' },
  { value: 'other', label: '📦 Other', color: 'bg-slate-500' },
];

export default function AddExpenseModal({ isOpen, onClose, onSubmit }) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [isFixed, setIsFixed] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || !category) return;
    
    onSubmit({
      amount: parseFloat(amount),
      category,
      description,
      is_fixed: isFixed,
      date: new Date().toISOString().split('T')[0]
    });
    
    resetForm();
    onClose();
  };

  const handleScannedExpense = (expense) => {
    setAmount(expense.amount.toString());
    setCategory(expense.category);
    setDescription(expense.description);
    setShowScanner(false);
  };

  const resetForm = () => {
    setAmount('');
    setCategory('');
    setDescription('');
    setIsFixed(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Add Expense
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowScanner(true)}
                className="flex-1 h-12 border-dashed border-2"
              >
                <Camera className="w-4 h-4 mr-2" />
                Scan Receipt
              </Button>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or enter manually</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-lg font-semibold"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <Input
                placeholder="What was this expense for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Checkbox
                id="fixed"
                checked={isFixed}
                onCheckedChange={setIsFixed}
              />
              <label htmlFor="fixed" className="text-sm text-gray-600">
                This is a fixed monthly expense
              </label>
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Expense
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      <ExpenseScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onExpenseDetected={handleScannedExpense}
      />
    </>
  );
}
