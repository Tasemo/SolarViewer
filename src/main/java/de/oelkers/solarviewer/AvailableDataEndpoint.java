package de.oelkers.solarviewer;

import de.oelkers.solarviewer.dataEndpoints.LolaDataEndpoint;
import de.oelkers.solarviewer.dataEndpoints.MessengerDataEndpoint;
import de.oelkers.solarviewer.dataEndpoints.MolaDataEndpoint;
import io.undertow.server.HttpHandler;
import io.undertow.server.HttpServerExchange;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

public class AvailableDataEndpoint implements HttpHandler {

    @Override
    public void handleRequest(HttpServerExchange exchange) throws Exception {
        List<String> result = new ArrayList<>();
        if (Files.exists(Path.of(MolaDataEndpoint.ORIGINAL_DATA))) {
            result.add("Mars");
        }
        if (Files.exists(Path.of(LolaDataEndpoint.ORIGINAL_DATA))) {
            result.add("Moon");
        }
        if (Files.exists(Path.of(MessengerDataEndpoint.ORIGINAL_DATA))) {
            result.add("Mercury");
        }
        exchange.getResponseSender().send(String.join(",", result));
    }
}
