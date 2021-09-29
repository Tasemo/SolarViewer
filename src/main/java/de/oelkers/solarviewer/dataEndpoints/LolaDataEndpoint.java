package de.oelkers.solarviewer.dataEndpoints;

import java.io.IOException;

public class LolaDataEndpoint extends RasterDataEndpoint {

    public static final String ORIGINAL_DATA = "data/Lunar_LRO_LOLA_Global_LDEM_118m_Mar2014.tif";
    private static final String MARKED_DATA = "data/Lunar_LRO_LOLA_Global_LDEM_118m_Mar2014_marked.tif";
    private static final int PIXELS_WIDTH = 92160;
    private static final int PIXELS_HEIGHT = 46080;

    public LolaDataEndpoint() throws IOException {
        super(ORIGINAL_DATA, MARKED_DATA, PIXELS_WIDTH, PIXELS_HEIGHT);
    }
}
