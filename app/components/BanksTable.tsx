import { useState, useEffect } from "react";

export default function BanksTable() {
  const STATIC = [
    { name: "Commonwealth Bank", ticker: "CBA.AX", price: "A$152.43", today: "▼1.03%", todayUp: false, week: "▼14.5%", weekUp: false, target: "A$105.00", gap: "▼31%", rating: "Strong Sell", ratingType: "sell", result: "FY26 Beat", resultNote: "NPAT $11.0B · NIM 2.05%", keyMetric: "28× earnings", dividend: "$5.05 FY" },
    { name: "ANZ Group Holdings", ticker: "ANZ.AX", price: "A$37.68",  today: "▼0.26%", todayUp: false, week: "+13.8% 12m", weekUp: true,  target: "A$35.50", gap: "▼5.8%", rating: "Buy / Hold", ratingType: "buy",  result: "Q3 Beat ★", resultNote: "NIM +4bps · deposits +$15B", keyMetric: "15× earnings", dividend: "$0.83 interim" },
    { name: "National Australia Bank", ticker: "NAB.AX", price: "A$38.47",  today: "▼1.91%", todayUp: false, week: "▼11.6% 12m", weekUp: false, target: "A$37.01", gap: "▼3.8%", rating: "Hold / Sell", ratingType: "hold", result: "Q3 Miss",   resultNote: "Home loan apps ▼15%", keyMetric: "Cash +2%", dividend: "$0.85 interim" },
    { name: "Westpac Banking Corp", ticker: "WBC.AX", price: "A$34.75",  today: "▼0.23%", todayUp: false, week: "▼10.9% 12m", weekUp: false, target: "A$33.41", gap: "▼3.8%", rating: "Sell",       ratingType: "sell", result: "Q3 Miss",   resultNote: "Mortgage apps ▼20%", keyMetric: "NIM 1.78%", dividend: "$0.77 interim" },
  ];

  const [banks, setBanks] = useState(STATIC);
  const [updated, setUpdated] = useState("19 Sep 2026");

  useEffect(() => {
    fetch("/api/tickers")
      .then(r => r.json())
      .then(data => {
        const tickers = Array.isArray(data) ? data : data.tickers || data.data || [];
        const map: Record<string, any> = {};
        tickers.forEach((t: any) => { if (t.symbol) map[t.symbol] = t; });
        setBanks(prev => prev.map(b => {
          const live = map[b.ticker];
          if (!live || !live.price) return b;
          const chg = live.changePercent ?? live.change_percent ?? 0;
          const up = chg >= 0;
          return {
            ...b,
            price: "A$" + Number(live.price).toFixed(2),
            today: (up ? "▲" : "▼") + Math.abs(chg).toFixed(2) + "%",
            todayUp: up,
          };
        }));
        setUpdated(new Date().toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }) + " · Live");
      })
      .catch(() => {});
  }, []);

  const rs = (t: string) => t === "buy" ? {background:"#f0fdf4",color:"#15803d"} : t === "sell" ? {background:"#fef2f2",color:"#dc2626"} : {background:"#fefce8",color:"#ca8a04"};
  const rc = (r: string) => r.includes("Beat") ? "#15803d" : "#dc2626";

  return (
    <div style={{margin:"16px 0",borderRadius:8,overflow:"hidden",border:"1px solid #e5e5e5"}}>
      <div style={{padding:"12px 16px",background:"#000",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontSize:16,fontWeight:700,color:"#fff"}}>Australian Big 4 Banks</div>
        <div style={{fontSize:10,color:"#888"}}>ASX · {updated} · Not financial advice</div>
      </div>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13,background:"#fff"}}>
          <thead>
            <tr style={{borderBottom:"2px solid #e5e5e5",background:"#f9f9f9"}}>
              {["Bank","Price","Today","Week","Target","vs Target","Rating","Result","Key Metric","Dividend"].map(h=>(
                <th key={h} style={{padding:"8px 12px",textAlign:"left",fontSize:10,color:"#888",fontWeight:500,letterSpacing:"0.06em",textTransform:"uppercase",whiteSpace:"nowrap"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {banks.map((b,i)=>(
              <tr key={b.ticker} style={{borderBottom:i<3?"1px solid #f0f0f0":"none"}}>
                <td style={{padding:"12px 12px"}}>
                  <div style={{fontWeight:600,fontSize:14,color:"#000"}}>{b.name}</div>
                  <div style={{fontSize:11,color:"#888"}}>{b.ticker}</div>
                </td>
                <td style={{padding:"12px 12px",fontSize:15,fontWeight:600,color:"#000"}}>{b.price}</td>
                <td style={{padding:"12px 12px",fontSize:13,color:b.todayUp?"#15803d":"#dc2626"}}>{b.today}</td>
                <td style={{padding:"12px 12px",fontSize:13,color:b.weekUp?"#15803d":"#dc2626"}}>{b.week}</td>
                <td style={{padding:"12px 12px",fontSize:13,color:"#555"}}>{b.target}</td>
                <td style={{padding:"12px 12px",fontSize:13,color:"#dc2626"}}>{b.gap}</td>
                <td style={{padding:"12px 12px"}}>
                  <span style={{...rs(b.ratingType),fontSize:11,padding:"3px 8px",borderRadius:4,fontWeight:500}}>{b.rating}</span>
                </td>
                <td style={{padding:"12px 12px"}}>
                  <div style={{fontSize:12,color:rc(b.result),fontWeight:600}}>{b.result}</div>
                  <div style={{fontSize:11,color:"#888",marginTop:2}}>{b.resultNote}</div>
                </td>
                <td style={{padding:"12px 12px",fontSize:13,color:"#000"}}>{b.keyMetric}</td>
                <td style={{padding:"12px 12px",fontSize:13,color:"#000"}}>{b.dividend}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
