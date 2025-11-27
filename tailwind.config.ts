import type { Config } from "next";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      // 1. 定义关键帧（动作轨迹）
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' }, // 起点和终点：原位
          '50%': { transform: 'translateY(-10px)' },  // 中间点：向上浮动 10px
        },
      },
      // 2. 定义动画名称（把上面的动作应用起来）
      animation: {
        'float': 'float 3s ease-in-out infinite', // 3秒完成一次，缓入缓出，无限循环
      },
    },
  },
  plugins: [],
};

export default config;