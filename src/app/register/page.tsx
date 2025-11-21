import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function Register() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100">
      <Navbar />
      
      <div className="flex flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-8 min-h-[calc(100vh-64px)]">
        <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-yellow-200">
          <div className="text-center">
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
              创建账号
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              加入云旅札记，开启您的智能旅行
            </p>
          </div>
          
          <form className="mt-8 space-y-6" action="#" method="POST">
            <div className="space-y-4 rounded-md shadow-sm">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  用户名
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  className="relative block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-yellow-500 focus:outline-none focus:ring-yellow-500 sm:text-sm"
                  placeholder="请输入用户名"
                />
              </div>
              <div>
                <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-1">
                  电子邮箱
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="relative block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-yellow-500 focus:outline-none focus:ring-yellow-500 sm:text-sm"
                  placeholder="name@example.com"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  密码
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="relative block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-yellow-500 focus:outline-none focus:ring-yellow-500 sm:text-sm"
                  placeholder="至少6位字符"
                />
              </div>
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                  确认密码
                </label>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="relative block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-yellow-500 focus:outline-none focus:ring-yellow-500 sm:text-sm"
                  placeholder="请再次输入密码"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                我已阅读并同意
                <a href="#" className="font-medium text-yellow-600 hover:text-yellow-500 mx-1">
                  服务条款
                </a>
                和
                <a href="#" className="font-medium text-yellow-600 hover:text-yellow-500 mx-1">
                  隐私政策
                </a>
              </label>
            </div>

            <div>
              <button
                type="submit"
                className="group relative flex w-full justify-center rounded-lg bg-yellow-500 px-3 py-2 text-sm font-semibold text-white hover:bg-yellow-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-600 transition-colors shadow-md"
              >
                注册账号
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-gray-600">
              已有账号?{' '}
              <Link href="/login" className="font-medium text-yellow-600 hover:text-yellow-500">
                立即登录
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
