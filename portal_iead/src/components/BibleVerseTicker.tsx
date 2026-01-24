"use client";

import { useEffect, useState } from "react";

type Verse = {
  reference: string;
  text: string;
};

const VERSES: Verse[] = [
  {
    reference: "Jo\u00e3o 3:16",
    text:
      "Porque Deus amou o mundo de tal maneira que deu o seu Filho unig\u00eanito, para que todo o que nele cr\u00ea n\u00e3o pere\u00e7a, mas tenha a vida eterna.",
  },
  {
    reference: "Salmo 23:1",
    text: "O Senhor \u00e9 o meu pastor; nada me faltar\u00e1.",
  },
  {
    reference: "Isa\u00edas 41:10",
    text:
      "N\u00e3o temas, porque eu sou contigo; n\u00e3o te assombres, porque eu sou o teu Deus; eu te fortale\u00e7o, e te ajudo, e te sustento com a destra da minha justi\u00e7a.",
  },
  {
    reference: "Romanos 8:28",
    text:
      "Sabemos que todas as coisas cooperam para o bem daqueles que amam a Deus, daqueles que s\u00e3o chamados segundo o seu prop\u00f3sito.",
  },
  {
    reference: "Prov\u00e9rbios 3:5-6",
    text:
      "Confia no Senhor de todo o teu cora\u00e7\u00e3o e n\u00e3o te estribes no teu pr\u00f3prio entendimento. Reconhece-o em todos os teus caminhos, e ele endireitar\u00e1 as tuas veredas.",
  },
  {
    reference: "Filipenses 4:6-7",
    text:
      "N\u00e3o andeis ansiosos por coisa alguma; em tudo, por\u00e9m, sejam conhecidas diante de Deus as vossas peti\u00e7\u00f5es, pela ora\u00e7\u00e3o e pela s\u00faplica com a\u00e7\u00f5es de gra\u00e7as.",
  },
];

export default function BibleVerseTicker() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % VERSES.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const verse = VERSES[index];

  return (
    <div className="verse-card" key={verse.reference}>
      <span className="verse-reference">{verse.reference}</span>
      <p className="verse-text">{verse.text}</p>
    </div>
  );
}
