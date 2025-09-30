/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docsSidebar: [
    {
      type: 'category',
      label: '1. Visão Geral (Enterprise)',
      // MODIFIQUE A SEÇÃO 'link' ABAIXO
      link: {
        type: 'doc',
        id: 'visao-geral/solucao',
      },
      // FIM DA MODIFICAÇÃO
      items: [
        'visao-geral/solucao',
      ],
    },
    {
      type: 'category',
      label: '2. Visão de Engenharia (Engineering)',
      link: {
        type: 'generated-index',
        description: 'A visão de engenharia descreve a arquitetura e o design técnico da solução, detalhando a estrutura interna do software e seus mecanismos-chave.',
      },
      items: [
        'visao-de-engenharia/arquitetura-geral',
        'visao-de-engenharia/backend',
        'visao-de-engenharia/frontend',
      ],
    },
    {
      type: 'category',
      label: '3. Visão de Tecnologia (Technology)',
      link: {
        type: 'generated-index',
        description: 'Finalmente, a visão de tecnologia especifica as ferramentas, frameworks e a infraestrutura que serão utilizados para construir e implantar o projeto.',
      },
      items: [
        'visao-de-tecnologia/stack-tecnologico',
        'visao-de-tecnologia/infraestrutura-e-custos',
      ],
    },
  ],
};

export default sidebars;