'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useSupabase';

interface Reaction {
  id: string;
  stream_id: string;
  user_id?: string;
  reaction_type: 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry';
  reaction_emoji: string;
  timestamp: string;
  stream_time_seconds?: number;
}

interface ReactionCount {
  reaction_type: string;
  count: number;
  emoji: string;
}

interface StreamReactionsProps {
  streamId: string;
  isLive: boolean;
  className?: string;
}

const reactionTypes = [
  { type: 'like', emoji: '👍', label: 'Like' },
  { type: 'love', emoji: '❤️', label: 'Love' },
  { type: 'laugh', emoji: '😂', label: 'Laugh' },
  { type: 'wow', emoji: '😮', label: 'Wow' },
  { type: 'sad', emoji: '😢', label: 'Sad' },
  { type: 'angry', emoji: '😡', label: 'Angry' }
];

export default function StreamReactions({ 
  streamId, 
  isLive, 
  className = '' 
}: StreamReactionsProps) {
  const { user } = useAuth();
  const [reactionCounts, setReactionCounts] = useState<ReactionCount[]>([]);
  const [recentReactions, setRecentReactions] = useState<Reaction[]>([]);
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [animatingReactions, setAnimatingReactions] = useState<Reaction[]>([]);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1';

  useEffect(() => {
    fetchReactionCounts();
    setupRealtimeSubscription();
  }, [streamId]);

  const fetchReactionCounts = async () => {
    try {
      // This would be a custom endpoint to get reaction counts
      // For now, we'll simulate it
      const counts = reactionTypes.map(type => ({
        reaction_type: type.type,
        count: Math.floor(Math.random() * 100), // Simulated data
        emoji: type.emoji
      }));
      setReactionCounts(counts);
    } catch (error) {
      console.error('Error fetching reaction counts:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel(`stream:${streamId}:reactions`)
      .on('broadcast', { event: 'reaction_added' }, (payload) => {
        const newReaction = payload.payload as Reaction;
        
        // Update counts
        setReactionCounts(prev => prev.map(count => 
          count.reaction_type === newReaction.reaction_type
            ? { ...count, count: count.count + 1 }
            : count
        ));

        // Add to recent reactions
        setRecentReactions(prev => [newReaction, ...prev.slice(0, 9)]);

        // Add to animating reactions
        setAnimatingReactions(prev => [...prev, newReaction]);
        
        // Remove from animating after animation completes
        setTimeout(() => {
          setAnimatingReactions(prev => prev.filter(r => r.id !== newReaction.id));
        }, 3000);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const addReaction = async (reactionType: string, emoji: string) => {
    if (!user || !isLive) return;

    try {
      const response = await fetch(`${API_BASE}/stream-chat/${streamId}/reactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          reaction_type: reactionType,
          reaction_emoji: emoji,
          stream_time_seconds: Math.floor(Date.now() / 1000) // Current time in seconds
        })
      });

      if (response.ok) {
        setUserReaction(reactionType);
        
        // Reset user reaction after 2 seconds
        setTimeout(() => {
          setUserReaction(null);
        }, 2000);
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const getTotalReactions = () => {
    return reactionCounts.reduce((total, count) => total + count.count, 0);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Floating Reactions Animation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {animatingReactions.map((reaction) => (
          <FloatingReaction
            key={reaction.id}
            emoji={reaction.reaction_emoji}
            onComplete={() => {
              setAnimatingReactions(prev => prev.filter(r => r.id !== reaction.id));
            }}
          />
        ))}
      </div>

      {/* Reaction Buttons */}
      {isLive && (
        <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-900">React to Stream</h4>
            <div className="text-xs text-gray-500">
              {getTotalReactions()} reactions
            </div>
          </div>

          {/* Reaction Buttons Grid */}
          <div className="grid grid-cols-3 gap-2">
            {reactionTypes.map((reaction) => {
              const count = reactionCounts.find(c => c.reaction_type === reaction.type)?.count || 0;
              const isSelected = userReaction === reaction.type;
              
              return (
                <button
                  key={reaction.type}
                  onClick={() => addReaction(reaction.type, reaction.emoji)}
                  disabled={!user}
                  className={`flex flex-col items-center p-2 rounded-lg transition-all duration-200 ${
                    isSelected
                      ? 'bg-blue-100 border-2 border-blue-500 scale-110'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent hover:scale-105'
                  } ${!user ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <span className="text-2xl mb-1">{reaction.emoji}</span>
                  <span className="text-xs font-medium text-gray-700">
                    {count > 0 ? count : ''}
                  </span>
                </button>
              );
            })}
          </div>

          {!user && (
            <div className="mt-3 text-center">
              <p className="text-xs text-gray-500">Sign in to react</p>
            </div>
          )}
        </div>
      )}

      {/* Reaction Summary (for ended streams) */}
      {!isLive && reactionCounts.some(c => c.count > 0) && (
        <div className="bg-white rounded-lg p-4 shadow">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Stream Reactions ({getTotalReactions()})
          </h4>
          <div className="flex flex-wrap gap-2">
            {reactionCounts
              .filter(count => count.count > 0)
              .sort((a, b) => b.count - a.count)
              .map((count) => (
                <div
                  key={count.reaction_type}
                  className="flex items-center gap-1 bg-gray-100 rounded-full px-3 py-1"
                >
                  <span className="text-lg">{count.emoji}</span>
                  <span className="text-sm font-medium text-gray-700">
                    {count.count}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Recent Reactions Feed */}
      {recentReactions.length > 0 && (
        <div className="mt-4 bg-white rounded-lg p-4 shadow">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Recent Reactions</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {recentReactions.slice(0, 5).map((reaction) => (
              <div key={reaction.id} className="flex items-center gap-2 text-sm">
                <span className="text-lg">{reaction.reaction_emoji}</span>
                <span className="text-gray-600">
                  Someone reacted {formatTimeAgo(reaction.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Floating Reaction Animation Component
function FloatingReaction({ 
  emoji, 
  onComplete 
}: { 
  emoji: string; 
  onComplete: () => void; 
}) {
  const [position, setPosition] = useState({
    x: Math.random() * 80 + 10, // Random position between 10% and 90%
    y: 100
  });

  useEffect(() => {
    // Animate upward
    const animation = setInterval(() => {
      setPosition(prev => ({
        ...prev,
        y: prev.y - 2
      }));
    }, 50);

    // Complete animation after 3 seconds
    const timeout = setTimeout(() => {
      clearInterval(animation);
      onComplete();
    }, 3000);

    return () => {
      clearInterval(animation);
      clearTimeout(timeout);
    };
  }, [onComplete]);

  return (
    <div
      className="absolute text-3xl animate-pulse pointer-events-none z-10"
      style={{
        left: `${position.x}%`,
        bottom: `${position.y}px`,
        transform: 'translateX(-50%)',
        opacity: Math.max(0, (position.y - 20) / 80) // Fade out as it goes up
      }}
    >
      {emoji}
    </div>
  );
}

// Helper function to format time ago
function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  }
}
