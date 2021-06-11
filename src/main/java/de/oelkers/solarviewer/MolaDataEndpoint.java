package de.oelkers.solarviewer;

import io.undertow.server.HttpHandler;
import io.undertow.server.HttpServerExchange;

import javax.imageio.ImageIO;
import javax.imageio.ImageReadParam;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;
import java.awt.Rectangle;
import java.awt.image.DataBuffer;
import java.awt.image.DataBufferShort;
import java.io.RandomAccessFile;
import java.util.Arrays;

public class MolaDataEndpoint implements HttpHandler {

    @Override
    public void handleRequest(HttpServerExchange exchange) throws Exception {
        int x = Integer.parseInt(exchange.getQueryParameters().get("x").getFirst());
        int z = Integer.parseInt(exchange.getQueryParameters().get("z").getFirst());
        int width = Integer.parseInt(exchange.getQueryParameters().get("width").getFirst());
        int height = Integer.parseInt(exchange.getQueryParameters().get("height").getFirst());
        RandomAccessFile file = new RandomAccessFile("data/Mars_MGS_MOLA_DEM_mosaic_global_463m.tif", "r");
        try (ImageInputStream input = ImageIO.createImageInputStream(file)) {
            ImageReader reader = ImageIO.getImageReaders(input).next();
            ImageReadParam param = reader.getDefaultReadParam();
            param.setSourceRegion(new Rectangle(x, z, width, height));
            reader.setInput(input, true, true);
            DataBuffer data = reader.read(0, param).getData().getDataBuffer();
            assert data.getDataType() == DataBuffer.TYPE_SHORT;
            String responseData = Arrays.toString(((DataBufferShort) data).getData());
            exchange.getResponseSender().send(responseData);
            reader.dispose();
        }
    }
}
