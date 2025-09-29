// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docsSidebar: [
    'intro', 
    {
      type: 'category',
      label: '1. Visão Geral (Enterprise)',
      link: {
        type: 'generated-index',
        description: 'Esta seção aborda o "porquê" do projeto, seu alinhamento estratégico com a QI Tech e o modelo de negócio proposto.',
      },
      // CORREÇÃO: Removidos os números dos caminhos (IDs)
      items: [
        'visao-geral/introducao',
        'visao-geral/modelo-de-negocio',
      ],
    },
    {
      type: 'category',
      label: '2. Visão Funcional (Information)',
      link: {
        type: 'generated-index',
        description: 'Aqui detalhamos "o que" o sistema fará, descrevendo os requisitos da perspectiva do usuário e suas jornadas de interação.',
      },
      // CORREÇÃO: Removidos os números dos caminhos (IDs)
      items: [
        'visao-funcional/requisitos-funcionais',
        'visao-funcional/jornada-do-usuario',
      ],
    },
    {
      type: 'category',
      label: '3. Visão Não-Funcional (Computational)',
      link: {
        type: 'generated-index',
        description: 'Esta visão foca em "como" o sistema deve se comportar, definindo os atributos de qualidade essenciais como segurança, escalabilidade e performance.',
      },
      // CORREÇÃO: Removidos os números dos caminhos (IDs)
      items: [
        'visao-nao-funcional/requisitos-nao-funcionais',
        'visao-nao-funcional/privacidade-e-conformidade',
      ],
    },
    {
      type: 'category',
      label: '4. Visão de Engenharia (Engineering)',
      link: {
        type: 'generated-index',
        description: 'A visão de engenharia descreve a arquitetura e o design técnico da solução, detalhando a estrutura interna do software e seus mecanismos-chave.',
      },
      // CORREÇÃO: Removidos os números dos caminhos (IDs)
      items: [
        'visao-de-engenharia/arquitetura-geral',
        'visao-de-engenharia/backend',
        'visao-de-engenharia/frontend',
        'visao-de-engenharia/mecanismos-chave',
      ],
    },
    {
      type: 'category',
      label: '5. Visão de Tecnologia (Technology)',
      link: {
        type: 'generated-index',
        description: 'Finalmente, a visão de tecnologia especifica as ferramentas, frameworks e a infraestrutura que serão utilizados para construir e implantar o projeto.',
      },
      // CORREÇÃO: Removidos os números dos caminhos (IDs)
      items: [
        'visao-de-tecnologia/stack-tecnologico',
        'visao-de-tecnologia/infraestrutura-e-custos',
      ],
    },
  ],
};

export default sidebars;
