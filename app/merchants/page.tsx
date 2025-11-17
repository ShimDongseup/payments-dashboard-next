import Link from "next/link";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://recruit.paysbypays.com/api/v1";

type ApiResponse<T> = {
  status: number;
  message: string;
  data: T;
};

type Merchant = {
  mchtCode: string;
  mchtName: string;
  status: string;
  bizType: string;
};

const PAGE_SIZE = 15;

export default async function MerchantsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;

  const currentPage = (() => {
    const p = Number(sp.page ?? "1");
    if (Number.isNaN(p) || p < 1) return 1;
    return Math.floor(p);
  })();

  const res = await fetch(`${BASE_URL}/merchants/list`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("가맹점 목록 조회에 실패했습니다.");
  }

  const json = (await res.json()) as ApiResponse<Merchant[]>;
  const merchantsAll = json.data ?? [];

  const totalItems = merchantsAll.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages); // 현재페이지를 안전한 값으로 고정

  const start = (safePage - 1) * PAGE_SIZE; // 페이지의 시작 인데스
  const end = start + PAGE_SIZE;
  const merchants = merchantsAll.slice(start, end);

  const hasPrev = safePage > 1;
  const hasNext = safePage < totalPages;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">가맹점 목록</h1>
          <p className="text-sm text-slate-400">
            등록된 가맹점 리스트를 조회할 수 있는 페이지입니다.
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-slate-800 overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-900/60">
            <tr>
              <th className="px-4 py-2 text-left">가맹점 코드</th>
              <th className="px-4 py-2 text-left">가맹점 명</th>
              <th className="px-4 py-2 text-left">상태</th>
              <th className="px-4 py-2 text-left">업종</th>
            </tr>
          </thead>
          <tbody>
            {merchants.map((m) => (
              <tr key={m.mchtCode} className="border-t border-slate-800">
                <td className="px-4 py-2">
                  <Link
                    href={`/merchants/${m.mchtCode}`}
                    className="text-sky-400 hover:underline"
                  >
                    {m.mchtCode}
                  </Link>
                </td>
                <td className="px-4 py-2">{m.mchtName}</td>
                <td className="px-4 py-2">{m.status}</td>
                <td className="px-4 py-2">{m.bizType}</td>
              </tr>
            ))}

            {merchants.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-4 text-center text-slate-500"
                >
                  가맹점 데이터가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <div>
          페이지 {safePage} / {totalPages}{" "}
          <span className="ml-2">
            (총 {totalItems.toLocaleString("ko-KR")}개)
          </span>
        </div>
        <div className="space-x-2">
          <a
            href={hasPrev ? `/merchants?page=${safePage - 1}` : "#"}
            aria-disabled={!hasPrev}
            className={`inline-flex items-center rounded-md border px-3 py-1.5 ${
              hasPrev
                ? "border-slate-700 hover:bg-slate-800"
                : "border-slate-800 text-slate-600 cursor-not-allowed"
            }`}
          >
            이전
          </a>
          <a
            href={hasNext ? `/merchants?page=${safePage + 1}` : "#"}
            aria-disabled={!hasNext}
            className={`inline-flex items-center rounded-md border px-3 py-1.5 ${
              hasNext
                ? "border-slate-700 hover:bg-slate-800"
                : "border-slate-800 text-slate-600 cursor-not-allowed"
            }`}
          >
            다음
          </a>
        </div>
      </div>
    </div>
  );
}
