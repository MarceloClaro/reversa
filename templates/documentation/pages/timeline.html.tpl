<!--
  Template: timeline.html
  Produtor: reversa-docs-analyst
  Skill invocada: highcharts-visualizer (Highcharts Timeline)
  Page ID: timeline
  Categoria reversa: diagram
  Dados consumidos: assets/data/timeline.json (derivado de .reversa/chronicle.md)

  Marcadores:
  - HEAD_EXTRAS: <script src="assets/vendor/highcharts.js"></script>
                 + <script src="assets/vendor/highcharts-accessibility.js"></script>
                 + <script src="assets/vendor/highcharts-timeline.js"></script>
                 (todos baixados pelo Publisher via vendor-pins.yaml,
                  highcharts@11.4.8)
  - CHART_TIMELINE: container da timeline
  - EVENT_DETAILS: painel lateral com detalhes do evento clicado
  - SCRIPTS: monta a timeline a partir de window.RV_DATA.timeline (sem fetch local)
-->

<!-- PAYLOAD_START -->
<section class="reversa-doc-timeline" data-layout="split">
    <div class="reversa-doc-timeline-stage">
        <div id="chart-timeline"><!-- CHART_TIMELINE --></div>
    </div>
    <aside class="reversa-doc-timeline-details" aria-live="polite">
        <h2>Detalhes do evento</h2>
        <div id="event-details">
            <!-- EVENT_DETAILS -->
            <p class="reversa-doc-empty-hint">Clique em um evento na timeline para ver detalhes.</p>
        </div>
    </aside>
</section>
<!-- PAYLOAD_END -->
