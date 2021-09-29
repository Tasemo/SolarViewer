package de.oelkers.solarviewer.dataEndpoints;

import java.io.IOException;

public class MolaDataEndpoint extends RasterDataEndpoint {

    public static final String ORIGINAL_DATA = "data/Mars_MGS_MOLA_DEM_mosaic_global_463m.tif";
    private static final String MARKED_DATA = "data/Mars_MGS_MOLA_DEM_mosaic_global_463m_marked.tif";
    private static final int PIXELS_WIDTH = 46080;
    private static final int PIXELS_HEIGHT = 23040;

    public MolaDataEndpoint() throws IOException {
        super(ORIGINAL_DATA, MARKED_DATA, PIXELS_WIDTH, PIXELS_HEIGHT);
    }
}