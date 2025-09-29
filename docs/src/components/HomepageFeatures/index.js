import clsx from "clsx";
import Heading from "@theme/Heading";
import styles from "./styles.module.css";

import qi_tech_at_the_top from "@site/static/img/qi_tech_at_the_top.png";
import blockchain_and_ai from "@site/static/img/blockchain_and_ai.png";
import credit from "@site/static/img/credit.png";

const FeatureList = [
  {
    title: "Democratização do Acesso ao Crédito",
    imgSrc: credit,
    description: (
      <>
        Nossa solução P2P conecta diretamente investidores e tomadores de
        crédito, eliminando intermediários e democratizando o acesso ao
        financiamento para todos os perfis de usuários.
      </>
    ),
  },
  {
    title: "Tecnologias Inteligentes",
    imgSrc: blockchain_and_ai,
    description: (
      <>
        Utilizamos <strong>Blockchain</strong> para transparência e
        imutabilidade das transações, combinado com{" "}
        <strong>Inteligência Artificial</strong> para avaliação de risco e
        prevenção a fraudes em tempo real.
      </>
    ),
  },
  {
    title: "QI Tech no Topo",
    imgSrc: qi_tech_at_the_top,
    description: (
      <>
        Parceria com a <strong>QI Tech</strong>, a maior fintech da América
        Latina, garantindo infraestrutura robusta, compliance regulatório e
        escalabilidade para nossa solução inovadora.
      </>
    ),
  },
];

// --- PASSO 2: ATUALIZE O COMPONENTE FEATURE ---
// Ele agora receberá 'imgSrc' em vez de 'Svg' e usará uma tag <img>.
function Feature({ imgSrc, title, description }) {
  return (
    <div className={clsx("col col--4")}>
      <div className="text--center">
        {/* Usamos a tag <img> com o caminho da imagem */}
        <img src={imgSrc} className={styles.featureSvg} alt={title} />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

// O componente principal não precisa de nenhuma alteração.
export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
        {/* Texto centralizado EMBAIXO dos cards */}
        <div className={styles.centeredText}>
          <p>Serviços bancários são necessários, bancos não.</p>
        </div>
      </div>
    </section>
  );
}
