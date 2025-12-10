// filepath: d:\weroam\WeRoam\src\app\community\groups\page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const GROUPS = [
  { name: '广西', members: 32939, desc: '山水秘境 · 桂林周边/阳朔结伴群', isMyGroup: false },
  { name: '四川', members: 50147, desc: '成都·川西·九寨沟深度游攻略群', isMyGroup: true },
  { name: '内蒙古', members: 30777, desc: '草原露营 · 自驾穿越 · 星空摄影群', isMyGroup: false },
  { name: '云南', members: 61234, desc: '大理·丽江·香格里拉慢旅行群', isMyGroup: true },
  { name: '西藏', members: 42890, desc: '进藏路线·高原适应·自驾拼车群', isMyGroup: false },
  { name: '海南', members: 25670, desc: '三亚·万宁·冲浪潜水海岛度假群', isMyGroup: false },
  { name: '新疆', members: 38901, desc: '北疆南疆环线 · 秋季自驾摄影群', isMyGroup: true },
  { name: '广东', members: 30111, desc: '粤港澳周末游 · 美食探店拼车群', isMyGroup: false },
  { name: '浙江', members: 27890, desc: '杭州·舟山·莫干山周边度假群', isMyGroup: false },
];

export default function CommunityGroupsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showMyGroups, setShowMyGroups] = useState(false);

  const filteredGroups = GROUPS.filter((g) => {
    const matchesSearch =
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = showMyGroups ? g.isMyGroup : true;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-yellow-50">
      {/* 顶部返回 + 标题区 */}
      <div className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-300 pt-6 pb-10">
        <div className="max-w-5xl mx-auto px-4">
          {/* 返回按钮 */}
          <button
            onClick={() => router.push('/community')}
            className="inline-flex items-center text-sm text-yellow-900 hover:text-yellow-950 mb-4"
          >
            ← 返回
          </button>

          {/* 标题与搜索 */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
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
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <span className="text-gray-400 text-lg">🔍</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 内容 */}
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* “我的攻略群” 按钮 */}
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold text-gray-900">
            {showMyGroups ? '我的攻略群' : '热门目的地攻略群'}
          </h2>
          <button
            onClick={() => setShowMyGroups(!showMyGroups)}
            className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold shadow transition-colors ${
              showMyGroups
                ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                : 'bg-black text-white hover:bg-gray-900'
            }`}
          >
            {showMyGroups ? '显示全部' : '我的攻略群'}
          </button>
        </div>

        {/* 攻略群卡片列表 */}
        <div className="grid md:grid-cols-3 gap-6">
          {filteredGroups.length > 0 ? (
            filteredGroups.map((g) => (
              <div
                key={g.name}
                className="bg-white rounded-3xl shadow-md overflow-hidden border border-yellow-100 flex flex-col hover:shadow-lg transition-shadow"
              >
                {/* 封面二维码占位图 */}
                <div className="h-40 bg-gray-100 flex items-center justify-center relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=WeRoam-${encodeURIComponent(
                      g.name,
                    )}`}
                    alt={`${g.name} 攻略群二维码`}
                    className="w-24 h-24 object-contain rounded-md border border-gray-200 bg-white"
                  />
                  {g.isMyGroup && (
                    <div className="absolute top-2 right-2 bg-yellow-400 text-white text-xs px-2 py-1 rounded-full font-bold shadow-sm">
                      我创建的
                    </div>
                  )}
                </div>

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
            ))
          ) : (
            <div className="col-span-3 text-center py-10 text-gray-500">
              没有找到匹配的攻略群
            </div>
          )}
        </div>

        {/* 预留：更多分组/分页 */}
        {/* 将来可以在这里加更多城市、分页、筛选等 */}
      </div>
    </div>
  );
}