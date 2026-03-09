"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils/cn";

interface StreamingTextProps {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
}

export function StreamingText({
  text,
  speed = 20,
  className,
  onComplete,
}: StreamingTextProps) {
  const [displayedText, setDisplayedText] = useState("");
  const indexRef = useRef(0);
  const prevTextRef = useRef("");

  useEffect(() => {
    if (text === prevTextRef.current) return;
    prevTextRef.current = text;
    indexRef.current = 0;
    setDisplayedText("");

    const interval = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayedText(text.slice(0, indexRef.current + 1));
        indexRef.current++;
      } else {
        clearInterval(interval);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, onComplete]);

  return (
    <span className={cn("whitespace-pre-wrap", className)}>
      {displayedText}
      {displayedText.length < text.length && (
        <span className="inline-block w-0.5 h-4 bg-[var(--accent-primary)] animate-pulse ml-0.5 align-text-bottom" />
      )}
    </span>
  );
}
