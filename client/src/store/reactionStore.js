import { create } from 'zustand';

export const useReactionStore = create((set) => ({
  reactions: [],
  questions: [],
  addReaction: (reaction) => set((state) => ({ reactions: [...state.reactions, reaction] })),
  addQuestion: (question) => set((state) => ({ questions: [...state.questions, question] })),
}));
