<script lang="ts">
	import { WorkList } from "$lib/types";
	import { Button, Card, Input, Spinner } from 'flowbite-svelte';
	import { zodResponseFormat } from 'openai/helpers/zod.mjs';
	let chunk = `25 PLUS PIANO SOLO 
25 Jahre Frau und Musik/25 years Women in Music 
Jubiläumsausgabe/ 
Jubilee edition 
Mit Kurzviten der Komponistinnen und Werkbeschrei.
bungen/with short biographies and notes on the works 
180 Seiten, DIn A4 (3/4) fue 4660 ISMn 979-0-50012-966-0 ISBn: 978-3-927327-59-7     
Deutscher Musikeditionspreis 2006 
Best Edition in Germany 2006! 

„25 Jahre alt werden können viele. Aber ein so wunderbares Geschenk machen sich und ihren Lieben die wenigsten. Man kann es anfassen, daran riechen, darin blättern. Man kann darin lesen, auf deutsch und auf eng.lisch. Man kann es spielen oder spielen las-sen. Man kann es öffentlich aufführen. und weiterschenken kann man es natürlich auch. Denn die zweisprachige Jubiläums-Edition 25 plus – PIAnO SOLO bietet eine ausgezeich.nete Gelegenheit zur Begegnung mit 27 zeit.genössischen Komponistinnen aus 14 Län.dern.“ (Frankfurter Rundschau, 20.10.2004) 
Inhalt/Contents: Liana Alexandra, Rumä.nien: Cadenza; Maria de Alvear, Spanien: Soles interiores; Caroline Ansink, nieder.lande: Los; Matilde Capuis, Italien: Co.rale; Carmen Maria Cârneci, Rumänien: conSolar; Diana Cemerytë, Litauen: Still; Gloria Coates, uSA: The Books; Andrea Csollány, Deutschland: Short Story; Violeta Dinescu, Deutschland: Telomer; Susanne Swiridoff, Deutschland: Pagode; Siegrid Ernst, Deutschland: Klangschat.ten; Tsippi Fleischer, Israel: In Chromatic Mood; ursula Görsch, Deutschland/ Ghana: Piano latinero: Habanera, Carioca und Zortziko; Barbara Heller, Deutschland: nacht-Tagebuch; Silvia Leonor Alvarez de la Fuente, Argentinien: Variaciones; ursula Mamlok, Deutschland/ uSA: Inward Journey/In high Spirits; Bernadetta Matuszczak, Polen: Kontraste per pianoforte; Ruth McGuire, uSA: Fünf lyrische Miniaturen; Florentine Mulsant, Frankreich: Sonate; Vivienne Olive, England: Prometheus meets Purcell; Sibylle Pomorin, Deutschland: Zahlenspiele; Ruth Schonthal, Deutsch.land/uSA: Toccata & Arietta; Eva Schorr, Deutschland: Tango 25; Margarete Sorg-Rose, Deutschland: Corrente; Joanna Stepalska-Spix, Polen: non Perpetuum Mobile; Ludmila Yurina, ukraine: Angel of white Day; Marliese Zeiner, Tschechien/ Deutschland: Capriccietti 

extensive edition with short biographies and notes on the works (german/english). From A for Alexandra to Z for Zeiner: 27 contem.porary women composers from germany, england, France, Rumania, Poland and other european countries, the uSA and Argentina have donated a piano piece on the occasion of the 25th anniversary in 2004 of the In.ternationaler Arbeitskreis Frau und Musik (International Working group Women in Music). the pieces were performed at the anniversary celebration in Frankfurt and have now been collected in this unique an.niversary edition. they are as varied as the personalities of the composers themselves, ranging from witty and playful to strictly dis.ciplined, virtuoso to poetic, meditative, me.lodious and harmonious to shrilly aggressive. 
Brücke ohne Ufer 
Klaviermusik von Komponistinnen aus Ex-Jugoslawien (Tatjana Prelevic) fue 10131 ISMn 979-0-50182-131-0 Inhalt/Contents: Ljubica Maric: Song and Dance, Tatjana Prelevic: Djet(l)ic, Jelena Dabic: Danube Suite, Sne.ana ne.ic: Bolero in Dark Red, Larisa Vrhunc: Skozi ogledalo 

pian é forte. Klaviermusik Music for Piano 
Women Compo.sers through the Centuries (Barbara Gabler) Partitur mit Vor.wort, Biografien und Werknotizen 

Score with preface, biographies and notes on the works Jubiläumsausgabe zum 25-jährigen Furo.re Verlagsjubiläum/Jubilee edition for the 25th Furore birthday (2/3) fue 11025   ISMn 979-0-50182-325-3 17 Klavierstücke von Komponistinnen aus zehn Ländern: Anna Bon di Venezia (ca.1740–?): Sonata I, Maria Hester Park (1760–1813): Sonata I, Maria Szymanow.ska (1789–1831): Contre-danse, Emilie Zumsteeg (1796–1857): Polonaise nr. 3, Louise Farrenc (1804–1875): nocturne op. 49/1, Mel Bonis (1858–1937): Prélude op. 10, Fanny Hensel geb. Mendelssohn (1805–1847): Klavierstück E-Dur und Andante d-Moll (Erstveröffentlichung), Cécile Chaminade (1857–1944): Marche Russe, Ruth Schonthal (1924–2006): The Seagull’s slow Ascent and Descent, Ljubica Maric (1909–2003): Song and Dance, Barbara Heller (*1936): nelkenblume, Viera Janárceková (*1941): Tröpfelnde Elegie, Hope Lee (*1953): Flower Drum Dance, Sibylle Pomorin (*1956): nr. III aus: Istanbuler Kompositionen, Florentine Mulsant (*1962): nr. II und III aus: Cinq Pièces pour les enfants, Vivienne Olive (*1950): Bush Gin Rag 
um der großen nachfrage nach einem über.sichtsband mit relativ leicht spielbarer Kla.viermusik von Komponistinnen gerecht zu werden, hat Barbara Gabler einen Band mit 17 Klavierstücken aus zehn Ländern zusam.mengestellt. Diese Stücke locken durch eine tänzerische Art, sprechen das Herz an oder machen durch ihren Klang neugierig. Der Sammelband beginnt mit den Sonaten von Anna Bon di Venezia, die in einer Zeit des stilistischen übergangs schrieb und Ba-rock und Vorklassik miteinander verbindet. Gute Klavierwerke mit Avantgarde-Techni.ken für den unterricht sind mit Ruth Schon.thal und Hope Lee vertreten. Sie laden zum Spielen und Entdecken ein. „Die Sammlung bietet reizvolle Ansichten der „nebenwege“, die die Klaviermusik in der angegebenen Zeit durchschritten hat. Die Stücke sind von moderatem Schwierig.keitsgrad. Insgesamt sind viele typische For-men des Klaviersatzes der frühklassischen und romantischen Musik vertreten, aller.dings nur mit wenigen polyfonen Ansätzen. Das längste und anspruchsvollste Stück ist sicher das nocturne von Louise Farrenc, das an die Sprache der nocturnes von Field und Chopin erinnert. Auf folkloristische Klänge trifft man im Song and Dance von Maric oder im Flower Drum Dance von Lee. Eine geglückte Balance zwischen Einfachheit, Transparenz, rhythmischer Raffinesse, Aus.nutzung der Register des Instruments und dynamischer Bandbreite weisen die kleinen Stücke von Florentine Mulsant auf.“ (üben und Musizieren 2011) 
In anniversary mood – 25 years of Furore Verlag – we cast our collective eye back, celebrating 250 years of the pianoforte with piano pieces which place particular emphasis on the sense of tone. We have chosen com.positions that are congenial to the hand and have left out those that might constitute too hard a nut to crack. the collection is intended to be performer-friendly, andante rather than presto. Our focus is on tone rather than tech.nique, on suppleness rather than velocity. What was important to us was the initial ap.peal. We selected pieces whose charm lies in their dance-like quality, whose appeal is to the heart or whose sound arouses one’s curiosity. We hope you enjoy them. 
Ragtimes (3) (Günther Kaluza) fue 1610 ISMn 979-0-50012-061-2 Inhalt/Contents: May Aufderheide: Dusty & The Thriller!; Imogene Giles: Red Peppers; Grace M. Bolen: The Smoky Topaz; Bess Rudisill: The Eight O’ Clock Rush; Julia Lee niebergall: Horsehoe Rag; Irene M. Giblin: Chicken Chowder; Irene Cozad: Eatin Time 
„Eine praktische Ausgabe ohne überflüssi.gen Schnickschnack.“ (Jazzzeitung) 
Amerikanische Pianistinnen komponierten um die Jahrhundertwende zahlreiche Rag.times – acht sind hier veröffentlicht. Der Off.beat wirkt noch immer, und wer keine Lust hat, links immerzu Weitsprung und rechts gefüllte Oktaven zu üben, suche sich einfach eine/n Partner/in zum vierhändig Spielen. 
American women pianists composed nu.merous ragtime pieces around the turn of the century about three hundred of which have been found and listed in recent years. eight such pieces are published here; these syncopate rhythms are still as appealing as ever. those who do not feel like continually practicing wide jumps with their left hand and octaves with their right should look for a partner and play these pieces four-handed. 
KOMPONISTINNEN VON A–Z 
Women Composers from A to Z 
AuRnHAMMER, JOSEPHA (JOSEPHInE) BARBARA VOn (1758–1820) 
Sechs Variationen über ein ungarisches Thema (3) (Rosario Marciano) Erstveröffentlichung/First publication fue 1180 ISMn 979-0-50012-018-6 
Ein inhalts- und stimmungsvolles Werk einer Lieblingsschülerin Mozarts. Dieses Werk ist eine Bereicherung für das Klavierrepertoire der Wiener Klassik. 
A work rich in substance and mood by one of Mozart’s favourite pupils, Josephine Aurn.hammer. this work proves to be an enrich.ment to the piano repertoire of the Vienna Classical School. First publication. “the music is mildly Hungarian at best.” (Music teacher) 
Variationen 
Verschiedene Variationen für Klavier (Claudia Schweitzer) fue 10032 ISMn 979-0-50182-032-0 Wolfgang Amadeus Mozart war Aurnham.mers Klavierlehrer und von dieser Verbin.dung sprechen ihre 1792 in Wien bzw. Of.fenbach gedruckten 6 Variationen über „Der Vogelfänger bin ich ja“. Die 8 Variationen über den „Contredanza del ballo intitulato La figlia mal custodita“ erschienen zwei Jah.re später bei Artaria in Wien. Außerdem in diesem Sammelband: Zwei fragmentarisch erhaltene Variationen aus dem Jahr 1801 sowie die Dix Variations, erschienen 1799 und 1803 in Wien, die immerhin als op. 63 betitelt sind. Als Thema diente die Arie „La stessa, la stessissima“ Antonio Salieris. 
BEAT, JAnET (*1937) Capriccii vol. 1 for piano (1999/2002) no 1 (4’30), no 2 (2’), no 3 (3’40) (3) fue 4300 ISMn 979-0-50012-930-1 

Die als ’Capriccii’ bezeichneten Klavierstücke zielen auf das virtuose umgehen mit einem besonderen Einfall, einer phantastischen Idee. 
the Capriccii contain many of Janet beat’s compositional trademarks. exuberant, virtu.osic writing with a strong rhythmic drive is contrasted with lyricism in which some parts are free and others are quite precise. It is the tension between these elements that creates the intensity in her work. 
Piano Sonata No. 1 (1985–87) (28’) fue 2880 ISMn 979-0-50012-188-6 
BOnIS, MEL (1858–1937) 
Klaviermusik/Piano Music Œuvres pour piano 

Edition in 11 Bänden/Edition in 11 volumes (Eberhard Mayer/Ingrid Mayer) Die stilistische Vielfalt der Klaviermusik von Mel Bonis, die sich aus der langen Zeitspanne ihrer Entstehung erklärt (1888–1937), ver.mittelt den Eindruck, als habe sie einen Ab.riss der Klaviermusik im historischen Wandel zeichnen wollen. Die historischen Reminis.zenzen werden dabei durch ihre persönliche Tonsprache in zeitgenössische Klänge ver.wandelt. Die universalität und der Wert ih.res Klavierwerks bilden eine wichtige Brücke von der Romantik zur französischen Postro.mantik, und viele ihrer Klavierstücke stellen durch ihren harmonischen Erfindungsreich.tum einen bedeutenden Beitrag zur Ent.wicklung des französischen Impressionismus dar. Der erste Band enthält eine Serie von musikalischen Porträts legendärer Frauen. 
the pieces for piano represent a great stylistic variety. One gets the impression that Mel bonis may have intended to give a summary of musical development, not quoting historic styles but adapting the past through her per.sonal tone and to translate it into contempo.rary musical language. It seems that so she prepared the soil for the growth of some.thing new. In fact her contribution to the development of French impressionism is sig.nificant. the first volume includes an original series of musical portraits dedicated to leg.endary women, where Mel bonis explores the enigmatic feminine universe. 
Vol. 1: Femmes de Légende (3) fue 4180 ISMn 979-0-50012-918-9 Inhalt/Contents: Mélisande op. 34 (2’41), Desdémona op. 101 (3’), Ophélie op. 165 (6’), Viviane op. 80 (3’), Phoebé op. 30 (2’36), Salomé op. 100 (4’15), Omphale op. 86 (2’30) 
„Wie konnte es nur geschehen, dass diese Komponistin bis heute nahezu unbekannt geblieben ist? Beim Durchspielen des vorlie.genden Bandes gerät man auf nahezu jeder Seite erneut in Begeisterung über die ausge.reifte Qualität und die pure Schönheit dieser Musik. ... Femmes de Légende besticht durch das gesamte Spektrum musikalischer Aus.drucksmöglichkeiten.“ (Piano news 2004 über den ersten Band der Klaviermusik) 
Vol. 2: Pièces pittoresques et poétiques A: 1881–1895 (3) fue 4190 ISMn 979-0-50012-919-6 Inhalt/Contents: Impromptu op. 1, Rondo dans le genre ancien op. 7, Près du ruisseau op. 9 (3’50), Pensées d’automne op. 19 (3’40), Berceuse op. 23,1 (3’30) und « Cinq pièces musicales »: 1) Prélude (en mi bémol majeur) op. 10 (3’30), 
2) Gai printemps op. 11, 3) Eglogue op. 12 (3’20), 4) Aux champs op. 13 (4’), 5) Menuet op. 14 (3’) 
Vol. 3: Pièces pittoresques et poétiques B: 1895–1905 (3) fue 4200 ISMn 979-0-50012-920-2 Inhalt/Contents: La chanson du rouet op. 24 (3’10), Papillons op. 28 (3’10), Romance sans paroles en la bémol majeur op. 29, Méditation op. 33,1 (3’), Marionnettes op. 42, Carillons mystiques op. 31 (3’), Barcarolle en si bémol majeur op. 41 (3’40), posthume, Sorrente  op. 61, Le Moustique op. 66 
Vol. 4: Pièces de concert (3) fue 4210   ISMn 979-0-50012-921-9 Inhalt/Contents: Prélude op. 51, Barcarol.le en mi bémol majeur op. 71 (3’40), La cathédrale blessée op. 107 (4’20), Etude op. 136, Romance sans paroles op. 56, Barcarolle-Etude op. 43, Sévillana op. 125 (3’10), Ballade op. 27 (3’) 
Vol. 5: Danses A (2/3) fue 4220   ISMn 979-0-50012-922-6 Inhalt/Contents: Etiolles (Valse) op. 23 (10’), Les Gitanos (Grande Valse espagnole) op. 15,2 (3’) 2, Mazurka op. 26 (3’20), Suite en forme de valses: Ballabile op. 35 (3’), Interlude et Valse lente op. 36 (3’10), Danse sacrée op. 37 (6’), Scherzo-Valse op. 38 (3’) 
Vol. 7: Pièces pittoresques et poétiques C: 1910–1932 (3) fue 10004   ISMn 979-0-50012-347-7 Inhalt/Contents: Echo op. 89 (3’), narcis.se op. 90 (3’15), L’ange gardien op. 99, Il pleut op. 102 (4’), Au crépuscule op. 111 (3’20), Près du moulin op. 115 (4’), Ariel op. 129 (3’), Dolorosa op. 138, une flûte soupire op. 117 (4’), Berceuse triste op. 118 (3’30), Boston valse (valse lente) op. 119 (3’), Agitato op. 120 (3’10), Cloches lointaines op. 121 (3’) 
Vol. 10: Danses B (2/3) fue 10097 ISMn 979-0-50182-097-9 Inhalt/Contents: Viennoise (valse) op. 8, Orientale (valse) op. 32, Soirs d’antan (val.se lente) op. 34, L’Escarpolette (valse) op. 52, Diamant noir (valse lente) op. 186 
Vol. 11: Danses C (2/3) fue 10138 ISMn 979-0-50182-138-9 Inhalt/Contents: Black pearl (Habanera) op. 70, Boléro op. 177 (Erstveröffentli.chung), Mazurka ballet op. 181 (Erstver.öffentlichung), Bourrée op. 62,1, Pavane op. 81,1, Sarabande op. 82,1 
BRAnDMAn, MARGARET S. (*1951) Autumn Rhapsody (2012) (7’) (3) fue 10108 ISMn 979-0-50182-108-2 
Das Werk ist sowohl eindrucksvoll als auch gefühlvoll, mit zahlreichen zeitgenössischen Harmonien wird der große Tonumfang des Klaviers erforscht. Freie rhapsodische Teile werden mit rhythmischen Abschnitten kom.biniert. Die große Dynamik und die zarten Klänge erzeugen eine entspannte und me.ditative Stimmung. 
the work is both impressionistic and lyri.cal, featuring rich contemporary harmonies while exploring the wide compass of the pia.no. the free rhapsodic sections are counter.balanced by engaging rhythmic sections. the dynamic range and delicate sonorities help to create relaxed and meditative mood. 
Reflections (1990) (8’) (3) fue 10140   ISMn 979-0-50182-140-2 
Sonorities (1981) (4’30) (3) fue 10139 ISMn 979-0-50182-139-6 
In memory of bill evans commissioned by the American pianist Selma epstein. 
CâRnECI, CARMEn MARIA (*1957) conSolar (2004) (5’) (3/4) fue 10119  ISMn 979-0-50182-119-8 
Die Komposition ist ein Geschenk zum 25-jährigen Geburtstag des Internationalen Arbeitskreises Frau und Musik 2004. 
this composition is a present for the Interna.tionaler Arbeitskreis Frau und Musik e.V. (In.ternational Working group Women in Music) on the occasion of its 25th anniversary. 
ERnST, SIEGRID (*1929) Klangschatten (5’) (3) fue 10044 ISMn 979-0-50182-044-3 
„Relativ selten werden bisher die Resonan.zen des Obertonbereichs genutzt, die auf dem Klavier mit Hilfe des Haltepedals erzeugt werden können. Ihrem Reiz verdankt dieses Stück seine Entstehung.“ (Siegrid Ernst) 
”the harmonic resonances which can be cre.ated on the piano using the holding pedal are not often used. It is their charm which inspired this piece.“ (Siegrid ernst) 
Kleine Suite (1963) (10’) (4) fue 2360 ISMn 979-0-50012-136-7 Die Suite entstand anlässlich eines Schuljubi.läums mit den stilistischen Mitteln der „klas.sischen Moderne“. Klangschärfungen im Marsch und im Tanz sind leicht verständlich vor dem Hintergrund humoristischen Aus.drucks. Freude am Konzertanten prägt die Etüde, verbunden mit impressionistischer Far.bigkeit. Geeignet für fortgeschrittene Klavier.schüIer*innen, das Pianistische des Stückes ist aber auch reizvoll für Berufsmusiker*innen. 
the suite, composed in the “modern classi.cal” style, was written in honour of the anni.versary of the founding of a school. the dis.sonances, held up against the backdrop of humorous expression, are easily understood. the etude combines pleasurable elements of concerto style with impressionistic colour.fulness. the impressionist idiom can also be heard in the Prologue. Advanced pupils and students will come to terms with the techni.cal difficulties, professional pianists will enjoy the specifically pianistic aspects of this work. 

FLEISCHER, TSIPPI (*1946) In Chromatic Mood op. 19 (1986) (4’) (4) fue 4050 ISMn 979-0-50012-905-9 
GöRSCH, uRSuLA (*1932) Piano latinero: Habanera, Carioca und Zortziko (6’) (3) fue 10014   ISMn 979-0-50182-014-6 

Den drei 1986 entstandenen Klavierstücken des „Piano latinero“ liegen lateinamerikani.sche bzw. spanische Tanzrhythmen zugrunde. 
latin American and Spanish dance rhythms are the inspiration for the ”Piano latinero“: three piano pieces written in 1986. 
HELLER, BARBARA (*1936) Currants – Johannisbeeren (40’) (2/4) Ein Sommertagebuch für Klavier fue 2340 ISMn 979-0-50012-134-3 Inhalt/Contents: Ein Zug fährt ab..., Perpetuum, Schmerz: Energie verebbt, Anklänge, ...niemand weiß..., Schwe.bend (Schwankend), Einwurf, Verwir.rung, Früher (vormals), ...und..., good night, Triangel, Courante, Erinnerung (Kindheit: schwarz-weiß), This chord, An.ruf aus Rom, slow (langsam), im Traum..., Tagtraum, Aus der Ferne, Einfall, Rätsel, Bruchstücke, Fermate, Ein Versuch, Ein Zeichen 

Musikalische umsetzung von Tagebuch.notizen in einer erlebnisreichen Zeit. Für den unterricht, pianistisches Studium und Kon.zert. Leichte und einfache bis anspruchsvol.le, kurze poetische Stücke, teils didaktischer, teils minimalistischer Art. Inspirierend zur Förderung der Selbständigkeit in der Kunst der Interpretation. 
this work can be understood as the daily diary entries of a piano composer in an un.usual situation. Suitable for elementary and advanced piano study as well as for concert performance. Selections vary from simple to demanding short poetic pieces. Some are of didactic and some of minimalistic nature. Inspirational in the development of indepen.dence in interpretive decision-making. 
Das Quintenbuch (1989) (17’) (1/4) fue 2380   ISMn 979-0-50012-138-1 Inhalt/Contents: Blaue Quinten (3’36), Gelbe Quinten (1’17), unterbrochene Quinten (1’03), Rosa Quinten: 2 Versi.onen (50’’/1’), Orange Quinten (2’20), Schwankende Quinten (2’36), Quinten.lied (1’), Quinten: 2 links, 2 rechts (2’30), neujahrsquinten für D. Richards (2’) 

Lange und kurze Klavierstücke, die vom In.tervall der Quinte inspiriert sind. Durch diese Begrenzung entsteht eine sehr eigenartige Klangfärbung. Die Titel: Blau, Gelb usw. ste.hen jeweils für den Versuch, Farben in Musik umzusetzen. Einige Stücke aus diesem Zyklus haben sich erfolgreich als  unterrichtsliteratur für die Mittelstufe bewährt. 
A collection of long and short piano pieces all of which were inspired by the interval of the fifth. this limitation leads to very unusual tonal colouring. the titles: blue, Yellow etc. indicate the attempt to convert colours into music. Some pieces from this cycle have suc.cessfully established themselves within the teaching literature for intermediate students. 
Furore – Ein Traum (6’30) (4) fue 10003   ISMn 979-0-50012-374-3 1986 schrieb B. Heller dieses Werk anlässlich der Gründung des Furore Verlages in Kassel. Es ist Renate Matthei, der Gründerin des Ver.lages, gewidmet. Das besondere Vorspiel, bei dem der Flügel präpariert werden muss, war zunächst als klingendes Signet für den Verlag gedacht. 
“Furore – ein traum” was written in 1986 at the time the Furore publishing house was founded in Kassel. It is dedicated to the founder Renate Matthei. the special intro.duction, which calls for prepared piano, was conceived as a theme tune for that publish.ing house. 
Hommage an Fanny Mendelssohn 
(2003) (21’) (3) für Klav und Spr ad lib. fue 10070   ISMn 979-0-50182-070-2 Fantasievolles Quintentagebuch als eine Hommage an Fanny Hensel geb. Mendels.sohn. Kurze Originalzitate gehen jeweils direkt in Hellers eigene Tonsprache über. Vor jedem Zitat gibt die Fermate eine Mög.lichkeit zum Einschub einer Lesung aus ihren Briefen oder Tagebüchern. 
Imaginative diary of fifths as a hommage to Fanny Hensel. 
Klaviermusik (1981–1990) (ca. 35–40’) (3/4) fue 1290 ISMn 979-0-50012-029-2 Inhalt/Contents: MMM - Meer (mehr) Musik als Malerei, Requiem für Loki, Schmerz: Energie verebbt, Intensivo, Schwarz-weiß, Anna Z., Ostinato, Eiskalt, Anklänge, Tagtraum, Verwirrung, Furore - ein Traum, Reißverschluss, nelkenblume, Rosa Quinten, Rosa Quinten (Version II) Eine Sammlung von 12 Stücken, die in einem größeren Zeitraum entstanden sind. neben Studien auch Stücke, die von außermusikali.schen Vorgängen inspiriert wurden. 
A collection of twelve piano pieces which were composed during a longer period. Some of them are studies and some were inspired by experiences beyond the musical sphere. 
HELLER, BARBARA (*1936) Klaviersuite (1956) (13’) (4) (Sontraud Speidel) fue 10077 ISMn 979-0-50182-077-1 Inhalt/Contents: Amabile grazioso, Energico, Solenne espressivo, Thema mit Variationen 
Das rundum kurzweilige Werk ist ein Gewinn für nachwuchsmusiker und für konzertieren.de Pianisten. Es ist pianistisch anspruchsvoll, wiewohl gut in den Händen liegend und ver.dient es, in das allgemeine Repertoire aufge.nommen zu werden. 
the work is pianistically challenging, even though it fits the hands well. It’s a thoroughly entertaining piece of music and is set to benefit both up-and-coming musicians and concert pianists, and deserves to be included in the standard repertoire. 
MMM. Meer (mehr) Musik als Malerei 
(1978) (2’) (2/3) fue 10203 ISMn 979-0-50182-203-4 nach Sommerferien am Meer hatte Barba.ra Heller die Ohren voller Erinnerungen an Meereswellen, die immer wieder mit ähnli.chen Lauten ans ufer rauschen und doch je.des Mal anders klingen. Diese Klangereignis.se hat Barbara Heller am Klavier umgesetzt. MMM ist ein gutes Beispiel für ein Werk, in dem die Grenzen zwischen Musik und Male.rei bereits im Titel verschwinden. 
After summer holidays at the sea, the ears of barbara Heller were full of memories from the sound of waves, which always come and go in a different way but quite similar. MMM is a good example for a work in which the borders between music and painting already disappear in the title. 
Nacht-Tagebuch (4’20) (3) fue 10023   ISMn 979-0-50182-023-8 Komponiert im April 2004 für das 25-jährige Jubiläum des Archivs Frau und Musik. 
Composed for the 25th anniversary of Archiv Frau und Musik. 
Ton-Zeichen (1988) (2/3) fue 2350   ISMn 979-0-50012-135-0 Inhalt/Contents: Welle für ulrike Feld (perpetuum mobile) (40’), Eine Wel.le kehrt um... (7’30), Wenn Töne auf Bananenstauden wachsen würden (3’50), Spiralwelle (7’45), Steiniger Ackerboden, „Sich winden“ (3’20), Wellenreiter, Lied der Muschel über die verlorene Perle, Die Schlange im Stein, Sonne und Mond, Sternstunde, Feigenblatt 
Deutscher Musikeditionspreis 1996 
Best Edition in Germany 1996! 

Musikalische Einfälle spielerischer Art, die über das Betrachten, Erfahren und Zeichnen von Landschaften und kleinen Fundobjekten aus der natur entstanden sind. Jedes der Stücke beruht auf einer musikalischen Kon.zeption, die improvisatorisch am Klavier in.terpretiert wird. Anregend als unterrichtsma.terial zur Förderung musikalischer Kreativität. „Eine gelungene Verbindung zweier nota.tionen: Auf der linken Seite die graphische notation der Komponistin, auf der rechten jeweils die konventionelle notation.“ (clingKlong 1997) 
Playful musical ideas inspired by the obser.vation, experiencing and depiction of land.scapes and by a collection of small natural objects. each piece contains a musical con.ception and their interpretation on the piano should be improvisatory. easy to medium dif.ficulty, they provide good teaching material for the development of musical creativity. 
`;
	let works: WorkList = { works: [] };
	let loading = false;
	let elapsedTime = 0;
	const scrape = async () => {
		loading = true;

		// Start timing
		const startTime = performance.now();

		try {
			const response = await fetch('/api/scrape/works', {
				method: 'POST',
				body: JSON.stringify({ text: chunk })
			});

			const worksRaw = await response.json();

			// Calculate elapsed time
			const endTime = performance.now();
			elapsedTime = endTime - startTime;

			console.log('worksRaw', worksRaw);
			console.log(`API call completed in ${elapsedTime.toFixed(2)} ms`);

			try {
				works = worksRaw.data;
			} catch {
				console.log('not a list');
			}
		} catch (error) {
			// Log any errors along with timing information
			const errorTime = performance.now();
			const timeUntilError = errorTime - startTime;
			console.error(`API call failed after ${timeUntilError.toFixed(2)} ms`, error);
		} finally {
			loading = false;
		}
	};
	const getPDFText = async () => {};
