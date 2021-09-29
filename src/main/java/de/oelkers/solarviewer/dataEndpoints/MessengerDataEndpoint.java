package de.oelkers.solarviewer.dataEndpoints;

import java.io.IOException;

public class MessengerDataEndpoint extends RasterDataEndpoint {

    public static final String ORIGINAL_DATA = "data/Mercury_Messenger_USGS_DEM_Global_665m_v2.tif";
    private static final String MARKED_DATA = "data/Mercury_Messenger_USGS_DEM_Global_665m_v2_marked.tif";
    private static final int PIXELS_WIDTH = 23040;
    private static final int PIXELS_HEIGHT = 11520;

    public MessengerDataEndpoint() throws IOException {
        super(ORIGINAL_DATA, MARKED_DATA, PIXELS_WIDTH, PIXELS_HEIGHT);
    }
}
