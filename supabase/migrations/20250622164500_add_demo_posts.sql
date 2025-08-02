
-- Füge Demo-Posts für die Community hinzu
INSERT INTO public.community_posts (id, user_id, pet_id, title, content, category, post_type, is_solved, likes_count, comments_count, created_at) VALUES
-- HUNDE-Posts
('11111111-1111-1111-1111-111111111111', null, null, 
 'Hilfe! Mein Golden Retriever hört nicht auf "Bleib"', 
 'Hallo zusammen! Ich trainiere seit Wochen mit meiner 3-jährigen Golden Retriever Hündin Bella das "Bleib"-Kommando, aber sie springt immer nach ein paar Sekunden auf. Hat jemand Tipps für mich? Ich verwende bereits Leckerlis als Belohnung, aber es klappt einfach nicht richtig.

Ich habe schon verschiedene Ansätze probiert:
- Längere Trainingseinheiten
- Kürzere Abstände
- Verschiedene Leckerlis

Aber nichts scheint zu funktionieren. Bella ist sonst sehr gehorsam, nur beim "Bleib" hakt es. Hat jemand ähnliche Erfahrungen gemacht?', 
 'hund', 'question', false, 12, 5, NOW() - INTERVAL '2 days'),

('22222222-2222-2222-2222-222222222222', null, null,
 'Erfolg: Schäferhund Rocky läuft endlich ohne Ziehen!', 
 'Nach monatelangem Training kann ich endlich stolz verkünden: Mein Deutscher Schäferhund Rocky zieht nicht mehr an der Leine! 🎉 

Hier ist was geholfen hat:
1. **Konsequenz** - jeden Tag 15 Minuten geübt
2. **Richtung wechseln** sobald er zieht
3. **Sofortige Belohnung** wenn er neben mir läuft
4. **Geduld** - es hat wirklich 4 Monate gedauert

Für alle, die noch kämpfen: Bleibt dran, es lohnt sich! Rocky ist jetzt ein Traum beim Spazierengehen.', 
 'hund', 'success', true, 18, 8, NOW() - INTERVAL '5 days'),

('33333333-3333-3333-3333-333333333333', null, null,
 'Apportier-Training: Labrador bringt Ball nicht zurück', 
 'Mein 2-jähriger Labrador Bruno rennt begeistert dem Ball hinterher, aber bringt ihn einfach nicht zurück! Er legt sich damit hin und kaut darauf herum. 

Das Problem: Er versteht nicht, dass er mir den Ball zurückbringen soll. Wie bringe ich ihm das bei?

Was ich schon probiert habe:
- Lange Leine verwendet
- Verschiedene Bälle probiert  
- "Bring" Kommando geübt

Hat jemand bewährte Tipps für das Apportier-Training bei Labradoren?', 
 'hund', 'question', false, 9, 6, NOW() - INTERVAL '1 day'),

-- KATZEN-Posts
('44444444-4444-4444-4444-444444444444', null, null,
 'Kratzbäume: Welche Höhe für Maine Coons?', 
 'Diskussion: Wie hoch sollte ein Kratzbaum für eine Maine Coon sein? 

Meine Whiskers ist sehr groß (7kg, 120cm Länge) und ich bin unsicher, ob unser aktueller Baum (1,50m) ausreicht. Sie klettert gerne sehr hoch und ich will nicht, dass sie sich langweilt.

**Fragen:**
- Mindesthöhe für Maine Coons?
- Brauchen sie stabilere Kratzbäume?
- Welche Marken könnt ihr empfehlen?

Was sind eure Erfahrungen mit großen Katzenrassen?', 
 'katze', 'discussion', false, 15, 7, NOW() - INTERVAL '1 day'),

('55555555-5555-5555-5555-555555555555', null, null,
 'Tipp: Katzenminze richtig dosieren für Siamkatzen', 
 'Viele übertreiben es mit Katzenminze! 💡

**Mein Tipp für Siamkatzen wie Luna:**
- Nur eine kleine Prise alle 2-3 Tage verwenden
- Siamkatzen reagieren sehr intensiv darauf
- Zu viel macht sie überdreht und territorial

Bei dieser Rasse ist weniger definitiv mehr! Luna wird bei zu viel Katzenminze richtig aggressiv gegenüber anderen Katzen.

**Dosierung die bei uns funktioniert:**
- 1/4 TL getrocknete Katzenminze
- Alle 3 Tage
- Nur für 10-15 Minuten verfügbar lassen', 
 'katze', 'tip', false, 11, 3, NOW() - INTERVAL '3 days'),

