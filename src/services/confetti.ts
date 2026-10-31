import confetti from 'canvas-confetti';

export function triggerFireworkConfetti() {
  confetti({
    particleCount: 45,
    spread: 60,
    origin: { y: 0.8 },
    colors: ['#FF0033', '#FFAA00', '#FF4444', '#FFFFFF']
  });
}

export function triggerBigCelebration() {
  confetti({
    particleCount: 80,
    spread: 90,
    origin: { y: 0.6 },
    colors: ['#FF0033', '#FF3366', '#FFD700', '#FFFFFF']
  });
}
