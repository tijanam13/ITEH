import { Suspense } from "react";
import KurseviContent from "../../components/KurseviContent";
import { Loader2 } from "lucide-react";

export default function KurseviPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FFFBE9] flex justify-center items-center">
          <div className="text-center">
            <Loader2 className="animate-spin text-[#AD8B73] mb-4 mx-auto" size={48} />
            <p className="text-[#AD8B73] font-bold">Učitavanje kurseva...</p>
          </div>
        </div>
      }
    >
      <KurseviContent />
    </Suspense>
  );
}