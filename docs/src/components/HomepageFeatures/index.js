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
        Nossa plataforma P2P conecta um ecossistema global de investidores a tomadores de crédito, usando ativos do mundo real como garantia para oferecer as melhores condições.
      </>
    ),
  },
  {
    title: "Tecnologias Inteligentes",
    imgSrc: blockchain_and_ai,
    description: (
      <>
        Usamos <strong>Blockchain</strong> para tokenizar ativos e garantir transparência, enquanto nossa <strong>Inteligência Artificial</strong> analisa o valor e o risco desses ativos, tornando o crédito mais seguro e acessível.
      </>
    ),
  },
  {
    title: "QI Tech no Topo",
    imgSrc: qi_tech_at_the_top,
    description: (
      <>
        Uma solução projetada para levar a <strong>QI Tech</strong> de único unicórnio da América Latina em 2024 para a <strong>maior e mais inovadora fintech do continente</strong>.
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
