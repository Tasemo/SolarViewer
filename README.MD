# SolarViewer

## Überblick
Dieses Projekt ist Teil der Bachelorarbeit ["Erstellung eines interaktiven, 3D Höhenmodells des Mars auf Grundlage von MOLA Daten"](/doc/thesis.pdf) und wurde von Tim Oelkers entwickelt. Es versucht, unterschiedliche Planeten des Sonnensystems, angefangen mit dem Mars, in höchster Auflösung im Browser zu visualisieren. Des Weiteren stellt es einige nützliche Funktionen bereit, um Informationen über den Planeten zu erhalten. Commits oder Pullrequests werden nicht entgegen genommen, die [Lizenz](/LICENSE.MD) erlaubt aber eine freie Nutzung und/oder Weiterentwicklung. Fragen und Feedback kann an tim.oelkers@web.de gesendet werden, worüber ich mich freuen würde.

## Ausprobieren
Um dieses Projekt zu bauen muss mindestens Java 11 installiert seit. Dabei ist die "headless" Version ausreichend, da Java nur auf dem Server ausgeführt wird und dort keine Eingabe- oder Grafik-Bibliotheken notwendig sind. Außerdem müssen Maven und Git installiert seit. Nachdem dieses Projekt mit `git clone https://github.com/Tasemo/SolarViewer.git` ausgecheckt wurde, muss `mvn package` im Root-Verzeichnis ausgeführt werden. Des Weiteren müssen die gewünschten Datensätze in das Verzeichnis "/data" heruntergeladen werden. Aktuell werden die folgenden Datensätze unterstützt:

Name | Planet | Auflösung | Quellgröße | Speicherverbrauch | Url
---|---|---|---|---|---
MOLA | Mars | 463m | 1,98GB | 35,61GB | https://planetarymaps.usgs.gov/mosaic/Mars_MGS_MOLA_DEM_mosaic_global_463m.tif
MESSENGER | Merkur | 665m | 0.49GB | 8,90GB | http://planetarymaps.usgs.gov/mosaic/Mercury_Messenger_USGS_DEM_Global_665m_v2.tif

Anschließend kann der Server mit `java -jar target/solar-viewer-1.0-SNAPSHOT-jar-with-dependencies.jar` aus dem Root-Verzeichnis gestartet werden. Das Frontend kann dann unter http://localhost:8080 betrachtet werden.

## Aktuelle Entwicklung
Der Fokus der aktuellen Entwicklung liegt vor allem auf der Integration weiterer Datensätze. Insbesondere sollen dabei größere Datensätze priorisiert werden (z.B. LOLA Daten). Dies ist aktuell durch die fehlende Unterstützung von BigTiff in Java ausgebremst. Auch wird an der Performance gearbeitet, da die Anwendung zur Zeit stark durch das Netzwerk ausgelastet ist. Dies soll durch die Integration von HTTP/2 verbessert werden.