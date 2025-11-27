import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Zap, CheckCircle, Plus, GraduationCap, Trophy, ArrowLeft, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';

import LessonCard from '@/components/lessons/LessonCard';
import LessonContent from '@/components/lessons/LessonContent';
import PDFLessonUpload from '@/components/lessons/PDFLessonUpload';

export default function Learn() {
  const [user, setUser] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (err) {
        console.error('Error loading user:', err);
      }
    };
    loadUser();
  }, []);

  // Check if user is admin/owner
  const isOwner = user?.role === 'admin';

  // Fetch lessons
  const { data: lessons = [] } = useQuery({
    queryKey: ['lessons'],
    queryFn: () => base44.entities.Lesson.list()
  });

  // Fetch user progress
  const { data: progress } = useQuery({
    queryKey: ['userProgress', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const results = await base44.entities.UserProgress.filter({ user_email: user.email });
      return results[0];
    },
    enabled: !!user?.email
  });

  // Create lesson mutation
  const createLessonMutation = useMutation({
    mutationFn: async (lessonData) => {
      return await base44.entities.Lesson.create(lessonData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['lessons']);
      setShowUploadForm(false);
      toast.success('Lesson published successfully!');
    }
  });

  // Complete lesson mutation
  const completeLessonMutation = useMutation({
    mutationFn: async (lesson) => {
      const completedLessons = progress?.completed_lessons || [];
      if (completedLessons.includes(lesson.id)) return;

      const newXP = (progress?.total_xp || 0) + lesson.xp_reward;
      const newLevel = Math.floor(newXP / 1000) + 1;

      if (progress?.id) {
        await base44.entities.UserProgress.update(progress.id, {
          total_xp: newXP,
          level: newLevel,
          completed_lessons: [...completedLessons, lesson.id]
        });
      } else {
        await base44.entities.UserProgress.create({
          user_email: user.email,
          total_xp: newXP,
          level: newLevel,
          completed_lessons: [lesson.id]
        });
      }
    },
    onSuccess: (_, lesson) => {
      queryClient.invalidateQueries(['userProgress']);
      setSelectedLesson(null);
      toast.success(`Lesson completed! +${lesson.xp_reward} XP earned! 📚`);
    }
  });

  const isLessonCompleted = (lessonId) => {
    return progress?.completed_lessons?.includes(lessonId);
  };

  const totalXPFromLessons = lessons.reduce((sum, l) => sum + l.xp_reward, 0);
  const earnedXPFromLessons = lessons
    .filter(l => isLessonCompleted(l.id))
    .reduce((sum, l) => sum + l.xp_reward, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to={createPageUrl('Home')}>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-blue-100">
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                  <GraduationCap className="w-8 h-8 text-blue-600" />
                  Financial Lessons
                </h1>
                <p className="text-gray-500">Learn essential money skills and earn XP!</p>
              </div>
            </div>
            
            {/* Only show upload button to owner/admin */}
            {isOwner && (
              <Button
                onClick={() => setShowUploadForm(!showUploadForm)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Lesson
              </Button>
            )}
          </div>
        </motion.div>

        {/* Progress Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg mb-8"
        >
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center gap-2 text-3xl font-bold mb-1">
                <BookOpen className="w-6 h-6" />
                {progress?.completed_lessons?.length || 0} / {lessons.length}
              </div>
              <p className="text-blue-200 text-sm">Lessons Completed</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 text-3xl font-bold mb-1">
                <Zap className="w-6 h-6" />
                {earnedXPFromLessons}
              </div>
              <p className="text-blue-200 text-sm">XP from Lessons</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 text-3xl font-bold mb-1">
                <Trophy className="w-6 h-6" />
                {progress?.level || 1}
              </div>
              <p className="text-blue-200 text-sm">Current Level</p>
            </div>
          </div>
        </motion.div>

        {/* Upload Form (Only visible to owner) */}
        <AnimatePresence>
          {showUploadForm && isOwner && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8"
            >
              <PDFLessonUpload
                onSubmit={(data) => createLessonMutation.mutate(data)}
                isLoading={createLessonMutation.isLoading}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lessons Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
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
            </AnimatePresence>
          </div>

          {lessons.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <GraduationCap className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No lessons available yet</p>
              {isOwner && (
                <p className="text-sm">Click "Upload Lesson" to add your first lesson</p>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Lesson Content Modal */}
      <AnimatePresence>
        {selectedLesson && (
          <LessonContent
            lesson={selectedLesson}
            onComplete={() => completeLessonMutation.mutate(selectedLesson)}
            onClose={() => setSelectedLesson(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
