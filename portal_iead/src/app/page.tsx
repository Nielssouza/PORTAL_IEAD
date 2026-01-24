import Image from "next/image";
import ThemeToggle from "@/components/ThemeToggle";
import PageViewTracker from "@/components/PageViewTracker";
import path from "path";
import { readdir } from "fs/promises";

const events = [
  {
    title: "Domingo de Celebração",
    time: "Dom 18:00",
    desc: "Louvor, palavra e comunhão para toda a família.",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 12h16M12 4v16" />
      </svg>
    ),
  },
  {
    title: "Conexão de Jovens",
    time: "Sex 20:00",
    desc: "Uma noite vibrante de adoração e relacionamento.",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 6h12v12H6z" />
        <path d="M9 9h6v6H9z" />
      </svg>
    ),
  },
  {
    title: "Intercessão e Cura",
    time: "Qua 19:30",
    desc: "Clamor pela cidade e tempo de ministração.",
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
  "Ação Social",
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

async function getGalleryImages() {
  const photosDir = path.join(process.cwd(), "public", "midias", "fotos");
  try {
    const files = await readdir(photosDir);
    return files
      .filter((file) => /\.(jpe?g|png|webp|gif)$/i.test(file))
      .sort()
      .map((file) => `/midias/fotos/${file}`);
  } catch {
    return [];
  }
}
async function getVideoSources() {
  const videosDir = path.join(process.cwd(), "public", "midias", "videos");
  try {
    const files = await readdir(videosDir);
    return files
      .filter((file) => /\.(mp4|webm|ogg)$/i.test(file))
      .sort()
      .map((file) => `/midias/videos/${file}`);
  } catch {
    return [];
  }
}
export default async function Home() {
  const galleryImages = await getGalleryImages();
  const galleryRowA = [...galleryImages, ...galleryImages];
  const galleryRowB = [...galleryImages].reverse().concat([...galleryImages].reverse());
  const videoSources = await getVideoSources();
  const videoRowA = [...videoSources, ...videoSources];
  const videoRowB = [...videoSources].reverse().concat([...videoSources].reverse());

  return (
    <main className="page">
      <PageViewTracker path="/" />
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
            <a href="#visao">Visão</a>
            <a href="#programacao">Programação</a>
            <a href="#galeria">Galeria</a>
            <a href="#ministerios">Ministérios</a>
            <a href="#contato">Contato</a>
          </div>
          <div className="nav-actions">
            <ThemeToggle />
            <a className="nav-cta" href="/login">Área de login</a>
            <a className="nav-cta" href="/registro">Cadastre-se</a>
            <a className="nav-cta" href="#visitar">Planeje sua visita</a>
          </div>
        </nav>
        <section className="hero-grid">

          <div className="hero-copy">
            <h1>Nossa missão é te amar</h1>
            <p className="lead">
              2026, ano de Efraim. Eu sou a videira, vós, as varas; quem está em mim, e eu nele, este dá muito fruto. João 15:5.
              2026 sendo duplamente frutífero.
            </p>
            <div className="cta-row">
              <a className="cta blue" href="#programacao">
                Ver programação
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
      <section id="videos" className="section video-gallery">
        <div className="section-head gallery-head">
          <div>
            <p className="kicker">{"V\u00eddeos"}</p>
            <h2>Momentos vivos dos nossos cultos</h2>
          </div>
          <p className="section-text">
            Reviva partes do culto e da comunhão em um carrossel contínuo.
          </p>
        </div>
        <div className="gallery-viewport video-viewport">
          <div className="gallery-track track-a">
            {videoRowA.map((src, idx) => (
              <div className="video-card" key={`va-${idx}`}>
                <video muted loop playsInline preload="metadata" autoPlay poster="/logo.jfif">
                  <source src={encodeURI(src)} type="video/mp4" />
                </video>
              </div>
            ))}
          </div>
          <div className="gallery-track track-b">
            {videoRowB.map((src, idx) => (
              <div className="video-card" key={`vb-${idx}`}>
                <video muted loop playsInline preload="metadata" autoPlay poster="/logo.jfif">
                  <source src={encodeURI(src)} type="video/mp4" />
                </video>
              </div>
            ))}
          </div>
        </div>
      </section>
<section id="galeria" className="section gallery">
        <div className="section-head gallery-head">
          <div>
            <p className="kicker">Galeria</p>
            <h2>Momentos que contam nossa história</h2>
          </div>
          <p className="section-text">
            Um mosaico vivo de adoração, comunhão e serviço que mostra nossa igreja em movimento.
          </p>
        </div>
        <div className="gallery-viewport">
          <div className="gallery-track track-a">
            {galleryRowA.map((src, idx) => (
              <div className="gallery-card" key={`a-${idx}`}>
                <img src={src} alt="Momento da igreja" loading="lazy" />
              </div>
            ))}
          </div>
          <div className="gallery-track track-b">
            {galleryRowB.map((src, idx) => (
              <div className="gallery-card" key={`b-${idx}`}>
                <img src={src} alt="Momento da igreja" loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </section>
      <section id="visao" className="section vision">
        <div>
          <p className="kicker">Nossa visão</p>
          <h2>Formar discípulos apaixonados por Jesus e pela cidade</h2>
        </div>
        <p className="section-text">
          Somos uma igreja evangélica com foco em restauração, cuidado e missão.
          Investimos em pessoas, gerações e famílias para transformar vidas com o
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
            <p>Famílias alcançadas</p>
          </div>
        </div>
      </section>

      <section id="programacao" className="section schedule">
        <div className="section-head">
          <div>
            <p className="kicker">Programação</p>
            <h2>Encontros pensados para todas as idades</h2>
          </div>
          <a className="cta small" href="#contato">
            Receber lembrete
          </a>
        </div>
        <div className="schedule-grid">
          {events.map((event) => (
            <article key={event.title} className="schedule-card">
              <span className="icon">{event.icon}</span>
              <h3>{event.title}</h3>
              <span>{event.time}</span>
              <p>{event.desc}</p>
              <button className="chip" type="button">Confirmar presença</button>
            </article>
          ))}
        </div>
      </section>

      <section id="ministerios" className="section ministries">
        <div>
          <p className="kicker">Ministérios</p>
          <h2>Espaços para servir, crescer e liderar</h2>
        </div>
        <div className="ministry-grid">
          {ministries.map((item, index) => (
            <div key={item} className="ministry-card">
              <span className="icon">{ministryIcons[index]}</span>
              <strong>{item}</strong>
              <p>
                Times treinados para desenvolver dons e gerar impacto em todas as
                gerações.
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="section highlight">
        <div className="highlight-card">
          <div>
            <p className="kicker">Nossa cultura</p>
            <h2>Adoração intensa, palavra viva e cuidado real</h2>
            <p>
              Cada encontro é uma oportunidade de ouvir Deus e ser fortalecido.
              Nos importamos com a sua história e caminhada.
            </p>
          </div>
          <div className="highlight-info">
            <div>
              <h3>Grupos pequenos</h3>
              <p>Comunhão e discipulado durante a semana.</p>
            </div>
            <div>
              <h3>Atendimento pastoral</h3>
              <p>Apoio espiritual e acompanhamento contínuo.</p>
            </div>
            <div>
              <h3>Impacto social</h3>
              <p>Projetos que transformam comunidades.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="pastor" className="section pastor">
        <div className="pastor-card">
          <div className="pastor-photo">
            <Image
              src="/midias/fotos/_MG_6206.JPG"
              alt="Pastor Sergio Araujo"
              width={520}
              height={640}
              className="pastor-img"
            />
          </div>
          <div className="pastor-content">
            <p className="kicker">Biografia do pastor</p>
            <h2>{"Sergio Ara\u00fajo"}</h2>
            <p className="section-text">
              Pastor local da Assembleia de Deus Ministério Missão Jardim das Oliveiras. Servindo com
              dedicação, ele tem como foco o ensino bíblico, o cuidado pastoral e a formação de uma
              igreja que ama pessoas e vive a missão de Cristo.
            </p>
          </div>
        </div>
      </section>
      <section id="visitar" className="section visit">
        <div>
          <p className="kicker">Primeira vez?</p>
          <h2>{"Planeje sua visita e venha como voc\u00ea est\u00e1"}</h2>
          <p>
            Estacionamento próximo, recepção acolhedora e um time pronto para
            caminhar com você.
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
          <p className="kicker">Dúvidas frequentes</p>
          <h2>Informações rápidas para sua visita</h2>
        </div>
        <div className="faq-grid">
          <details open>
            <summary>Onde estamos?</summary>
            <p>Av. Senador Canedo, Qd. 28, Lt. 13 Jardim das Oliveiras - Senador Canedo</p>
          </details>
          <details>
            <summary>Tem programação para crianças?</summary>
            <p>Sim, nosso ministério Kids acontece em todos os cultos.</p>
          </details>
          <details>
            <summary>Como participar dos grupos pequenos?</summary>
            <p>Preencha o formulário e nossa equipe entra em contato.</p>
          </details>
        </div>
      </section>

      <footer className="footer">
        <div>
          <strong>Assembleia de Deus Ministério Missão Jardim das Oliveiras</strong>
          <p>Fé, missão e família para nossa cidade.</p>
        </div>
                <div className="footer-links">
          <a href="#programacao">Programação</a>
          <a href="#galeria">Galeria</a>
          <a href="#ministerios">Ministérios</a>
          <a href="#visitar">Visitar</a>
        </div>
      </footer>
    </main>
  );
}






































































