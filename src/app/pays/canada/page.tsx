import Checklist from "@/components/Checklist";

export default function CanadaPage() {
  return (
    <section className="page">
      <div className="container">

        <h1 className="title mb-4">Immigrer au Canada</h1>
        <p className="subtitle mb-8">
          Documents et étapes essentielles
        </p>

        <div className="card">
          <Checklist items={[
            "Passeport valide",
            "Preuve de fonds",
            "Certificat de police",
            "Test de langue"
          ]} />
        </div>

      </div>
    </section>
  );
}