('66666666-6666-6666-6666-666666666666', null, null,
 'Britisch Kurzhaar lernt Katzenklo nicht', 
 'Meine Britisch Kurzhaar Mimi (1 Jahr) macht immer noch neben die Katzentoilette. 😿

**Was ich schon probiert habe:**
- Verschiedene Streus (Klumpen, Silikat, Naturstreu)
- Toilette an verschiedene Orte gestellt
- Zweite Toilette aufgestellt  
- Tierarzt gecheckt - alles okay

**Das Problem:** Sie geht ZUR Toilette, macht aber daneben auf den Boden.

Hat jemand Tipps für junge Katzen? Besonders für Briten? Ich bin langsam verzweifelt...', 
 'katze', 'question', false, 8, 9, NOW() - INTERVAL '4 days'),

-- PFERDE-Posts  
('77777777-7777-7777-7777-777777777777', null, null,
 'Hannoveraner verweigert Dressur-Lektionen', 
 'Problem mit meinem 8-jährigen Hannoveraner Thunder: Er war immer ein begeistertes Dressurpferd, aber seit zwei Wochen verweigert er alle höheren Lektionen.

**Die Situation:**
- Tierarzt hat ihn untersucht - körperlich alles in Ordnung
- Grundgangarten gehen noch
- Bei Seitengängen oder Übergängen bockt er
- Sonst ist er lieb und verschmust

**Meine Vermutung:** Könnte es mental/emotional sein? Vielleicht Überforderung?

Wie kann ich sein Vertrauen in die Dressurarbeit zurückgewinnen? Hat jemand ähnliche Erfahrungen mit Hannoveranern gemacht?', 
 'pferd', 'question', false, 7, 4, NOW() - INTERVAL '4 days'),

('88888888-8888-8888-8888-888888888888', null, null,
 'Bodenarbeit-Übungen für Friesen - meine Erfahrungen', 
 'Hier sind meine liebsten Bodenarbeit-Übungen mit meinem Friesen Storm: 💪

**Top 4 Übungen die super funktionieren:**

1. **Führtraining mit Richtungswechseln**
   - Aufmerksamkeit und Respekt
   - Täglich 10 Minuten

2. **Rückwärts gehen lassen** 
   - Stärkt Hinterhand
   - Verbessert Balance

3. **Seitwärts treten üben**
   - Gymnastizierung  
   - Vorbereitung für Dressur

4. **Gelassenheitstraining**
   - Mit Planen und Bällen
   - Baut Vertrauen auf

Friesen sind so lernwillig - das stärkt die Bindung enorm! Storm liebt diese gemeinsame Zeit ohne Reiter.', 
 'pferd', 'tip', false, 14, 6, NOW() - INTERVAL '6 days'),

-- KLEINTIERE-Posts
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', null, null,
 'Kaninchen endlich stubenrein! 🎉', 
 'ERFOLG! Nach 3 Monaten intensivem Training ist mein Kaninchen Coco endlich stubenrein! 🐰✨

**Der Schlüssel war:**
- **Feste Fütterungszeiten** (morgens und abends)
- **Katzenklo an der Lieblingsstelle** (Ecke wo sie eh hin gemacht hat)
- **Viel Geduld** - es dauert wirklich seine Zeit
- **Sofortige Reinigung** bei Unfällen

**Timeline:**
- Woche 1-4: Chaos überall
- Woche 5-8: Erste Erfolge  
- Woche 9-12: 90% Trefferquote
- Jetzt: Perfekt! 

Für alle, die mit Kaninchen-Stubenreinheit kämpfen: Es ist möglich! Gebt nicht auf! ❤️', 
 'kleintiere', 'success', true, 16, 4, NOW() - INTERVAL '1 day'),

('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', null, null,
 'Hamster sehr scheu - Handling-Tipps?', 
 'Mein Hamster Peanut versteckt sich sofort, wenn ich mich dem Käfig nähere. 🐹

**Das Problem:**
- Versteckt sich bei kleinster Bewegung
- Lässt sich nicht anfassen
- Wird panisch bei Annäherung

**Mein Ziel:** Ihn handhaben können (für Käfigreinigung, Tierarzt etc.) ohne Stress für ihn.

**Fragen:**
- Wie baue ich vorsichtig Vertrauen auf?
- Welche Schritte sind bei scheuen Hamstern wichtig?
- Wie lange dauert so etwas normalerweise?

Hat jemand Erfahrung mit sehr scheuen Hamstern? Tipps für geduldiges Vertrauenstraining?', 
 'kleintiere', 'question', false, 6, 11, NOW() - INTERVAL '3 days'),

