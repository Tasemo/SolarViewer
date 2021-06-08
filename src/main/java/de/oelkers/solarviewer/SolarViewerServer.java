package de.oelkers.solarviewer;

import io.undertow.Handlers;
import io.undertow.Undertow;
import io.undertow.predicate.Predicates;
import io.undertow.server.RoutingHandler;
import io.undertow.server.handlers.resource.ClassPathResourceManager;
import io.undertow.server.handlers.resource.ResourceHandler;
import io.undertow.server.handlers.resource.ResourceManager;
import io.undertow.util.Methods;

public final class SolarViewerServer {

    private SolarViewerServer() {}

    public static void main(String[] args) {
        ResourceManager resourceManager = new ClassPathResourceManager(ClassLoader.getSystemClassLoader(), "static");
        ResourceHandler resourceHandler = Handlers.resource(resourceManager);
        resourceHandler.setAllowed(Predicates.suffixes(".html", ".js", ".css"));
        RoutingHandler routingHandler = new RoutingHandler();
        routingHandler.add(Methods.GET, "/*", resourceHandler);
        Undertow server = Undertow.builder()
                .addHttpListener(8080, "localhost")
                .setHandler(routingHandler)
                .build();
        server.start();
    }
}
