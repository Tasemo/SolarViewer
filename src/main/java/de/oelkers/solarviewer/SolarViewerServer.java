package de.oelkers.solarviewer;

import de.oelkers.solarviewer.dataEndpoints.LolaDataEndpoint;
import de.oelkers.solarviewer.dataEndpoints.MessengerDataEndpoint;
import de.oelkers.solarviewer.dataEndpoints.MolaDataEndpoint;
import io.undertow.Handlers;
import io.undertow.Undertow;
import io.undertow.server.RoutingHandler;
import io.undertow.server.handlers.resource.ClassPathResourceManager;
import io.undertow.server.handlers.resource.ResourceHandler;
import io.undertow.server.handlers.resource.ResourceManager;
import io.undertow.util.Methods;

import java.io.IOException;

public final class SolarViewerServer {

    private SolarViewerServer() {}

    public static void main(String[] args) throws IOException {
        ResourceManager resourceManager = new ClassPathResourceManager(ClassLoader.getSystemClassLoader(), "static");
        ResourceHandler resourceHandler = Handlers.resource(resourceManager);
        RoutingHandler routingHandler = new RoutingHandler();
        routingHandler.add(Methods.GET, "/*", resourceHandler);
        routingHandler.add(Methods.GET, "/available", new AvailableDataEndpoint());
        routingHandler.add(Methods.GET, "/mola", new MolaDataEndpoint());
        routingHandler.add(Methods.GET, "/lola", new LolaDataEndpoint());
        routingHandler.add(Methods.GET, "/messenger", new MessengerDataEndpoint());
        Undertow server = Undertow.builder()
                .addHttpListener(8080, "0.0.0.0")
                .setHandler(routingHandler)
                .build();
        server.start();
    }
}
