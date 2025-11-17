import Link from "next/link";

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

type Merchant = {
  mchtCode: string;
  mchtName: string;
  status: string;
  bizType: string;
};

export default async function DashboardPage() {
  const [paymentsRes, merchantsRes] = await Promise.all([
    fetch(`${BASE_URL}/payments/list`, { cache: "no-store" }),
    fetch(`${BASE_URL}/merchants/list`, { cache: "no-store" }),
  ]);

  if (!paymentsRes.ok || !merchantsRes.ok) {
    throw new Error("대시보드 데이터 조회에 실패했습니다.");
  }

  const paymentsJson = (await paymentsRes.json()) as ApiResponse<Payment[]>;
  const merchantsJson = (await merchantsRes.json()) as ApiResponse<Merchant[]>;

  const payments = paymentsJson.data ?? [];
  const merchants = merchantsJson.data ?? [];

  // 총 거래 금액
  const totalAmount = payments.reduce((sum, p) => {
    const n = Number(p.amount);
    return sum + (isNaN(n) ? 0 : n);
  }, 0);

  // 오늘 날짜 기준 거래 건수
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const todayCount = payments.filter((p) =>
    p.paymentAt.startsWith(today)
  ).length;

  // 최근 거래 10건 (paymentAt 기준 내림차순)
  const recentPayments = [...payments]
    .sort(
      (a, b) =>
        new Date(b.paymentAt).getTime() - new Date(a.paymentAt).getTime()
    )
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">대시보드</h1>
        <p className="text-sm text-slate-400">
          결제/가맹점 데이터를 요약해서 보여주는 화면입니다.
        </p>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-800 p-4">
          <div className="text-xs text-slate-400 mb-1">총 거래 금액</div>
          <div className="text-xl font-semibold">
            {totalAmount.toLocaleString("ko-KR")}원
          </div>
        </div>
        <div className="rounded-xl border border-slate-800 p-4">
          <div className="text-xs text-slate-400 mb-1">오늘 거래 건수</div>
          <div className="text-xl font-semibold">
            {todayCount.toLocaleString("ko-KR")}건
          </div>
        </div>
        <div className="rounded-xl border border-slate-800 p-4">
          <div className="text-xs text-slate-400 mb-1">가맹점 수</div>
          <div className="text-xl font-semibold underline">
            <Link href="/merchants" className="hover:text-sky-400">
              {merchants.length.toLocaleString("ko-KR")}개
            </Link>
          </div>
        </div>
      </div>

      {/* 최근 거래 테이블 */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">최근 거래 10건</h2>
        <div className="rounded-lg border border-slate-800 overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-900/60">
              <tr>
                <th className="px-4 py-2 text-left">결제 코드</th>
                <th className="px-4 py-2 text-left">가맹점 코드</th>
                <th className="px-4 py-2 text-left">금액</th>
                <th className="px-4 py-2 text-left">상태</th>
                <th className="px-4 py-2 text-left">결제 시각</th>
              </tr>
            </thead>
            <tbody>
              {recentPayments.map((p) => (
                <tr key={p.paymentCode} className="border-t border-slate-800">
                  <td className="px-4 py-2">{p.paymentCode}</td>
                  <td className="px-4 py-2">{p.mchtCode}</td>
                  <td className="px-4 py-2">
                    {Number(p.amount).toLocaleString("ko-KR")}원
                  </td>
                  <td className="px-4 py-2">{p.status}</td>
                  <td className="px-4 py-2">
                    {new Date(p.paymentAt).toLocaleString("ko-KR")}
                  </td>
                </tr>
              ))}

              {recentPayments.length === 0 && (
                <tr>
                  <td
                    className="px-4 py-4 text-center text-slate-500"
                    colSpan={5}
                  >
                    최근 거래 내역이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
