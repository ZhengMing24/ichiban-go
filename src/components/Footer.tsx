import { useState } from "react";
import InfoModal from "./InfoModal";

const FOOTER_INFO: Record<string, string> = {
  關於我們:
    "IchibanGo 是一個原創的線上一番賞練習專案，提供多款主題賞品讓玩家線上抽選收藏。站上商品角色與圖片僅供展示，非官方授權商品。",
  常見問題:
    "Q：點數怎麼取得？\nA：儲值功能開發中，目前測試帳號可由客服協助加值。\n\nQ：抽到的獎品在哪裡看？\nA：獎品會記錄在你的帳號裡，賞品盒功能開發中。\n\nQ：可以退換貨嗎？\nA：請參考「退換貨政策」。",
  服務條款:
    "使用本站服務即表示你同意：帳號僅供本人使用、點數不得轉讓或折現、禁止利用系統漏洞進行不正常抽獎。本站保留隨時修改活動規則與獎項內容的權利。",
  隱私權政策:
    "本站僅蒐集帳號註冊所需的基本資料（Email、暱稱、聯絡電話、收件地址），用於帳號驗證與獎品寄送，不會轉售或提供給無關第三方。",
  新手教學:
    "1. 儲值點數後，於商品頁點擊「開抽」即可進行抽獎。\n2. 抽中的獎項會記錄在帳號中，可累積後一次寄送。\n3. 當某一賞項抽數歸零，畫面會顯示「完售」標示。\n4. 最後賞是加碼贈品：抽到最後一抽的人，會同時獲得「該抽原本對應的一般賞項」與「最後賞」兩份獎品。\n5. 最後賞抽出後，代表商品已無剩餘抽數，該商品即完售下架。",
  抽賞規則說明:
    "每個賞品主題會拆成 A～E 賞加上最後賞：A 賞最稀有、E 賞數量最多，抽中機率依賞項庫存比例決定。每次抽獎費用依商品單抽價格計算，餘額不足將無法抽獎。",
  運費與出貨:
    "抽中的實體獎品將依訂單順序陸續出貨，出貨時間視商品到貨狀況而定，實際到貨日以官方公告為準。",
  退換貨政策:
    "抽獎為機率型商品，抽獎完成後恕不接受退換。若收到的獎品有瑕疵或運送損壞，請於收到 7 日內聯繫客服協助處理。",
};

const LINK_GROUPS = [
  {
    title: "關於 IchibanGo",
    links: ["關於我們", "常見問題", "服務條款", "隱私權政策"],
  },
  {
    title: "購物指南",
    links: ["新手教學", "抽賞規則說明", "運費與出貨", "退換貨政策"],
  },
];

export default function Footer() {
  const [openTitle, setOpenTitle] = useState<string | null>(null);

  return (
    <footer className="mt-10 border-t border-black/5 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-3">
        {LINK_GROUPS.map((group) => (
          <div key={group.title}>
            <h4 className="mb-3 text-sm font-black text-brand-ink">
              {group.title}
            </h4>
            <ul className="space-y-2 text-sm text-gray-500">
              {group.links.map((link) => (
                <li key={link}>
                  <button
                    type="button"
                    onClick={() => setOpenTitle(link)}
                    className="text-left hover:text-brand-price"
                  >
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h4 className="mb-3 text-sm font-black text-brand-ink">聯絡我們</h4>
          <ul className="space-y-2 text-sm text-gray-500">
            <li>
              客服信箱：
              <a href="mailto:support@ichibango.example" className="hover:text-brand-price">
                support@ichibango.example
              </a>
            </li>
            <li>客服時間：週一至週日 09:00–18:00</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-black/5 px-4 py-4 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} IchibanGo — 每一抽，都是手氣與緣分的碰撞。祝你抽到 SSR。
      </div>

      <InfoModal
        title={openTitle}
        body={openTitle ? FOOTER_INFO[openTitle] : ""}
        onClose={() => setOpenTitle(null)}
      />
    </footer>
  );
}
