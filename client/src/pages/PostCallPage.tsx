import React from 'react';
import { TranscriptStudio } from '../components/postCall/TranscriptStudio';

export const PostCallPage: React.FC = () => {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <TranscriptStudio />
    </div>
  );
};
