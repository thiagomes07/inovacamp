import clsx from "clsx";
import Heading from "@theme/Heading";
import styles from "./styles.module.css";

import qi_tech_at_the_top from "@site/static/img/qi_tech_at_the_top.png";
import blockchain_and_ai from "@site/static/img/blockchain_and_ai.png";
import credit from "@site/static/img/credit.png";

const FeatureList = [
  {
    title: "Crédito Inteligente e Acessível",
    imgSrc: credit,
    description: (
      <>
        Conectamos tomadores a um ecossistema global de investidores. Nosso <strong>score de crédito gamificado</strong> usa dados do dia a dia (Uber, iFood, etc.) para revelar o verdadeiro potencial de cada um, garantindo crédito justo e com liquidez instantânea via PIX.
      </>
    ),
  },
  {
    title: "Confiança via Blockchain e IA",
    imgSrc: blockchain_and_ai,
    description: (
      <>
        Usamos <strong>Blockchain</strong> para garantir transparência total em cada transação e permitir garantias tokenizadas. Nossa <strong>Inteligência Artificial</strong> valida dados e analisa riscos de forma justa, construindo um ecossistema de crédito mais seguro e eficiente para todos.
      </>
    ),
  },
  {
    title: "QI Tech: Do Unicórnio ao Domínio",
    imgSrc: qi_tech_at_the_top,
    description: (
      <>
        Uma solução projetada para levar a <strong>QI Tech</strong> de unicórnio a líder absoluta. Ao conquistar o varejo e democratizar o crédito, construiremos a <strong>maior e mais inovadora fintech da América Latina</strong>.
      </>
    ),
  },
];

function Feature({ imgSrc, title, description }) {
  return (
    <div className={clsx("col col--4")}>
      <div className="text--center">
        <img src={imgSrc} className={styles.featureSvg} alt={title} />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
        <div className={styles.centeredText}>
          <p>Serviços bancários são necessários, bancos não.</p>
        </div>
      </div>
    </section>
  );
}
