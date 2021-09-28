package de.oelkers.solarviewer;

import io.undertow.server.HttpHandler;
import io.undertow.server.HttpServerExchange;

import javax.imageio.ImageIO;
import javax.imageio.ImageReadParam;
import javax.imageio.ImageReader;
import javax.imageio.ImageWriter;
import javax.imageio.stream.ImageInputStream;
import javax.imageio.stream.ImageOutputStream;
import java.awt.*;
import java.awt.color.ColorSpace;
import java.awt.image.*;
import java.io.File;
import java.io.IOException;
import java.io.RandomAccessFile;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.Deque;
import java.util.Map;

import static de.oelkers.solarviewer.ArrayUtils.*;
import static de.oelkers.solarviewer.MolaDataRedundancy.findRedundancies;

public class MolaDataEndpoint implements HttpHandler {

    private static final String ORIGINAL_DATA = "data/Mars_MGS_MOLA_DEM_mosaic_global_463m.tif";
    private static final String MARKED_DATA = "data/Mars_MGS_MOLA_DEM_mosaic_global_marked_463m.tif";
    private static final short REPLACEMENT = Short.MIN_VALUE;
    private static final int PIXELS_WIDTH = 46080;
    private static final int PIXELS_HEIGHT = 23040;
    private static final int CHUNK_SIZE = 2880;

    private final String dataPath;

    public MolaDataEndpoint() throws IOException {
        this(ORIGINAL_DATA, MARKED_DATA, PIXELS_WIDTH, PIXELS_HEIGHT);
    }

    MolaDataEndpoint(String originalDataPath, String markedDataPath, int width, int height) throws IOException {
        dataPath = originalDataPath;
        if (dataPath.equals(markedDataPath) && !Files.exists(Path.of(markedDataPath))) {
            short[][] data = load(originalDataPath, 0, 0, width, height, 1);
            findRedundancies(data, REPLACEMENT, CHUNK_SIZE);
            write(flatten(data), markedDataPath, width, height);
        }
    }

    @Override
    public void handleRequest(HttpServerExchange exchange) throws Exception {
        Map<String, Deque<String>> params = exchange.getQueryParameters();
        int x = Integer.parseInt(params.get("x").getFirst());
        int z = Integer.parseInt(params.get("z").getFirst());
        int width = Integer.parseInt(params.get("width").getFirst());
        int height = Integer.parseInt(params.get("height").getFirst());
        int stride = params.get("stride") == null ? 1 : Integer.parseInt(params.get("stride").getFirst());
        short[][] data = load(dataPath, x, z, width, height, stride);
        exchange.getResponseSender().send(Arrays.toString(flatten(data)));
    }

    static short[][] load(String filePath, int x, int z, int width, int height, int stride) throws IOException {
        RandomAccessFile file = new RandomAccessFile(filePath, "r");
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
                // int xOffset = (x + reader.getWidth(0) / 2) % reader.getWidth(0);
                // using the xOffset instead of x is technically correct, but then we have to deal with xOverflow again
                // and there is no visual difference on MOLA data
                param.setSourceRegion(new Rectangle(x, reader.getHeight(0) - zOverflow, width, zOverflow));
                short[] additional = getData(reader.read(0, param));
                data = addRow(data, additional);
            }
            reader.dispose();
            return data;
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

    static void write(short[] data, String path, int width, int height) throws IOException {
        try (ImageOutputStream output = ImageIO.createImageOutputStream(new File(path))) {
            ImageWriter writer = ImageIO.getImageWritersBySuffix("tiff").next();
            writer.setOutput(output);
            DataBufferShort buffer = new DataBufferShort(data, data.length);
            SampleModel sampleModel = new ComponentSampleModel(DataBuffer.TYPE_SHORT, width, height, 1, width, new int[]{0});
            WritableRaster raster = Raster.createWritableRaster(sampleModel, buffer, null);
            ColorSpace colorSpace = ColorSpace.getInstance(ColorSpace.CS_GRAY);
            ColorModel colorModel = new ComponentColorModel(colorSpace, false, false, Transparency.OPAQUE, DataBuffer.TYPE_SHORT);
            RenderedImage image = new BufferedImage(colorModel, raster, colorModel.isAlphaPremultiplied(), null);
            writer.write(image);
            writer.dispose();
        }
    }
}