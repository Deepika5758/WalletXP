import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/components/auth/AuthContext';
import { base44 } from '@/api/base44Client';
import LessonCard from '@/components/lessons/LessonCard';
import LessonViewer from '@/components/lessons/LessonViewer';
import { ArrowLeft, BookOpen, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

const PLACEHOLDER_LESSONS = [
  {
    title: "What is an Emergency Fund?",
    xp_reward: 150,
    cards: [
      { title: "Introduction", content: "An emergency fund is money set aside specifically for unexpected expenses or financial emergencies. It acts as a financial safety net that can help you avoid debt when life throws unexpected challenges your way." },
      { title: "Why It Matters", content: "Without an emergency fund, a sudden job loss, medical emergency, or major car repair could lead to high-interest debt or financial hardship. Having savings gives you peace of mind and financial security." },
      { title: "How Much to Save", content: "Financial experts recommend having 3-6 months of living expenses saved. Start small - even ₹5,000 to ₹10,000 can help cover minor emergencies like a doctor's visit or home repair." },
      { title: "Starting Small", content: "Begin by setting a goal of ₹10,000. Once reached, gradually increase your target. Small, consistent savings add up quickly over time." },
      { title: "Where to Keep It", content: "Keep your emergency fund in a separate savings account that's easily accessible. Look for accounts with good interest rates but avoid locking the money in fixed deposits." },
      { title: "Building the Habit", content: "Set up automatic transfers to your emergency fund each month. Treat it like a bill that must be paid. Even ₹500-1000 per month makes a difference." },
      { title: "When to Use It", content: "Only use your emergency fund for true emergencies: job loss, medical emergencies, urgent home or car repairs. Avoid using it for planned expenses or wants." },
      { title: "What's NOT an Emergency", content: "A sale at your favorite store is not an emergency. Neither is a vacation or a new gadget. Be disciplined about what qualifies as an emergency." },
      { title: "Replenishing After Use", content: "After using your emergency fund, make replenishing it a priority. Adjust your budget to rebuild it as quickly as possible." },
      { title: "The 50/30/20 Rule", content: "Consider the 50/30/20 budget: 50% for needs, 30% for wants, and 20% for savings. Part of that 20% should go to your emergency fund." },
      { title: "Emergency vs Opportunity", content: "Sometimes opportunities require quick cash too. Having an emergency fund means you won't miss good opportunities or be forced into bad financial decisions." },
      { title: "Family Considerations", content: "If you have dependents, aim for a larger emergency fund. More people mean more potential emergencies and higher monthly expenses to cover." },
      { title: "Insurance Complement", content: "An emergency fund complements insurance. Insurance covers specific risks, while your fund covers deductibles and situations insurance doesn't cover." },
      { title: "Mental Benefits", content: "Beyond financial security, an emergency fund provides mental peace. Knowing you can handle unexpected expenses reduces stress and anxiety about money." },
      { title: "Take Action Today", content: "Start today, no matter how small. Open a separate savings account and set up your first automatic transfer. Your future self will thank you." }
    ]
  },
  {
    title: "Needs vs Wants",
    xp_reward: 120,
    cards: [
      { title: "Understanding the Difference", content: "Needs are essential expenses required for survival and basic functioning: food, shelter, utilities, healthcare, and basic clothing. Wants are things that improve your quality of life but aren't necessary for survival." },
      { title: "The Challenge", content: "In today's world of marketing and social media, the line between needs and wants has become blurred. Advertisers work hard to make wants feel like needs." },
      { title: "Examples of Needs", content: "Basic housing, groceries, electricity, water, basic phone service, essential medications, work-appropriate clothing, and transportation to work are all needs." },
      { title: "Examples of Wants", content: "Dining out, streaming subscriptions, the latest smartphone, designer clothes, luxury items, and entertainment are wants - nice to have but not essential." },
      { title: "The Gray Area", content: "Some things fall in between. A car might be a need for work, but a luxury car is a want. A phone is often necessary, but the newest model is a want." },
      { title: "Prioritization Strategy", content: "Always cover your needs first before spending on wants. Create a budget that allocates money for needs, then decide how much can go toward wants." },
      { title: "The Waiting Game", content: "Before buying a want, wait 24-48 hours. If you still want it after waiting, consider if it fits your budget. Impulse purchases often lead to regret." },
      { title: "Quality vs Quantity", content: "Sometimes spending more on a need makes sense if it lasts longer. A quality winter coat is a need; ten cheap ones that fall apart are wasteful." },
      { title: "Social Pressure", content: "Don't let peer pressure turn wants into perceived needs. Your financial health is more important than keeping up appearances." },
      { title: "The Joy of Wants", content: "Wants aren't bad! They bring joy and improve life quality. The key is budgeting for them responsibly rather than sacrificing needs." },
      { title: "Tracking Your Spending", content: "Track your spending for a month. Categorize each purchase as a need or want. The results might surprise you and help identify areas to cut back." },
      { title: "Creating Balance", content: "A healthy budget includes both needs and wants. Denying all wants leads to budget burnout. Find a sustainable balance." },
      { title: "Future Planning", content: "Remember that some wants today can be needs tomorrow. Saving for education or retirement is investing in future needs." },
      { title: "Teaching Others", content: "Share this knowledge with family members, especially children. Understanding needs vs wants early builds lifelong financial literacy." },
      { title: "Action Step", content: "Review your last month's expenses. Identify one want you can reduce or eliminate to put that money toward savings or paying off debt." }
    ]
  },
  {
    title: "The Power of Savings",
    xp_reward: 130,
    cards: [
      { title: "Why Save?", content: "Saving money provides financial security, freedom, and options. It's the foundation of wealth building and protects you from life's uncertainties." },
      { title: "Compound Interest Magic", content: "When you save in interest-bearing accounts, your money earns interest on interest. Over time, this compound effect can significantly grow your wealth." },
      { title: "The Rule of 72", content: "Divide 72 by your interest rate to see how long it takes to double your money. At 8% return, your money doubles in 9 years. Start early!" },
      { title: "Pay Yourself First", content: "Treat savings like a non-negotiable expense. Set aside money for savings before spending on anything else. Automate it for best results." },
      { title: "Different Savings Goals", content: "Have different savings buckets: emergency fund, short-term goals (vacation, gadgets), medium-term (car, wedding), and long-term (retirement, house)." },
      { title: "Starting with Little", content: "Don't wait until you earn more to start saving. Even ₹100-500 per week adds up. The habit matters more than the amount initially." },
      { title: "Cutting Expenses", content: "Find small ways to cut expenses: cook at home, use public transport, cancel unused subscriptions. Redirect these savings to your accounts." },
      { title: "The Latte Factor", content: "Small daily expenses add up. A ₹200 daily coffee = ₹6,000/month = ₹72,000/year. Identify your 'latte factors' and redirect some of that money." },
      { title: "Savings Accounts vs Investments", content: "Keep emergency funds in liquid savings accounts. For long-term goals, consider investments like mutual funds or fixed deposits for better returns." },
      { title: "Avoiding Lifestyle Inflation", content: "When income increases, resist the urge to increase spending proportionally. Instead, increase your savings rate with each raise." },
      { title: "Setting SMART Goals", content: "Make savings goals Specific, Measurable, Achievable, Relevant, and Time-bound. 'Save ₹50,000 for emergency fund in 10 months' is a SMART goal." },
      { title: "Tracking Progress", content: "Regularly check your savings progress. Seeing growth motivates you to continue. Use apps or spreadsheets to track your journey." },
      { title: "Dealing with Setbacks", content: "Sometimes you'll need to dip into savings. That's okay - that's what it's for. Just make replenishing a priority afterward." },
      { title: "The Freedom Savings Bring", content: "Savings give you freedom: to leave a bad job, handle emergencies calmly, take opportunities, and eventually retire comfortably." },
      { title: "Start Now", content: "The best time to start saving was yesterday. The second best time is now. Open a savings account today and set up your first automatic transfer." }
    ]
  },
  {
    title: "Understanding Tax Invoices",
    xp_reward: 140,
    cards: [
      { title: "What is a Tax Invoice?", content: "A tax invoice is a document issued by a seller to a buyer that provides details about a transaction including taxes charged. It's essential for claiming tax deductions and maintaining financial records." },
      { title: "Why It Matters", content: "Tax invoices help you track expenses for tax purposes, claim GST input credit if you're a business, and serve as proof of purchase for warranty claims or returns." },
      { title: "Key Components", content: "A valid tax invoice must include: seller's GSTIN, invoice number, date, buyer details, description of goods/services, quantity, value, tax rate, and total amount." },
      { title: "GST Breakdown", content: "In India, GST (Goods and Services Tax) is shown separately on invoices. You'll see CGST and SGST for local purchases, or IGST for interstate purchases." },
      { title: "Invoice vs Receipt", content: "A tax invoice is issued before payment and includes tax details. A receipt confirms payment was made. Both serve different purposes in record-keeping." },
      { title: "Digital Invoices", content: "E-invoices are increasingly common and are equally valid as paper invoices. Keep digital copies organized in folders by month or category." },
      { title: "For Individuals", content: "Even if you're not a business, keeping tax invoices helps track spending, claim insurance, return defective products, and verify charges on your bank statement." },
      { title: "Common Tax Rates", content: "GST rates in India vary: 5% for essential items, 12% and 18% for most goods, and 28% for luxury items. Know these to spot billing errors." },
      { title: "Checking for Errors", content: "Always verify: correct tax rate applied, math is accurate, your details are correct, and the total matches what you paid. Errors are common." },
      { title: "Organizing Your Invoices", content: "Create a system: physical folders for paper invoices, digital folders for e-invoices. Sort by month or category. Keep for at least 3 years." },
      { title: "Business Benefits", content: "If you run a business, proper tax invoices are crucial for claiming input tax credit, reducing your tax liability, and staying compliant with tax laws." },
      { title: "When to Request One", content: "Always request a tax invoice for significant purchases, especially for electronics, appliances, and services. It's your right as a consumer." },
      { title: "Understanding HSN/SAC Codes", content: "HSN (for goods) and SAC (for services) codes on invoices help identify the exact tax rate that should apply. Check these for expensive purchases." },
      { title: "Missing Invoice?", content: "If you lose an invoice, contact the seller for a duplicate. Many businesses can reissue invoices from their records. Keep backups!" },
      { title: "Action Item", content: "Start today: create a folder system for your invoices. Review recent purchases and ensure you have invoices for major expenses." }
    ]
  },
  {
    title: "Budget Planning Essentials",
    xp_reward: 160,
    cards: [
      { title: "What is Budgeting?", content: "Budgeting is creating a plan for your money. It helps you understand where your money goes, prioritize spending, and achieve financial goals." },
      { title: "Why Budget?", content: "Without a budget, money disappears without purpose. Budgeting reveals spending patterns, helps eliminate waste, and ensures you live within your means." },
      { title: "Know Your Income", content: "Start by calculating your total monthly income after taxes. Include salary, freelance income, investment returns, and any other regular money coming in." },
      { title: "Track Your Expenses", content: "For one month, track every rupee spent. Use apps, spreadsheets, or a notebook. Categorize expenses: housing, food, transport, entertainment, etc." },
      { title: "The 50/30/20 Framework", content: "Allocate 50% of income to needs (rent, utilities, groceries), 30% to wants (entertainment, dining out), and 20% to savings and debt repayment." },
      { title: "Fixed vs Variable Expenses", content: "Fixed expenses stay the same (rent, EMIs). Variable expenses fluctuate (groceries, entertainment). Focus on optimizing variable expenses first." },
      { title: "Setting Categories", content: "Create spending categories that match your lifestyle: housing, utilities, groceries, transportation, healthcare, personal care, entertainment, savings." },
      { title: "Allocating Amounts", content: "Based on your income and tracked expenses, set realistic limits for each category. Be honest about your spending habits while pushing for improvement." },
      { title: "Building in Buffer", content: "Include a miscellaneous category for unexpected small expenses. Life rarely goes exactly as planned, and a buffer prevents budget breakdown." },
      { title: "Prioritizing Debt", content: "If you have high-interest debt, budget extra for payments. The interest saved will free up money for other goals faster." },
      { title: "Monthly Review", content: "At month's end, compare actual spending to your budget. Identify where you overspent or underspent. Adjust next month's budget accordingly." },
      { title: "Using Technology", content: "Budget apps can automate tracking and categorization. But even a simple spreadsheet works. Choose a method you'll actually use consistently." },
      { title: "Involving Family", content: "If you share finances, budget together. Everyone should understand the plan and their role in sticking to it. Financial teamwork matters." },
      { title: "Handling Irregular Income", content: "If your income varies, budget based on your lowest expected month. In good months, save the extra. This creates stability." },
      { title: "Start Simple", content: "Your first budget won't be perfect. Start with basic categories, track for a month, and refine. Consistency beats perfection." }
    ]
  }
];

export default function Learn() {
  const { user, updateUser } = useAuth();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      loadLessons();
    }
  }, [user]);

  const loadLessons = async () => {
    try {
      let data = await base44.entities.Lesson.list();
      setLessons(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteLesson = async (lesson) => {
    const completedLessons = user.completed_lessons || [];
    if (completedLessons.includes(lesson.id)) return;

    const newXP = (user.xp_points || 0) + lesson.xp_reward;
    const newLevel = Math.floor(newXP / 1000) + 1;
    
    let badges = [...(user.badges || ['Beginner'])];
    if (newLevel % 5 === 0 && newLevel > user.level) {
      const badgeNames = {
        5: 'Bronze Saver',
        10: 'Silver Saver',
        15: 'Gold Saver',
        20: 'Platinum Saver',
        25: 'Diamond Saver'
      };
      if (badgeNames[newLevel] && !badges.includes(badgeNames[newLevel])) {
        badges.push(badgeNames[newLevel]);
      }
    }

    await updateUser({
      xp_points: newXP,
      level: newLevel,
      completed_lessons: [...completedLessons, lesson.id],
      badges
    });
  };

  const handleUploadLesson = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            content_sections: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  content: { type: "string" }
                }
              }
            }
          }
        }
      });

      if (result.status === 'success' && result.output) {
        const cards = result.output.content_sections || [];
        await base44.entities.Lesson.create({
          title: result.output.title || 'Uploaded Lesson',
          cards: cards.slice(0, 20),
          xp_reward: 100
        });
        loadLessons();
        setShowUpload(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const isLessonCompleted = (lessonId) => {
    return (user.completed_lessons || []).includes(lessonId);
  };

  if (!user) {
    window.location.href = createPageUrl('Login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 to-pink-500 pt-6 pb-8 px-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link to={createPageUrl('Home')}>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <h1 className="text-xl font-bold text-white">Financial Lessons</h1>
            </div>
            
            {user.is_creator && (
              <Button
                onClick={() => setShowUpload(true)}
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                <Upload className="w-5 h-5 mr-2" />
                Upload
              </Button>
            )}
          </div>
          
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-white" />
              <span className="text-white font-semibold">
                {(user.completed_lessons || []).length} / {lessons.length} Lessons Completed
              </span>
            </div>
            <div className="mt-2 h-2 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full transition-all"
                style={{ width: `${((user.completed_lessons || []).length / Math.max(lessons.length, 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-lg mx-auto px-4 pt-6">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading lessons...</div>
        ) : (
          <div className="space-y-4">
            {lessons.map((lesson, index) => (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <LessonCard
                  lesson={lesson}
                  isCompleted={isLessonCompleted(lesson.id)}
                  onClick={() => setSelectedLesson(lesson)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Lesson Viewer */}
      {selectedLesson && (
        <LessonViewer
          lesson={selectedLesson}
          isCompleted={isLessonCompleted(selectedLesson.id)}
          onClose={() => setSelectedLesson(null)}
          onComplete={handleCompleteLesson}
        />
      )}

      {/* Upload Modal */}
      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Lesson (PDF)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Upload a PDF file and it will be converted into lesson cards automatically.
            </p>
            <Input
              type="file"
              accept=".pdf"
              onChange={handleUploadLesson}
              disabled={uploading}
            />
            {uploading && (
              <div className="flex items-center gap-2 text-indigo-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing document...</span>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
