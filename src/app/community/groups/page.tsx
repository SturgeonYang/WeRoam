// filepath: d:\weroam\WeRoam\src\app\community\groups\page.tsx
'use client';

import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

const GROUPS = [
  { name: '广西', members: 32939, desc: '山水秘境 · 桂林周边/阳朔结伴群' },
  { name: '四川', members: 50147, desc: '成都·川西·九寨沟深度游攻略群' },
  { name: '内蒙古', members: 30777, desc: '草原露营 · 自驾穿越 · 星空摄影群' },
];

export default function CommunityGroupsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-yellow-50">
      <Navbar />

      {/* 顶部黄条 */}
      <div className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-300 py-10">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-sm text-yellow-900/80 mb-2">在这里</p>
            <h1 className="text-3xl font-bold text-yellow-950 mb-3">
              寻找旅行搭子 · 加入目的地攻略群
            </h1>
            <p className="text-sm text-yellow-900/80 max-w-xl">
              可以添加实用的旅行攻略，帮助其他旅行者，更能找到同路人一起出发。
            </p>
          </div>
          <div className="w-full md:w-auto">
            <div className="bg-white rounded-full shadow-inner flex items-center px-4 py-2 max-w-md md:max-w-sm">
              <input
                className="flex-1 bg-transparent border-0 focus:outline-none text-sm px-2"
                placeholder="搜索你想去的目的地"
              />
              <span className="text-gray-400 text-lg">🔍</span>
            </div>
          </div>
        </div>
      </div>

      {/* 内容 */}
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* 返回社区 */}
        <button
          onClick={() => router.push('/community')}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-2"
        >
          ← 返回游记广场
        </button>

        {/* “我的攻略群” 按钮 */}
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold text-gray-900">热门目的地攻略群</h2>
          <button className="inline-flex items-center px-4 py-2 rounded-full bg-black text-white text-sm font-semibold shadow hover:bg-gray-900">
            我的攻略群
          </button>
        </div>

        {/* 攻略群卡片列表 */}
        <div className="grid md:grid-cols-3 gap-6">
          {GROUPS.map((g) => (
            <div
              key={g.name}
              className="bg-white rounded-3xl shadow-md overflow-hidden border border-yellow-100 flex flex-col hover:shadow-lg transition-shadow"
            >
              {/* 封面占位，将来可以换真实图片 */}
              <div className="h-40 bg-gradient-to-tr from-yellow-100 via-yellow-50 to-yellow-200" />
              <div className="p-4 flex-1 flex flex-col">
                <div className="text-base font-semibold text-gray-900 mb-1 flex items-center gap-1">
                  <span className="text-lg">📍</span>
                  <span>{g.name}</span>
                </div>
                <p className="text-xs text-gray-500 mb-2">{g.desc}</p>
                <div className="text-xs text-gray-400 mb-3">
                  {g.members.toLocaleString()} 人已加入
                </div>
                <button className="mt-auto w-full rounded-full bg-yellow-400 hover:bg-yellow-500 text-white text-sm font-semibold py-2 shadow-sm transition-colors">
                  立即入群 +
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 预留：更多分组/分页 */}
        {/* 将来可以在这里加更多城市、分页、筛选等 */}
      </div>
    </div>
  );
}