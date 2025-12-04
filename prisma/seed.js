const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始填充数据...');

  // 1. 清理旧数据 (注意删除顺序，先删子表，再删主表)
  // 使用 deleteMany 清空表，但在 Postgres 中 ID 自增计数器不会重置
  // 如果介意 ID 不是从 1 开始，可以使用 migrate reset 命令（见下文）
  try {
    await prisma.comment.deleteMany();
    await prisma.travelPost.deleteMany();
    await prisma.user.deleteMany();
    console.log('🗑️  旧数据已清理');
  } catch (error) {
    console.log('⚠️  清理数据时遇到小问题（可能是表还不存在），继续执行...');
  }

  // 2. 创建用户
  const usersData = [
    {
      email: 'alex@example.com',
      username: 'alex_traveler',
      password: 'password123',
      nickname: 'Alex在路上',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
      bio: '摄影师，喜欢捕捉光影。',
      location: '北京',
    },
    {
      email: 'sarah@example.com',
      username: 'sarah_wanderlust',
      password: 'password123',
      nickname: 'Sarah的旅行日记',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      bio: '辞职旅行中，环游世界。',
      location: '上海',
    },
    {
      email: 'mike@example.com',
      username: 'mike_hiker',
      password: 'password123',
      nickname: '徒步狂人Mike',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
      bio: '用脚步丈量世界。',
      location: '成都',
    },
    {
      email: 'emily@example.com',
      username: 'emily_foodie',
      password: 'password123',
      nickname: 'Emily吃遍全球',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
      bio: '唯有美食与爱不可辜负。',
      location: '广州',
    },
  ];

  const users = [];
  for (const u of usersData) {
    const user = await prisma.user.create({ data: u });
    users.push(user);
  }
  console.log(`👤 已创建 ${users.length} 个用户`);

  // 3. 创建游记
  const postsData = [
    {
      title: '我的第一次西藏之旅',
      content: '布达拉宫真的太壮观了，蓝天白云，空气虽然稀薄但是景色绝美。强烈推荐大家一生一定要去一次！',
      coverImage: 'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=800',
      tags: JSON.stringify(['风景', '西藏', '自驾']),
      location: '拉萨',
      likeCount: 128,
    },
    {
      title: '重庆火锅探店指南',
      content: '在解放碑附近发现一家超好吃的巷子老火锅，微辣已经是我的极限了，但是真的香！',
      coverImage: 'https://images.unsplash.com/photo-1624300603538-1207400f4116?w=800',
      tags: JSON.stringify(['美食', '重庆', '探店']),
      location: '重庆',
      likeCount: 85,
    },
    {
      title: '秋天的京都',
      content: '清水寺的红叶红了，满山遍野的红色，配合古建筑，真的非常有韵味。',
      coverImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800',
      tags: JSON.stringify(['风景', '日本', '摄影']),
      location: '京都',
      likeCount: 230,
    },
    {
      title: '冰岛极光追逐记',
      content: '终于在雷克雅未克的郊外看到了欧若拉女神的裙摆，绿色的光带在夜空中舞动，那一刻真的感动得想哭。',
      coverImage: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800',
      tags: JSON.stringify(['冰岛', '极光', '自驾']),
      location: '冰岛',
      likeCount: 542,
    },
    {
      title: '大理的慢生活',
      content: '在洱海边租了一辆小电驴，吹着风，看着苍山，这才是向往的生活啊。喜洲古镇的粑粑很好吃。',
      coverImage: 'https://images.unsplash.com/photo-1527684651001-731c474bbb5a?w=800',
      tags: JSON.stringify(['大理', '洱海', '慢生活']),
      location: '大理',
      likeCount: 156,
    },
    {
      title: '圣托里尼的日落',
      content: '蓝顶白墙的建筑，爱琴海的湛蓝，这里拥有世界上最美的日落。伊亚小镇的悬崖步道虽然人多，但景色绝对值得。',
      coverImage: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800',
      tags: JSON.stringify(['希腊', '海岛', '日落']),
      location: '希腊',
      likeCount: 320,
    },
    {
      title: '新疆独库公路自驾',
      content: '一天经历四季，雪山、草原、峡谷，风景在路上。路况比较复杂，建议老司机驾驶，注意高反和天气变化。',
      coverImage: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800',
      tags: JSON.stringify(['自驾', '公路旅行', '探险']),
      location: '新疆',
      likeCount: 410,
    },
    {
      title: '巴黎左岸的咖啡时光',
      content: '在花神咖啡馆点一杯拿铁，看着塞纳河畔的人来人往，感受法式的浪漫与慵懒。卢浮宫就在不远处。',
      coverImage: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
      tags: JSON.stringify(['巴黎', '咖啡', '人文']),
      location: '巴黎',
      likeCount: 175,
    },
    {
      title: '巴厘岛冲浪初体验',
      content: '库塔海滩的浪非常适合新手，教练很耐心，第一次站起来的感觉太棒了！冲浪完再来个SPA，简直完美。',
      coverImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
      tags: JSON.stringify(['冲浪', '运动', '海滩']),
      location: '巴厘岛',
      likeCount: 210,
    },
  ];

  for (const post of postsData) {
    // 随机选一个用户作为作者
    const randomUser = users[Math.floor(Math.random() * users.length)];
    
    // 这里 randomUser.id 是数字，直接赋值给 authorId 即可
    await prisma.travelPost.create({
      data: {
        ...post,
        published: true,
        authorId: randomUser.id, 
      },
    });
  }
  console.log(`📝 已创建 ${postsData.length} 篇游记`);

  console.log('✅ 数据填充完成！');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
