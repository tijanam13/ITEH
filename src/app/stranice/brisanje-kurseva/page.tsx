import RoleGuard from "../../components/RoleGuard";

export default function BrisanjeKursevaPage() {
  return (
    <RoleGuard allowedRoles={["EDUKATOR"]}>
      { }
      <div className="container mx-auto">
        <h1>Brisanje kurseva</h1>
        <form>...</form>
      </div>
    </RoleGuard>
  );
}