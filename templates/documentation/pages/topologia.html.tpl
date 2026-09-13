<!--
  Template: topologia.html
  Produtor: reversa-docs-mapper
  Skill invocada: especialista-d3 (modo hierárquico) ou HTML manual
  Page ID: topologia
  Categoria reversa: diagram
  Dados consumidos: _reversa_sdd/architecture.md (parseado)

  Marcadores:
  - TOPOLOGY_LEGACY: coluna esquerda, topologia detectada do legado
  - TOPOLOGY_MODERN: coluna direita, alternativa moderna proposta
  - TOPOLOGY_HYBRID: opcional, faixa central com a opção híbrida
-->

<!-- PAYLOAD_START -->
<section class="reversa-doc-topology" data-layout="side-by-side">
    <article class="reversa-doc-topology-col" data-variant="legacy">
        <h2>Topologia atual (legado)</h2>
        <!-- TOPOLOGY_LEGACY -->
    </article>
    <article class="reversa-doc-topology-col" data-variant="modern">
        <h2>Alternativa moderna</h2>
        <!-- TOPOLOGY_MODERN -->
    </article>
</section>

<section class="reversa-doc-topology-hybrid" hidden>
    <h2>Caminho híbrido (se aplicável)</h2>
    <!-- TOPOLOGY_HYBRID -->
</section>
<!-- PAYLOAD_END -->
