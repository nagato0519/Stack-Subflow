export default function Loading() {
  return (
    <div className="form-container">
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 bg-blue-50 dark:bg-blue-900/20">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h1 className="text-2xl font-semibold mb-3 text-slate-900 dark:text-slate-100">読み込み中...</h1>
            <p className="text-slate-600 dark:text-slate-400">
              お支払いフォームを準備しています。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
