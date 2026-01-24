import Image from "next/image";
import ThemeToggle from "@/components/ThemeToggle";

const events = [
  {
    title: "Domingo de Celebracao",
    time: "Dom 18:00",
    desc: "Louvor, palavra e comunhao para toda a família.",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 12h16M12 4v16" />
      </svg>
    ),
  },
  {
    title: "Conexao de Jovens",
    time: "Sex 20:00",
    desc: "Uma noite vibrante de adoracao e relacionamento.",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 6h12v12H6z" />
        <path d="M9 9h6v6H9z" />
      </svg>
    ),
  },
  {
    title: "Intercessao e Cura",
    time: "Qua 19:30",
    desc: "Clamor pela cidade e tempo de ministracao.",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 4c4 3 6 6 6 9a6 6 0 0 1-12 0c0-3 2-6 6-9z" />
      </svg>
    ),
  },
];

const ministries = [
  "Louvor e Artes",
  "Kids",
  "Jovens",
  "Casais",
  "Acao Social",
  "Discipulado",
];

const ministryIcons = [
  <svg key="m1" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 3l3 6 6 1-4 4 1 6-6-3-6 3 1-6-4-4 6-1z" />
  </svg>,
  <svg key="m2" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 8h16v8H4z" />
    <path d="M8 12h8" />
  </svg>,
  <svg key="m3" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 4v16" />
    <path d="M6 10h12" />
  </svg>,
  <svg key="m4" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M6 7h12v10H6z" />
    <path d="M9 10h6" />
  </svg>,
  <svg key="m5" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 12h14" />
    <path d="M12 5v14" />
    <circle cx="12" cy="12" r="9" />
  </svg>,
  <svg key="m6" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 18l8-12 8 12" />
  </svg>,
];

