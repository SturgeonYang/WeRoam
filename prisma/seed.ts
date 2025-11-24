/**
 * Prisma 数据库种子脚本
 * 用于填充测试数据
 * 运行: npm run prisma:seed
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('开始填充测试数据...');

  // 清空现有数据（开发环境）
  await prisma.comment.deleteMany();
  await prisma.travelPost.deleteMany();
  await prisma.user.deleteMany();

  // 创建测试用户
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'zhangsan@example.com',
        username: 'zhangsan',
        password: '$2b$10$YourHashedPasswordHere1', // 实际应用中应该使用 bcrypt 加密
        nickname: '旅行达人张三',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan',
        bio: '热爱旅行，已走过30个国家。喜欢用镜头记录世界的美好。',
        location: '北京',
      },
    }),
    prisma.user.create({
      data: {
        email: 'lisi@example.com',
        username: 'lisi',
        password: '$2b$10$YourHashedPasswordHere2',
        nickname: '美食探索者李四',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisi',
        bio: '美食爱好者，走到哪吃到哪。',
        location: '上海',
      },
    }),
    prisma.user.create({
      data: {
        email: 'wangwu@example.com',
        username: 'wangwu',
        password: '$2b$10$YourHashedPasswordHere3',
        nickname: '摄影师王五',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wangwu',
        bio: '专业摄影师，用镜头讲述旅行故事。',
        location: '成都',
      },
    }),
  ]);

  console.log(`✓ 已创建 ${users.length} 个测试用户`);

  // 创建测试游记
  const posts = await Promise.all([
    prisma.travelPost.create({
      data: {
        title: '北京故宫三日游 - 探索紫禁城的历史与文化',
        content: `这次北京之行，我们用三天时间深度探索了故宫博物院。作为世界上最大的古代宫殿建筑群，故宫的壮观和精美超出了我的想象。

**第一天：午门入口**
从午门进入，穿过太和门，来到气势恢宏的太和殿。站在广场上，感受着这座见证了明清两代历史的建筑散发出的威严与厚重。

**第二天：珍宝馆探秘**
探访了珍宝馆和钟表馆，看到了无数精美的文物。每一件展品都承载着独特的历史故事，让人流连忘返。

**第三天：御花园漫步**
漫步在御花园，欣赏古典园林之美。虽然游客众多，但依然能感受到皇家园林的雅致与宁静。

**旅行小贴士：**
• 建议提前在官网购票，避免现场排队
• 春秋季节游览最佳，天气宜人
• 带上舒适的鞋子，游览需要走很多路
• 可以租用讲解器，了解更多历史背景`,
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800',
          'https://images.unsplash.com/photo-1545893835-abaa50cbe628?w=800',
          'https://images.unsplash.com/photo-1583425423320-2386622cd2e4?w=800',
        ]),
        coverImage: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=1200',
        location: '北京',
        startDate: new Date('2024-10-01'),
        endDate: new Date('2024-10-03'),
        tags: JSON.stringify(['历史文化', '古建筑', '摄影', '攻略']),
        published: true,
        viewCount: 1523,
        likeCount: 234,
        authorId: users[0].id,
      },
    }),
    prisma.travelPost.create({
      data: {
        title: '成都美食探店 - 一次吃遍地道川菜',
        content: `作为一个资深吃货，这次成都之行让我大饱口福！从街头小吃到高档餐厅，每一道菜都让人回味无穷。

**必吃美食清单：**

1. **火锅** - 去了三顾冒菜和小龙坎，麻辣鲜香，欲罢不能
2. **串串香** - 钢管厂五区小郡肝，每一串都是灵魂
3. **夫妻肺片** - 老字号的味道就是不一样
4. **担担面** - 麻辣酸香，一碗下肚暖心暖胃
5. **兔头** - 成都特色，啃兔头是一种技术活

**探店心得：**
成都的美食不仅仅是味道好，更重要的是那种悠闲的生活态度。在茶馆里喝着茶，吃着小吃，看着人来人往，这才是成都的慢生活。

强烈推荐春熙路和锦里，既能购物又能品尝美食，一举两得！`,
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800',
          'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800',
          'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800',
        ]),
        coverImage: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=1200',
        location: '成都',
        startDate: new Date('2024-09-15'),
        endDate: new Date('2024-09-18'),
        tags: JSON.stringify(['美食', '川菜', '火锅', '攻略']),
        published: true,
        viewCount: 2341,
        likeCount: 456,
        authorId: users[1].id,
      },
    }),
    prisma.travelPost.create({
      data: {
        title: '西藏拉萨朝圣之旅 - 心灵的洗涤',
        content: `这是一次说走就走的旅行，也是一次心灵的洗涤。拉萨的蓝天、白云、寺庙，每一处都让人心生敬畏。

**行程安排：**

**Day 1-2：适应高原**
刚到拉萨的前两天，主要是休息适应高原气候。在酒店附近散步，慢慢适应高海拔环境。

**Day 3-4：布达拉宫和大昭寺**
参观了布达拉宫和大昭寺，感受藏传佛教的神圣与庄严。建议提前预约门票，旺季很难买到。

**Day 5-6：纳木错湖**
驱车前往纳木错，那里的美景让人窒息。湖水清澈见底，远处的雪山倒映在湖面上，宛如仙境。

**高原反应小贴士：**
• 到达拉萨后前两天不要剧烈运动
• 多喝水，少洗澡
• 准备好红景天等抗高反药物
• 保持良好的心态，不要过度紧张

这次旅行让我明白，有时候我们需要走得更远，才能看清自己。`,
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1519674556185-1098a81ea6ac?w=800',
          'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800',
          'https://images.unsplash.com/photo-1570655257864-a573216f3f1c?w=800',
        ]),
        coverImage: 'https://images.unsplash.com/photo-1519674556185-1098a81ea6ac?w=1200',
        location: '拉萨',
        startDate: new Date('2024-08-10'),
        endDate: new Date('2024-08-16'),
        tags: JSON.stringify(['西藏', '朝圣', '风景', '摄影', '高原']),
        published: true,
        viewCount: 3456,
        likeCount: 678,
        authorId: users[2].id,
      },
    }),
    prisma.travelPost.create({
      data: {
        title: '杭州西湖春日漫游 - 人间天堂的诗意',
        content: `"上有天堂，下有苏杭"，这次终于来到了向往已久的杭州西湖。春天的西湖，桃红柳绿，美不胜收。

**西湖十景打卡：**

1. 苏堤春晓 - 清晨漫步苏堤，感受春天的气息
2. 断桥残雪 - 虽然不是冬天，但断桥的美依然令人陶醉
3. 曲院风荷 - 荷叶田田，清香阵阵
4. 雷峰夕照 - 登上雷峰塔，俯瞰西湖全景

**美食推荐：**
• 楼外楼的西湖醋鱼
• 知味观的小笼包
• 奎元馆的虾爆鳝面

**住宿建议：**
推荐住在西湖边，虽然价格稍贵，但清晨和傍晚可以欣赏西湖美景，非常值得。

杭州是一座让人来了就不想走的城市，这里有美景、有美食、有历史，还有那份独特的江南韵味。`,
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=800',
          'https://images.unsplash.com/photo-1585164237330-d1f82f6c0c79?w=800',
        ]),
        coverImage: 'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=1200',
        location: '杭州',
        startDate: new Date('2024-04-05'),
        endDate: new Date('2024-04-08'),
        tags: JSON.stringify(['西湖', '春游', '风景', '江南']),
        published: true,
        viewCount: 1876,
        likeCount: 321,
        authorId: users[0].id,
      },
    }),
    prisma.travelPost.create({
      data: {
        title: '上海迪士尼两日游玩攻略',
        content: `作为迪士尼粉，这次终于打卡了上海迪士尼！分享一些省时间、少排队的小技巧。

**必玩项目排名：**

1. **飞跃地平线** - 最热门项目，开园就去抽快速通行证
2. **创极速光轮** - 刺激指数五颗星
3. **加勒比海盗** - 沉浸式体验超棒
4. **七个小矮人矿山车** - 适合全家一起玩

**省钱攻略：**
• 提前在官网或APP买票，有优惠
• 自带食物和水（允许带未开封的食品）
• 避开节假日和周末，人少很多

**省时攻略：**
• 下载官方APP，实时查看项目等待时间
• 利用早享卡提前入园
• 使用快速通行证（FP）

**拍照打卡点：**
• 奇幻童话城堡
• 米奇大街
• 宝藏湾海盗船

迪士尼真的是一个让人找回童心的地方，无论多大年纪，来到这里都会忍不住开心地笑。`,
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1575408264798-b50b252663e6?w=800',
        ]),
        coverImage: 'https://images.unsplash.com/photo-1575408264798-b50b252663e6?w=1200',
        location: '上海',
        startDate: new Date('2024-07-20'),
        endDate: new Date('2024-07-21'),
        tags: JSON.stringify(['迪士尼', '亲子游', '攻略', '主题乐园']),
        published: true,
        viewCount: 2890,
        likeCount: 543,
        authorId: users[1].id,
      },
    }),
  ]);

  console.log(`✓ 已创建 ${posts.length} 篇测试游记`);

  // 创建测试评论
  const comments = await Promise.all([
    // 北京故宫游记的评论
    prisma.comment.create({
      data: {
        content: '写得真好！我也去过故宫，确实很震撼。特别是太和殿的金碧辉煌，让人赞叹不已。',
        authorId: users[1].id,
        postId: posts[0].id,
      },
    }),
    prisma.comment.create({
      data: {
        content: '请问珍宝馆需要单独买票吗？准备下个月去北京，想提前了解一下。',
        authorId: users[2].id,
        postId: posts[0].id,
      },
    }),
    // 成都美食的评论
    prisma.comment.create({
      data: {
        content: '作为成都人，看到这篇文章感到很亲切！推荐的这几家店确实都很地道。',
        authorId: users[0].id,
        postId: posts[1].id,
      },
    }),
    prisma.comment.create({
      data: {
        content: '火锅我也吃过小龙坎，确实很正宗！下次去成都一定要试试其他几家。',
        authorId: users[2].id,
        postId: posts[1].id,
      },
    }),
    // 西藏游记的评论
    prisma.comment.create({
      data: {
        content: '西藏一直是我的梦想之地，看完你的文章更想去了！高反严重吗？',
        authorId: users[0].id,
        postId: posts[2].id,
      },
    }),
    prisma.comment.create({
      data: {
        content: '照片拍得太美了！纳木错的景色真的像仙境一样。',
        authorId: users[1].id,
        postId: posts[2].id,
      },
    }),
  ]);

  console.log(`✓ 已创建 ${comments.length} 条测试评论`);

  // 创建回复评论（二级评论）
  const replies = await Promise.all([
    prisma.comment.create({
      data: {
        content: '珍宝馆不需要单独买票，故宫门票已经包含了。不过钟表馆要单独买，10元一张。',
        authorId: users[0].id, // 作者回复
        postId: posts[0].id,
        parentId: comments[1].id, // 回复第二条评论
      },
    }),
    prisma.comment.create({
      data: {
        content: '前两天会有轻微高反，头晕、气短。但是适应后就好了，不用太担心。记得多喝水，慢慢走。',
        authorId: users[2].id, // 作者回复
        postId: posts[2].id,
        parentId: comments[4].id, // 回复关于高反的评论
      },
    }),
  ]);

  console.log(`✓ 已创建 ${replies.length} 条回复评论`);

  console.log('\n✅ 测试数据填充完成！');
  console.log('\n📊 数据统计：');
  console.log(`   用户: ${users.length} 个`);
  console.log(`   游记: ${posts.length} 篇`);
  console.log(`   评论: ${comments.length + replies.length} 条`);
  console.log('\n🎉 可以开始测试应用了！\n');
}

main()
  .catch((e) => {
    console.error('❌ 填充数据时出错：', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
