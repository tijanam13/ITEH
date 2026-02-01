"use client";

import React, { useEffect, useState } from "react";
import RoleGuard from "../../components/RoleGuard";
import { getStatistikaProdajeKurseva } from "@/app/actions/admin";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { Euro, ShoppingCart, TrendingUp, Award, Loader2, AlertCircle, LayoutList } from "lucide-react";

const COLORS = ["#AD8B73", "#CEAB93", "#E3CAA5", "#4a3f35", "#8b735b", "#d2b48c"];

export default function StatistikaProdajePage() {
  const [data, setData] = useState<any[]>([]);
  const [ukupno, setUkupno] = useState(0);
  const [ukupnoProdato, setUkupnoProdato] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      const res = await getStatistikaProdajeKurseva();
      if (res.success) {
        setData(res.data || []);
        setUkupno(res.ukupnoPrihod || 0);
        setUkupnoProdato(res.ukupnoProdato || 0);
      } else {
        setError(res.error || "Greška.");
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <RoleGuard allowedRoles={["ADMIN"]}>
      <div className="auth-wrap !block !p-0 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-4 md:p-10">

          <div className="auth-card !max-w-none mb-10 text-center border-b-4 border-[--color-primary] shadow-xl">
            <h1 className="text-3xl font-black text-[--color-primary] uppercase tracking-[0.2em] inline-block">
              Finansijski Izveštaj Prodaje
            </h1>
            <p className="text-[--color-text] mt-4 font-bold italic opacity-75">
              Pregled prometa, broja kupovina i uspešnosti svakog kursa
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-white" size={60} /></div>
          ) : error ? (
            <div className="auth-card w-full text-red-500 text-center"><AlertCircle className="mx-auto mb-2" /> {error}</div>
          ) : (
            <div className="space-y-10 animate-in fade-in duration-700">

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="auth-card flex items-center gap-5 !max-w-none shadow-lg border-l-8 border-green-500">
                  <div className="p-4 bg-green-100 text-green-600 rounded-full"><Euro size={35} /></div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ukupni Prihod</p>
                    <p className="text-3xl font-black text-[--color-text]">{ukupno.toLocaleString()} €</p>
                  </div>
                </div>

                <div className="auth-card flex items-center gap-5 !max-w-none shadow-lg border-l-8 border-blue-500">
                  <div className="p-4 bg-blue-100 text-blue-600 rounded-full"><ShoppingCart size={35} /></div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ukupno Prodato</p>
                    <p className="text-3xl font-black text-[--color-text]">{ukupnoProdato} Kurseva</p>
                  </div>
                </div>

                <div className="auth-card flex items-center gap-5 !max-w-none shadow-lg border-l-8 border-[--color-primary]">
                  <div className="p-4 bg-[--color-accent]/30 text-[--color-primary] rounded-full flex-shrink-0"><Award size={35} /></div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Najprodavaniji</p>
                    <p className="text-xl font-black text-[--color-text] leading-tight">{data[0]?.naziv || "/"}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="auth-card !max-w-none p-8 shadow-2xl">
                  <h3 className="text-lg font-bold text-[--color-primary] mb-8 uppercase tracking-tighter flex items-center gap-2">
                    <TrendingUp size={20} /> Prihod po kursevima (€)
                  </h3>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data} layout="vertical" margin={{ left: 30, right: 30 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.3} />
                        <XAxis type="number" hide />
                        <YAxis dataKey="naziv" type="category" width={100} fontSize={10} tick={{ fill: '#4a3f35', fontWeight: 'bold' }} />
                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }} />
                        <Bar dataKey="prihod" fill="#AD8B73" radius={[0, 10, 10, 0]} barSize={25} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="auth-card !max-w-none p-8 shadow-2xl">
                  <h3 className="text-lg font-bold text-[--color-primary] mb-8 uppercase tracking-tighter flex items-center gap-2">
                    <LayoutList size={20} /> Udeo u broju prodaja
                  </h3>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data}
                          dataKey="brojProdaja"
                          nameKey="naziv"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          innerRadius={60}
                          paddingAngle={5}
                          label
                        >
                          {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="auth-card !max-w-none !p-0 overflow-hidden shadow-2xl border border-[--color-accent] mb-20">
                <div className="p-6 bg-[--color-bg] border-b border-[--color-accent]">
                  <h3 className="text-xl font-bold text-[--color-primary] uppercase tracking-widest flex items-center gap-3">
                    <LayoutList /> Specifikacija prodaje po kursu
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[--color-accent]/20 text-[--color-primary] font-bold uppercase text-[11px] tracking-[0.2em]">
                        <th className="p-6">Naziv Kursa</th>
                        <th className="p-6">Kategorija</th>
                        <th className="p-6 text-center">Cena (€)</th>
                        <th className="p-6 text-center">Prodato</th>
                        <th className="p-6 text-right">Ukupan Prihod</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[--color-accent]/10 bg-white/40">
                      {data.map((k, i) => (
                        <tr key={i} className="hover:bg-[--color-accent]/5 transition-colors">
                          <td className="p-6">
                            <span className="font-bold text-[--color-text] uppercase text-sm">{k.naziv}</span>
                          </td>
                          <td className="p-6">
                            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest bg-blue-100 px-2 py-1 rounded">{k.kategorija}</span>
                          </td>
                          <td className="p-6 text-center font-bold text-gray-500">{k.cena} €</td>
                          <td className="p-6 text-center">
                            <span className="bg-blue-50 text-blue-600 font-black px-4 py-1 rounded-full text-sm">
                              {k.brojProdaja}
                            </span>
                          </td>
                          <td className="p-6 text-right">
                            <span className="text-xl font-black text-[--color-primary]">
                              {k.prihod.toLocaleString()} €
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-[--color-accent] text-[--color-text] border-t-2 border-[--color-primary]">
                        <td colSpan={3} className="p-6 font-bold uppercase tracking-widest">Ukupno:</td>
                        <td className="p-6 text-center font-black text-xl">{ukupnoProdato}</td>
                        <td className="p-6 text-right font-black text-2xl">{ukupno.toLocaleString()} €</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}