-- VÖGEL-Posts
('cccccccc-cccc-cccc-cccc-cccccccccccc', null, null,
 'Wellensittich Charlie sagt "Hallo"! 🗣️', 
 'MEILENSTEIN ERREICHT! 🎉

Mein Wellensittich Charlie hat nach nur 2 Monaten sein erstes Wort gelernt! "Hallo" kommt schon richtig deutlich und er sagt es immer, wenn ich ins Zimmer komme.

**Meine Methode:**
- Jeden Morgen beim Füttern "Hallo Charlie" gesagt
- Immer die gleiche Betonung verwendet
- Mit Futter belohnt wenn er Ansätze gemacht hat
- Viel Geduld und täglich drangeblieben

So stolz auf meinen kleinen Wellensittich! 🐦💙

**Nächstes Projekt:** Wer hat Ideen für das nächste Wort? Was lernen Wellensittiche erfahrungsgemäß leicht?', 
 'voegel', 'success', true, 22, 12, NOW() - INTERVAL '2 days'),

('dddddddd-dddd-dddd-dddd-dddddddddddd', null, null,
 'Kanarienvogel Gesang fördern - eure Methoden?', 
 'Diskussion: Wie fördert ihr den Gesang bei euren Kanarienvögeln? 🎵

Mein Kiwi singt zwar schön, aber ich würde gerne mehr Vielfalt in seinem Repertoire haben.

**Meine bisherigen Versuche:**
- Klassische Musik gespielt
- Andere Kanarienvögel-Videos gezeigt
- Verschiedene Tageszeiten probiert

**Fragen an euch:**
- Spielt ihr anderen Vogelgesang vor?
- Welche Musik funktioniert am besten?
- Bestimmte Tageszeiten für Training?
- Belohnung bei gutem Gesang?

Welche Erfahrungen habt ihr gemacht? Was hat euren Kanarienvögeln geholfen, vielseitiger zu singen?', 
 'voegel', 'discussion', false, 13, 8, NOW() - INTERVAL '5 days'),

-- Weitere Posts
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', null, null,
 'Welpenschule: Lohnt sich das wirklich?', 
 'Unser 4 Monate alter Welpe Max (Mischling) soll in die Welpenschule. 🐕

**Ehrlich gesagt bin ich skeptisch:**
- Kosten: 120€ für 8 Stunden
- Kann man das nicht auch zu Hause machen?
- Max ist eigentlich schon ziemlich brav

**Meine Bedenken:**
- Andere Hunde könnten schlechten Einfluss haben
- Ist das Geld wert?
- Reicht YouTube + Bücher nicht aus?

**An alle Hundebesitzer:**
- Hat die Welpenschule euren Hunden wirklich geholfen?
- Was lernen sie dort, was man zu Hause nicht kann?
- Lohnt sich die Investition?

Würde mich über ehrliche Erfahrungsberichte freuen!', 
 'hund', 'discussion', false, 17, 13, NOW() - INTERVAL '7 days'),

('ffffffff-ffff-ffff-ffff-ffffffffffff', null, null,
 'Schildkröte Einstein frisst nicht mehr', 
 'Sorge um meine Landschildkröte Einstein (ca. 15 Jahre): Sie frisst seit einer Woche kaum noch etwas. 🐢

**Die Situation:**
- Normalerweise ist sie sehr verfressen
- Temperatur konstant bei 25°C
- UV-Beleuchtung läuft normal 12h/Tag
- Luftfeuchtigkeit passt
- Winterruhe ist es noch nicht (zu früh)

**Was sie noch frisst:**
- Manchmal ein bisschen Salat
- Löwenzahn wird ignoriert  
- Lieblings-Pellets: Nein

**Meine Frage:** Soll ich zum Tierarzt oder kann das bei alten Schildkröten normal sein?

Hat jemand Erfahrung mit Fressunlust bei Landschildkröten? Wann wird es bedenklich?', 
 'sonstige', 'question', false, 5, 7, NOW() - INTERVAL '8 days')

ON CONFLICT (id) DO NOTHING;
