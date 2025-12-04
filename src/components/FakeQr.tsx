'use client';

import { useEffect, useRef } from 'react';

interface FakeQrProps {
  seed: string;
  size?: number;   // 画布尺寸
  modules?: number; // 模块数（N x N）
}

export default function FakeQr({ seed, size = 120, modules = 29 }: FakeQrProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 简单 hash
  const hash = (str: string) => {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = (h * 31 + str.charCodeAt(i)) >>> 0;
    }
    return h;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const n = modules;
    const cell = size / n;

    let state = hash(seed);
    const rand = () => {
      state = (state * 1664525 + 1013904223) >>> 0;
      return state / 0xffffffff;
    };

    // 背景
    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    const drawFinder = (ox: number, oy: number) => {
      const s = 7; // 7x7 定位符
      // 外黑框
      ctx.fillStyle = '#000000';
      ctx.fillRect(ox * cell, oy * cell, s * cell, s * cell);
      // 中白框
      ctx.fillStyle = '#ffffff';
      ctx.fillRect((ox + 1) * cell, (oy + 1) * cell, (s - 2) * cell, (s - 2) * cell);
      // 内黑点
      ctx.fillStyle = '#000000';
      ctx.fillRect((ox + 2) * cell, (oy + 2) * cell, (s - 4) * cell, (s - 4) * cell);
    };

    // 三个角的定位符：左上、右上、左下
    drawFinder(0, 0);
    drawFinder(n - 7, 0);
    drawFinder(0, n - 7);

    // 随机填充其余模块
    ctx.fillStyle = '#000000';
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        // 跳过三个定位符区域
        const inTopLeft = x < 7 && y < 7;
        const inTopRight = x >= n - 7 && y < 7;
        const inBottomLeft = x < 7 && y >= n - 7;
        if (inTopLeft || inTopRight || inBottomLeft) continue;

        // 以前这里有一圈“留边距”的判断，删掉它
        // if (x === 0 || y === 0 || x === n - 1 || y === n - 1) continue;

        // 随机决定是否填充这个格子
        if (rand() > 0.6) {
          ctx.fillRect(x * cell, y * cell, cell, cell);
        }
      }
    }
  }, [seed, size, modules]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="bg-white rounded-md border border-gray-200"
      aria-hidden="true"
    />
  );
}