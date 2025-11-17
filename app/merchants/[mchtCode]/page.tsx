import Link from "next/link";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://recruit.paysbypays.com/api/v1";

type ApiResponse<T> = {
  status: number;
  message: string;
  data: T;
};

type MerchantDetail = {
  mchtCode: string;
  mchtName: string;
  status: string;
  bizType: string;
  bizNo: string;
  address: string;
  phone: string;
  email: string;
  registeredAt: string;
  updatedAt: string;
};

export default async function MerchantDetailPage({
  params,
}: {
  params: { mchtCode: string };
}) {
  const { mchtCode } = await params;

  const res = await fetch(`${BASE_URL}/merchants/details/${mchtCode}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("가맹점 상세 조회에 실패했습니다.");
  }

  const json = (await res.json()) as ApiResponse<MerchantDetail>;
  const m = json.data;

  return (
    <div className="space-y-4">
      {/* 상단: 뒤로가기 + 타이틀 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">가맹점 상세 - {m.mchtName}</h1>
          <p className="text-sm text-slate-400">가맹점 코드: {m.mchtCode}</p>
        </div>

        <Link
          href="/merchants"
          className="inline-flex items-center rounded-md border border-slate-700 px-3 py-1.5 text-sm hover:bg-slate-800"
        >
          ← 가맹점 목록으로
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="rounded-lg border border-slate-800 p-4 space-y-2">
          <div>
            <div className="text-xs text-slate-400">상태</div>
            <div>{m.status}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400">업종</div>
            <div>{m.bizType}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400">사업자번호</div>
            <div>{m.bizNo}</div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-800 p-4 space-y-2">
          <div>
            <div className="text-xs text-slate-400">주소</div>
            <div>{m.address}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400">전화번호</div>
            <div>{m.phone}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400">이메일</div>
            <div>{m.email}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400">등록일</div>
            <div>{new Date(m.registeredAt).toLocaleString("ko-KR")}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400">수정일</div>
            <div>{new Date(m.updatedAt).toLocaleString("ko-KR")}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
