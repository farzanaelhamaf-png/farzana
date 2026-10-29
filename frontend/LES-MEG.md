# Om meg – farzana.no

Kopier `src/app/om-meg/page.js` til `frontend/src/app/om-meg/page.js` og `src/lib/about-content.js` til `frontend/src/lib/about-content.js`.

Siden åpnes på http://localhost:3000/om-meg.

Siden leser valgfritt fra `site_content` med id=2. Uten denne raden viser den standardtekst. For å gjøre siden redigerbar i admin må administrasjonspanelet utvides med redigering av id=2 og bildeopplasting for feltene hero_image, story_image og nature_image. Dette er IKKE inkludert i denne pakken.

Foreløpig vises fargegraderinger i stedet for bilder. Bruk egne bilder når admin-redigering er koblet til.

Oppdater menyen på forsiden fra href="#om" til href="/om-meg" for å lenke til denne siden.
