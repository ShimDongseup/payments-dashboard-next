const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://recruit.paysbypays.com/api/v1";

type ApiResponse<T> = {
  status: number;
  message: string;
  data: T;
};

type Payment = {
  paymentCode: string;
  mchtCode: string;
  amount: string;
  currency: string;
  payType: string;
  status: string;
  paymentAt: string;
};

type CodeItem = {
  code: string;
  description: string;
};

type PayTypeItem = {
  type: string;
  description: string;
};

const PAGE_SIZE = 15;

export default async function TransactionsPage({
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

  const [paymentsRes, statusRes, typeRes] = await Promise.all([
    fetch(`${BASE_URL}/payments/list`, { cache: "no-store" }),
    fetch(`${BASE_URL}/common/payment-status/all`, { cache: "force-cache" }),
    fetch(`${BASE_URL}/common/paymemt-type/all`, { cache: "force-cache" }),
  ]);

  if (!paymentsRes.ok || !statusRes.ok || !typeRes.ok) {
    throw new Error("거래 내역 데이터 조회에 실패했습니다.");
  }

  const paymentsJson = (await paymentsRes.json()) as ApiResponse<Payment[]>;
  const statusJson = (await statusRes.json()) as ApiResponse<CodeItem[]>;
  const typeJson = (await typeRes.json()) as ApiResponse<PayTypeItem[]>;

  const paymentsAll = paymentsJson.data ?? [];
  const statusCodes = statusJson.data ?? [];
  const payTypes = typeJson.data ?? [];

  const statusMap = new Map(statusCodes.map((s) => [s.code, s.description]));
  const payTypeMap = new Map(payTypes.map((t) => [t.type, t.description]));

  const totalItems = paymentsAll.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);

  const start = (safePage - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const payments = paymentsAll.slice(start, end);

  const hasPrev = safePage > 1;
  const hasNext = safePage < totalPages;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">거래 내역</h1>
        <p className="text-sm text-slate-400">
          결제 거래 목록과 상태/수단 정보를 함께 확인할 수 있는 페이지입니다.
        </p>
      </div>

      {/* 간단 요약 */}
      <div className="w-xl gap-4">
        <div className="rounded-xl border border-slate-800 p-4">
          <div className="text-xs text-slate-400 mb-1">총 거래 건수</div>
          <div className="text-xl font-semibold">
            {totalItems.toLocaleString("ko-KR")}건
          </div>
        </div>
      </div>

      {/* 거래 목록 테이블 */}
      <div className="rounded-lg border border-slate-800 overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-900/60">
            <tr>
              <th className="px-4 py-2 text-left">결제 코드</th>
              <th className="px-4 py-2 text-left">가맹점 코드</th>
              <th className="px-4 py-2 text-left">금액</th>
              <th className="px-4 py-2 text-left">결제 수단</th>
              <th className="px-4 py-2 text-left">상태</th>
              <th className="px-4 py-2 text-left">결제 시각</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.paymentCode} className="border-t border-slate-800">
                <td className="px-4 py-2">{p.paymentCode}</td>
                <td className="px-4 py-2">{p.mchtCode}</td>
                <td className="px-4 py-2">
                  {Number(p.amount).toLocaleString("ko-KR")}원
                </td>
                <td className="px-4 py-2">
                  {payTypeMap.get(p.payType) ?? p.payType}
                </td>
                <td className="px-4 py-2">
                  {statusMap.get(p.status) ?? p.status}
                </td>
                <td className="px-4 py-2">
                  {new Date(p.paymentAt).toLocaleString("ko-KR")}
                </td>
              </tr>
            ))}

            {payments.length === 0 && (
              <tr>
                <td
                  className="px-4 py-4 text-center text-slate-500"
                  colSpan={6}
                >
                  거래 내역이 없습니다.
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
            (총 {totalItems.toLocaleString("ko-KR")}건)
          </span>
        </div>
        <div className="space-x-2">
          <a
            href={hasPrev ? `/transactions?page=${safePage - 1}` : "#"}
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
            href={hasNext ? `/transactions?page=${safePage + 1}` : "#"}
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