export default function Home() {
  return (
    <main className="page">
      <div className="grid-overlay" aria-hidden="true" />

      <header className="hero">
        <nav className="nav">
          <div className="brand">
            <div className="logo-shell">
              <Image
                src="/logo.jfif"
                alt="Logo Assembleia de Deus"
                width={76}
                height={76}
                className="logo"
                priority
              />
            </div>
            <div>
              <p className="brand-title">Assembleia de Deus</p>
              <span className="brand-sub">Ministério Missão Jardim das Oliveiras</span>
            </div>
          </div>
          <div className="nav-links">
            <a href="#visao">Visao</a>
            <a href="#programacao">Programacao</a>
            <a href="#ministerios">Ministerios</a>
            <a href="#contato">Contato</a>
          </div>
          <div className="nav-actions">
            <ThemeToggle />
            <a className="nav-cta" href="#visitar">Planeje sua visita</a>
          </div>
        </nav>
        <section className="hero-grid">

          <div className="hero-copy">
            <h1>Nossa missão é te amar</h1>
            <p className="lead">
              Cultos intensos, cuidado pastoral e uma comunidade que caminha
              junta. Descubra um ambiente vibrante para adorar, aprender e servir.
            </p>
            <div className="cta-row">
              <a className="cta blue" href="#programacao">
                Ver programacao
              </a>
              <a className="cta ghost" href="#visitar">
                Quero visitar
              </a>
            </div>
            <div className="hero-meta">
              <div>
                <span className="meta-label">Ao vivo</span>
                <p className="meta-value">Dom 18:00</p>
              </div>
              <div>
                <span className="meta-label">Local</span>
                <p className="meta-value">Av. Senador Canedo, Qd. 28, Lt. 13 Jardim das Oliveiras - Senador Canedo</p>
              </div>
              <div>
                <span className="meta-label">Pastor local</span>
                <p className="meta-value">Sérgio Araújo</p>
              </div>
            </div>
          </div>
          <div className="hero-card" aria-hidden="true">
            <div className="card-header">
              <span className="pulse" />
              <p>Agenda da Semana</p>
            </div>
            <ul>
              {events.map((event) => (
                <li key={event.title}>
                  <span className="icon">{event.icon}</span>
                  <div>
                    <strong>{event.title}</strong>
                    <span>{event.time}</span>
                    <p>{event.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="card-footer">
              <a href="#programacao">Ver todos os encontros</a>
            </div>
          </div>
        </section>
      </header>
      <section className="section video-section" aria-label="Evento ao vivo">
        <div className="video-wrap">
          <div className="video-track" aria-hidden="true">
            <div className="video-slide">
              <video autoPlay muted loop playsInline poster="/logo.jfif">
                <source src="/videos/evento-placeholder.mp4" type="video/mp4" />
              </video>
            </div>
            <div className="video-slide">
              <video autoPlay muted loop playsInline poster="/logo.jfif">
                <source src="/videos/evento-placeholder.mp4" type="video/mp4" />
              </video>
            </div>
            <div className="video-slide">
              <video autoPlay muted loop playsInline poster="/logo.jfif">
                <source src="/videos/evento-placeholder.mp4" type="video/mp4" />
              </video>
            </div>
            <div className="video-slide">
              <video autoPlay muted loop playsInline poster="/logo.jfif">
                <source src="/videos/evento-placeholder.mp4" type="video/mp4" />
              </video>
            </div>
            <div className="video-slide">
              <video autoPlay muted loop playsInline poster="/logo.jfif">
                <source src="/videos/evento-placeholder.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
          <div className="video-overlay">
            <p className="kicker">Ao vivo</p>
            <h2>Um ambiente de adoracao acontecendo agora</h2>
            <p>
              Substitua este video pelo registro do seu culto ou evento especial.
            </p>
            <a className="cta blue" href="#programacao">Ver programacao</a>
          </div>
        </div>
      </section>

      <section id="visao" className="section vision">
        <div>
          <p className="kicker">Nossa visao</p>
          <h2>Formar discipulos apaixonados por Jesus e pela cidade</h2>
        </div>
        <p className="section-text">
          Somos uma igreja evangélica com foco em restauração, cuidado e missão.
          Investimos em pessoas, geracoes e famílias para transformar vidas com o
          poder do evangelho.
        </p>
        <div className="stats">
          <div>
            <span>12+</span>
            <p>Anos de ministério</p>
          </div>
          <div>
            <span>40+</span>
            <p>Equipes servindo</p>
          </div>
          <div>
            <span>800+</span>
            <p>Familias alcancadas</p>
          </div>
        </div>
      </section>

      <section id="programacao" className="section schedule">
        <div className="section-head">
          <div>
            <p className="kicker">Programacao</p>
            <h2>Encontros pensados para todas as idades</h2>
          </div>
          <a className="cta small" href="#contato">
            Receber lembrente
          </a>
        </div>
        <div className="schedule-grid">
          {events.map((event) => (
            <article key={event.title} className="schedule-card">
              <span className="icon">{event.icon}</span>
              <h3>{event.title}</h3>
              <span>{event.time}</span>
              <p>{event.desc}</p>
              <button className="chip" type="button">Confirmar presenca</button>
            </article>
          ))}
        </div>
      </section>

      <section id="ministerios" className="section ministries">
        <div>
          <p className="kicker">Ministerios</p>
          <h2>Espacos para servir, crescer e liderar</h2>
        </div>
        <div className="ministry-grid">
          {ministries.map((item, index) => (
            <div key={item} className="ministry-card">
              <span className="icon">{ministryIcons[index]}</span>
              <strong>{item}</strong>
              <p>
                Times treinados para desenvolver dons e gerar impacto em todas as
                geracoes.
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="section highlight">
        <div className="highlight-card">
          <div>
            <p className="kicker">Nossa cultura</p>
            <h2>Adoracao intensa, palavra viva e cuidado real</h2>
            <p>
              Cada encontro e uma oportunidade de ouvir Deus e ser fortalecido.
              Nos importamos com a sua historia e caminhada.
            </p>
          </div>
          <div className="highlight-info">
            <div>
              <h3>Grupos pequenos</h3>
              <p>Comunhao e discipulado durante a semana.</p>
            </div>
            <div>
              <h3>Atendimento pastoral</h3>
              <p>Apoio espiritual e acompanhamento continuo.</p>
            </div>
            <div>
              <h3>Impacto social</h3>
              <p>Projetos que transformam comunidades.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="visitar" className="section visit">
        <div>
          <p className="kicker">Primeira vez?</p>
          <h2>Planeje sua visita e venha como voce esta</h2>
          <p>
            Estacionamento proximo, recepcao acolhedora e um time pronto para
            caminhar com voce.
          </p>
        </div>
        <form className="visit-form">
          <input placeholder="Seu nome" type="text" />
          <input placeholder="WhatsApp" type="tel" />
          <button type="button">Quero ser recebido</button>
        </form>
      </section>

      <section id="contato" className="section faq">
        <div>
          <p className="kicker">Duvidas frequentes</p>
          <h2>Informacoes rapidas para sua visita</h2>
        </div>
        <div className="faq-grid">
          <details open>
            <summary>Onde estamos?</summary>
            <p>Av. Senador Canedo, Qd. 28, Lt. 13 Jardim das Oliveiras - Senador Canedo</p>
          </details>
          <details>
            <summary>Tem programacao para criancas?</summary>
            <p>Sim, nosso ministério Kids acontece em todos os cultos.</p>
          </details>
          <details>
            <summary>Como participar dos grupos pequenos?</summary>
            <p>Preencha o formulario e nossa equipe entra em contato.</p>
          </details>
        </div>
      </section>

      <footer className="footer">
        <div>
          <strong>Assembleia de Deus Ministério Missão Jardim das Oliveiras</strong>
          <p>Fé, missão e família para nossa cidade.</p>
        </div>
        <div className="footer-links">
          <a href="#programacao">Programacao</a>
          <a href="#ministerios">Ministerios</a>
          <a href="#visitar">Visitar</a>
        </div>
      </footer>
    </main>
  );
}




































