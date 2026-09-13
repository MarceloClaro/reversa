<!--
  Template: glossario.html
  Produtor: reversa-docs-storyteller
  Page ID: glossario
  Categoria reversa: diagram
  Dados consumidos: assets/data/soul.json (derivado de .reversa/soul.md)

  Marcadores:
  - GLOSSARY_SEARCH: input de busca cliente-side
  - GLOSSARY_CARDS: cards de conceitos
  - SCRIPTS: inline JS para busca e filtro
-->

<!-- PAYLOAD_START -->
<section class="reversa-doc-glossary">
    <header class="reversa-doc-glossary-header">
        <label for="glossary-search" class="visually-hidden">Buscar conceito</label>
        <input
            type="search"
            id="glossary-search"
            placeholder="Buscar conceito..."
            autocomplete="off"
        >
        <!-- GLOSSARY_SEARCH -->
    </header>
    <div class="reversa-doc-glossary-grid" id="glossary-grid">
        <!-- GLOSSARY_CARDS -->
    </div>
</section>
<!-- PAYLOAD_END -->
