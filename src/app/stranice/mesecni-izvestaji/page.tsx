"use client";

import React, { useEffect, useState } from "react";
import RoleGuard from "../../components/RoleGuard";
import { getMesecnaStatistikaKlijenata } from "@/app/actions/admin";
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from "recharts";
import { Users, TrendingUp, Calendar, AlertCircle, Loader2, Filter, ArrowUpRight, ArrowDownRight, LayoutList } from "lucide-react";

export default function StatistikaKlijenataPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "last3">("all");

  useEffect(() => {
    async function fetchData() {
      const res = await getMesecnaStatistikaKlijenata();
      if (res.success) {
        setData(res.data || []);
      } else {
        setError(res.error || "Greška.");
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const chartData = filter === "last3" ? data.slice(-3) : data;
  const ukupnoKlijenata = data.reduce((sum, curr) => sum + curr.broj, 0);
  const prosekPoMesecu = data.length > 0 ? (ukupnoKlijenata / data.length).toFixed(1) : 0;

  return (
    <RoleGuard allowedRoles={["ADMIN"]}>
      <div className="auth-wrap !block !p-0">
        <div className="max-w-6xl mx-auto p-4 md:p-10 flex flex-col items-center">

          <div className="auth-card !max-w-none w-full mb-8 text-center border-b-4 border-[--color-primary] shadow-lg">
            <h1 className="text-3xl font-bold text-[--color-primary] uppercase tracking-widest inline-block">
              Statistički Izveštaj
            </h1>
            <p className="text-[--color-text] mt-2 font-semibold italic opacity-70">
              Pregled registracija klijenata kroz vreme
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-white" size={50} /></div>
          ) : error ? (
            <div className="auth-card w-full flex items-center gap-3 text-red-500 justify-center">
              <AlertCircle /> {error}
            </div>
          ) : (
            <div className="w-full space-y-10 animate-in fade-in duration-500">

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                <div className="auth-card flex items-center gap-4 !max-w-none w-full !p-6 shadow-md">
                  <div className="p-3 bg-[--color-accent] text-[--color-primary] rounded-2xl"><Users size={28} /></div>
                  <div className="text-left">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ukupno klijenata</p>
                    <p className="text-2xl font-black text-[--color-text]">{ukupnoKlijenata}</p>
                  </div>
                </div>

                <div className="auth-card flex items-center gap-4 !max-w-none w-full !p-6 shadow-md">
                  <div className="p-3 bg-green-100 text-green-600 rounded-2xl"><TrendingUp size={28} /></div>
                  <div className="text-left">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Prosek / Mesec</p>
                    <p className="text-2xl font-black text-[--color-text]">{prosekPoMesecu}</p>
                  </div>
                </div>

                <div className="auth-card flex items-center gap-4 !max-w-none w-full !p-6 shadow-md">
                  <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl"><Calendar size={28} /></div>
                  <div className="text-left">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Aktivni meseci</p>
                    <p className="text-2xl font-black text-[--color-text]">{data.length}</p>
                  </div>
                </div>
              </div>

              <div className="auth-card !max-w-none w-full p-6 md:p-10 shadow-xl">
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                  <h3 className="text-lg font-bold text-[--color-primary] flex items-center gap-2 uppercase tracking-tighter">
                    <Filter size={18} /> Vizuelni prikaz
                  </h3>

                  <div className="flex bg-[--color-accent]/30 p-1 rounded-xl border border-[--color-accent]">
                    <button
                      onClick={() => setFilter("all")}
                      className={`px-6 py-2 rounded-lg text-xs font-black transition-all ${filter === 'all' ? 'bg-[--color-primary] text-[#FFFBE9] shadow-md' : 'text-[--color-primary] hover:bg-white/50'}`}
                    >
                      Svi meseci
                    </button>
                    <button
                      onClick={() => setFilter("last3")}
                      className={`px-6 py-2 rounded-lg text-xs font-black transition-all ${filter === 'last3' ? 'bg-[--color-primary] text-[#FFFBE9] shadow-md' : 'text-[--color-primary] hover:bg-white/50'}`}
                    >
                      Poslednja 3 meseca
                    </button>
                  </div>
                </div>

                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorBroj" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#AD8B73" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#AD8B73" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3CAA5" opacity={0.5} />
                      <XAxis dataKey="name" stroke="#AD8B73" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                      <YAxis stroke="#AD8B73" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#FFFBE9', borderRadius: '12px', border: '2px solid #AD8B73' }}
                      />
                      <Area type="monotone" dataKey="broj" stroke="#AD8B73" strokeWidth={3} fillOpacity={1} fill="url(#colorBroj)" animationDuration={1200} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="w-full pb-20">
                <div className="auth-card !max-w-none w-full !p-0 overflow-hidden border border-[--color-accent] shadow-2xl">
                  <div className="p-6 border-b border-[--color-accent] bg-[--color-bg] flex items-center gap-3">
                    <LayoutList size={24} className="text-[--color-primary]" />
                    <h3 className="text-xl font-bold text-[--color-primary] uppercase tracking-widest">
                      Detaljan istorijat po mesecima
                    </h3>
                  </div>
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse table-fixed">
                      <thead>
                        <tr className="bg-[--color-accent]/20 text-[--color-primary] font-bold uppercase text-xs tracking-[0.2em]">
                          <th className="p-6 pl-12 w-1/3">Vremenski period</th>
                          <th className="p-6 text-center w-1/3">Novi klijenti</th>
                          <th className="p-6 pr-12 text-right w-1/3">Mesečni trend</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[--color-accent]/10 bg-white/30">
                        {data.slice().reverse().map((m, i) => {
                          const currentIndex = data.findIndex(d => d.puniDatum === m.puniDatum);
                          const prevMonth = data[currentIndex - 1];
                          const isUp = prevMonth ? m.broj >= prevMonth.broj : true;

                          return (
                            <tr key={i} className="hover:bg-white/60 transition-colors">
                              <td className="p-6 pl-12">
                                <span className="font-bold text-[--color-text] uppercase text-sm tracking-tight">{m.name}</span>
                              </td>
                              <td className="p-6 text-center">
                                <span className="font-black text-[--color-primary] text-2xl bg-[--color-accent]/20 px-6 py-2 rounded-xl">
                                  {m.broj}
                                </span>
                              </td>
                              <td className="p-6 pr-12 text-right">
                                <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-black uppercase shadow-sm border ${isUp ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                                  {isUp ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                                  {isUp ? "Rast" : "Pad"}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}