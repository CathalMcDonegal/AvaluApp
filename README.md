# AvaluApp

Gestió de cursos, classes, alumnes i avaluacions.

## Funcionalitats
- Cursos i classes
- Alumnes
- Fitxa individual
- Tres trimestres i avaluació global
- Ítems d'avaluació
- Observacions
- PWA responsive

## Properes fases
Importació Excel/PDF, editor d'ítems, informes Word amb plantilles, impressió/PDF i còpies de seguretat.


## Plantilles d'informes

Les plantilles base es troben a `templates/`:
- `1r-trimestre.html`
- `2n-trimestre.html`
- `3r-trimestre.html`
- `global.html`

Placeholders comuns: `{{student_name}}`, `{{course}}`, `{{group}}`, `{{academic_year}}`, `{{term}}`, `{{assessment_rows}}`, `{{term_summary_rows}}`, `{{global_rows}}` i `{{observations}}`.
