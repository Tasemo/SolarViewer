# SolarViewer

## Überblick
Dieses Projekt ist Teil der Bachelorarbeit ["Erstellung eines interaktiven, 3D Höhenmodells des Mars auf Grundlage von MOLA Daten"](/doc/thesis.pdf) und wurde von Tim Oelkers entwickelt. Es versucht, unterschiedliche Planeten des Sonnensystems, angefangen mit dem Mars, in höchster Auflösung im Browser zu visualisieren. Des Weiteren stellt es einige nützliche Funktionen bereit, um Informationen über den Planeten zu erhalten. Commits oder Pullrequests werden nicht entgegen genommen, die [Lizenz](/LICENSE.MD) erlaubt aber eine freie Nutzung und/oder Weiterentwicklung. Fragen und Feedback kann an tim.oelkers@web.de gesendet werden, worüber ich mich freuen würde.

## Ausprobieren
Um dieses Projekt zu bauen muss mindestens Java 11 installiert seit. Dabei ist die "headless" Version ausreichend, da Java nur auf dem Server ausgeführt wird und dort keine Eingabe- oder Grafik-Bibliotheken notwendig sind. Außerdem müssen Maven und Git installiert seit. Nachdem dieses Projekt mit `git clone https://github.com/Tasemo/SolarViewer.git` ausgecheckt wurde, muss `mvn package` im Root-Verzeichnis ausgeführt werden. Des Weiteren müssen die gewünschten Datensätze in das Verzeichnis "/data" heruntergeladen werden. Aktuell werden die folgenden Datensätze unterstützt:

Name | Planet | Auflösung | Quellgröße | Zielgröße | Url
---|---|---|---|---|---
MOLA | Mars | 463m | 1,98GB | 35,61GB | https://planetarymaps.usgs.gov/mosaic/Mars_MGS_MOLA_DEM_mosaic_global_463m.tif

Anschließend kann der Server mit `java -jar target/solar-viewer-1.0-SNAPSHOT-jar-with-dependencies.jar` aus dem Root-Verzeichnis gestartet werden. Das Frontend kann dann unter http://localhost:8080 betrachtet werden.