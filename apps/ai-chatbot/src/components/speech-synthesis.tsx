'use client';

import { PlayIcon, StopIcon } from '#/components/icons';
import { Button } from '#/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '#/components/ui/tooltip';
import { cn } from '#/lib/utils';
import { useEffect, useRef, useState } from 'react';

/**
 * Props for SpeechSynthesis component
 */
interface SpeechSynthesisProps {
  text: string;
  className?: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'default' | 'lg';
}

/**
 * Speech synthesis component for text-to-speech functionality
 * @param text - Text to be spoken
 * @param className - Additional CSS classes
 * @param variant - Button variant style
 * @param size - Button size
 */
export function SpeechSynthesis({
  text,
  className,
  variant = 'ghost',
  size = 'sm',
}: SpeechSynthesisProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Check if speech synthesis is supported
    setIsSupported('speechSynthesis' in window);

    return () => {
      // Cleanup on unmount
      if (utteranceRef.current) {
        speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSpeak = () => {
    if (!isSupported || !text.trim()) return;

    if (isPlaying) {
      // Stop current speech
      speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    // Clean text for speech (remove markdown, HTML, etc.)
    const cleanText = text
      .replace(/[#*_`~]/g, '') // Remove markdown symbols
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\n+/g, '. ') // Convert newlines to pauses
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utteranceRef.current = utterance;

    // Configure speech settings
    utterance.rate = 0.9; // Slightly slower for better comprehension
    utterance.pitch = 1;
    utterance.volume = 0.8;

    // Try to use a high-quality voice if available
    const voices = speechSynthesis.getVoices();
    const preferredVoice =
      voices.find(
        voice =>
          voice.lang.startsWith('en') &&
          (voice.name.includes('Enhanced') || voice.name.includes('Premium')),
      ) ||
      voices.find(voice => voice.lang.startsWith('en')) ||
      voices[0];

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    // Event handlers
    utterance.onstart = () => {
      setIsPlaying(true);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      utteranceRef.current = null;
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      utteranceRef.current = null;
    };

    // Start speaking
    speechSynthesis.speak(utterance);
  };

  if (!isSupported) {
    return null; // Don't render if not supported
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={cn(
            'transition-colors duration-200',
            isPlaying && 'text-blue-600 hover:text-blue-700',
            className,
          )}
          onClick={handleSpeak}
          disabled={!text.trim()}
        >
          {isPlaying ? <StopIcon size={16} /> : <PlayIcon size={16} />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{isPlaying ? 'Stop speech' : 'Read aloud'}</TooltipContent>
    </Tooltip>
  );
}

interface AutoSpeechProps {
  text: string;
  enabled: boolean;
  delay?: number;
}

export function AutoSpeech({ text, enabled, delay = 1000 }: AutoSpeechProps) {
  const [hasSpoken, setHasSpoken] = useState(false);

  useEffect(() => {
    if (!enabled || !text.trim() || hasSpoken) return;
    if (!('speechSynthesis' in window)) return;

    const timer = setTimeout(() => {
      const cleanText = text
        .replace(/[#*_`~]/g, '')
        .replace(/<[^>]*>/g, '')
        .replace(/\n+/g, '. ')
        .replace(/\s+/g, ' ')
        .trim();

      if (cleanText) {
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 0.6; // Lower volume for auto-speech

        const voices = speechSynthesis.getVoices();
        const preferredVoice =
          voices.find(voice => voice.lang.startsWith('en') && voice.name.includes('Enhanced')) ||
          voices.find(voice => voice.lang.startsWith('en'));

        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        speechSynthesis.speak(utterance);
        setHasSpoken(true);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [text, enabled, delay, hasSpoken]);

  return null; // This component doesn't render anything
}
