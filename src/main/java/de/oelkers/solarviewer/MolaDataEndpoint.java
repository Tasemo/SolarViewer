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
import java.awt.image.Raster;
import java.awt.image.RenderedImage;
import java.io.IOException;
import java.io.RandomAccessFile;
import java.util.Arrays;
import java.util.Deque;
import java.util.Map;

import static de.oelkers.solarviewer.ArrayUtils.*;

public class MolaDataEndpoint implements HttpHandler {

    @Override
    public void handleRequest(HttpServerExchange exchange) throws Exception {
        Map<String, Deque<String>> params = exchange.getQueryParameters();
        int x = Integer.parseInt(params.get("x").getFirst());
        int z = Integer.parseInt(params.get("z").getFirst());
        int width = Integer.parseInt(params.get("width").getFirst());
        int height = Integer.parseInt(params.get("height").getFirst());
        int stride = params.get("stride") == null ? 1 : Integer.parseInt(params.get("stride").getFirst());
        short[] data = load(x, z, width, height, stride);
        exchange.getResponseSender().send(Arrays.toString(data));
    }

    private static short[] load(int x, int z, int width, int height, int stride) throws IOException {
        RandomAccessFile file = new RandomAccessFile("data/Mars_MGS_MOLA_DEM_mosaic_global_463m.tif", "r");
        try (ImageInputStream input = ImageIO.createImageInputStream(file)) {
            ImageReader reader = ImageIO.getImageReaders(input).next();
            ImageReadParam param = reader.getDefaultReadParam();
            param.setSourceSubsampling(stride, stride, 0, 0);
            param.setSourceRegion(new Rectangle(x, z, width, height));
            reader.setInput(input, true, true);
            Raster raster = reader.read(0, param).getData();
            short[][] data = expand(getData(raster), raster.getWidth(), raster.getHeight());
            int xOverflow = width + x - reader.getWidth(0);
            if (xOverflow > 0) {
                param.setSourceRegion(new Rectangle(0, z, xOverflow, height));
                short[] additional = getData(reader.read(0, param));
                data = addColumn(data, additional);
            }
            int zOverflow = height + z - reader.getHeight(0);
            if (zOverflow > 0) {
                param.setSourceRegion(new Rectangle(x, 0, width, zOverflow));
                short[] additional = getData(reader.read(0, param));
                data = addRow(data, additional);
            }
            reader.dispose();
            return flatten(data);
        }
    }

    private static short[] getData(RenderedImage image) {
        return getData(image.getData());
    }

    private static short[] getData(Raster raster) {
        DataBuffer buffer = raster.getDataBuffer();
        assert buffer.getDataType() == DataBuffer.TYPE_SHORT;
        return ((DataBufferShort) buffer).getData();
    }
}