</script>

<div class="flex min-h-screen items-center justify-center">
	<div class="flex w-full flex-col items-center space-y-4 overflow-scroll px-8 py-4">
		{#if works.works.length > 0}
			<Card class="max-h-96 w-full overflow-y-scroll">
				<h4>{works.works.length} found in {elapsedTime}</h4>
				<div class="flex w-full flex-col space-y-1">
					{#each works.works as work}
						<div class="flex border-b-2 border-b-slate-100 pb-2">
							<h5>{work.title}</h5>
							<br />
							{work.composer}
							<br />
							{work.rawContent}
						</div>
					{/each}
					{#each works.works as work}
						<div class="flex border-b-2 border-b-slate-100 pb-2">
							<h5>{work.title}</h5>
							<br />
							{work.composer}
							<br />
							{work.rawContent}
						</div>
					{/each}
				</div>
			</Card>
		{/if}
		<Card class="mb-4 max-h-full w-full max-w-md space-y-6 overflow-scroll p-6">
			<div class="flex-col space-y-2">
				<Input placeholder="URL" type="text" bind:value={chunk} />
				<div class="flex space-x-2">
					<Button on:click={scrape} disabled={loading}>
						{#if loading}
							<Spinner class="me-3" size="4" /> Loading
						{:else}
							Scrape
						{/if}
					</Button>
					<Button
						on:click={() => {
							getPDFText();
						}}>test</Button
					>
				</div>
			</div>
		</Card>
	</div>
</div>
