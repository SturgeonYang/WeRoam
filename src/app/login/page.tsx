import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function Login() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100">
      <Navbar />
      
      <div className="flex flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-8 min-h-[calc(100vh-64px)]">
        <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-yellow-200">
          <div className="text-center">
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
              欢迎回来
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              登录您的云旅札记账号
            </p>
          </div>
          
          <form className="mt-8 space-y-6" action="#" method="POST">
            <div className="space-y-4 rounded-md shadow-sm">
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
                  autoComplete="current-password"
                  required
                  className="relative block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-yellow-500 focus:outline-none focus:ring-yellow-500 sm:text-sm"
                  placeholder="请输入密码"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  记住我
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-yellow-600 hover:text-yellow-500">
                  忘记密码?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative flex w-full justify-center rounded-lg bg-yellow-500 px-3 py-2 text-sm font-semibold text-white hover:bg-yellow-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-600 transition-colors shadow-md"
              >
                登录
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-gray-600">
              还没有账号?{' '}
              <Link href="/register" className="font-medium text-yellow-600 hover:text-yellow-500">
                立即注册
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
