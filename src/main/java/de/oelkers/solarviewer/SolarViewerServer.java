package de.oelkers.solarviewer;

import io.undertow.Handlers;
import io.undertow.Undertow;
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
        RoutingHandler routingHandler = new RoutingHandler();
        routingHandler.add(Methods.GET, "/*", resourceHandler);
        routingHandler.add(Methods.GET, "/mola", new MolaDataEndpoint());
        Undertow server = Undertow.builder()
                .addHttpListener(8080, "0.0.0.0")
                .setHandler(routingHandler)
                .build();
        server.start();
    }
}
