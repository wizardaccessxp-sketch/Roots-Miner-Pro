import React, { useEffect, useRef } from 'react';

export const GalaxyBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Stars definition
    interface Star {
      x: number;
      y: number;
      radius: number;
      alpha: number;
      speedX: number;
      speedY: number;
      color: string;
      twinkleSpeed: number;
    }

    const starCount = Math.min(180, Math.floor((width * height) / 8000));
    const stars: Star[] = [];
    const starColors = ['#ffffff', '#bae6fd', '#fed7aa', '#e0e7ff', '#fef08a'];

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5 + 0.4,
        alpha: Math.random() * 0.8 + 0.2,
        speedX: (Math.random() - 0.5) * 0.15,
        speedY: (Math.random() - 0.5) * 0.15 - 0.08, // Slow upward cosmic drift
        color: starColors[Math.floor(Math.random() * starColors.length)],
        twinkleSpeed: Math.random() * 0.02 + 0.005,
      });
    }

    // Shooting stars
    interface ShootingStar {
      x: number;
      y: number;
      length: number;
      speed: number;
      angle: number;
      alpha: number;
      active: boolean;
    }

    const shootingStars: ShootingStar[] = [];
    const spawnShootingStar = () => {
      shootingStars.push({
        x: Math.random() * width * 0.8,
        y: Math.random() * (height * 0.5),
        length: Math.random() * 80 + 40,
        speed: Math.random() * 10 + 12,
        angle: (Math.PI / 4) + (Math.random() - 0.5) * 0.2,
        alpha: 1,
        active: true,
      });
    };

    let shootingStarTimer = 0;

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Deep Space Base
      const gradient = ctx.createRadialGradient(
        width * 0.5,
        height * 0.4,
        width * 0.1,
        width * 0.5,
        height * 0.5,
        width * 0.9
      );
      gradient.addColorStop(0, '#0a102b');
      gradient.addColorStop(0.4, '#060a1d');
      gradient.addColorStop(1, '#02040b');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Cosmic Galaxy Nebula Clouds
      const nebula1 = ctx.createRadialGradient(
        width * 0.2,
        height * 0.25,
        10,
        width * 0.2,
        height * 0.25,
        width * 0.45
      );
      nebula1.addColorStop(0, 'rgba(56, 189, 248, 0.07)'); // Cyan
      nebula1.addColorStop(0.5, 'rgba(99, 102, 241, 0.04)'); // Indigo
      nebula1.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = nebula1;
      ctx.fillRect(0, 0, width, height);

      const nebula2 = ctx.createRadialGradient(
        width * 0.8,
        height * 0.7,
        10,
        width * 0.8,
        height * 0.7,
        width * 0.5
      );
      nebula2.addColorStop(0, 'rgba(245, 158, 11, 0.06)'); // Gold/Amber
      nebula2.addColorStop(0.5, 'rgba(168, 85, 247, 0.04)'); // Purple
      nebula2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = nebula2;
      ctx.fillRect(0, 0, width, height);

      // Draw and move stars
      stars.forEach((star) => {
        star.x += star.speedX;
        star.y += star.speedY;

        // Wrap around borders
        if (star.x < 0) star.x = width;
        if (star.x > width) star.x = 0;
        if (star.y < 0) star.y = height;
        if (star.y > height) star.y = 0;

        // Twinkle
        star.alpha += Math.sin(Date.now() * star.twinkleSpeed) * 0.01;
        const clampedAlpha = Math.max(0.15, Math.min(0.95, star.alpha));

        ctx.save();
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = clampedAlpha;
        ctx.shadowBlur = star.radius > 1.2 ? 6 : 0;
        ctx.shadowColor = star.color;
        ctx.fill();
        ctx.restore();
      });

      // Spawn shooting stars periodically
      shootingStarTimer++;
      if (shootingStarTimer > 180 && Math.random() < 0.02) {
        spawnShootingStar();
        shootingStarTimer = 0;
      }

      // Draw shooting stars
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];
        if (!s.active) {
          shootingStars.splice(i, 1);
          continue;
        }

        const endX = s.x - Math.cos(s.angle) * s.length;
        const endY = s.y - Math.sin(s.angle) * s.length;

        const grad = ctx.createLinearGradient(s.x, s.y, endX, endY);
        grad.addColorStop(0, `rgba(255, 255, 255, ${s.alpha})`);
        grad.addColorStop(0.4, `rgba(56, 189, 248, ${s.alpha * 0.6})`);
        grad.addColorStop(1, 'rgba(56, 189, 248, 0)');

        ctx.save();
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        ctx.restore();

        s.x += Math.cos(s.angle) * s.speed;
        s.y += Math.sin(s.angle) * s.speed;
        s.alpha -= 0.015;

        if (s.alpha <= 0 || s.x > width + 100 || s.y > height + 100) {
          s.active = false;
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ width: '100%', height: '100%' }}
    />
  );
};
