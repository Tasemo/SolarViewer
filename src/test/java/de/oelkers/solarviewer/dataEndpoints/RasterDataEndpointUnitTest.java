package de.oelkers.solarviewer.dataEndpoints;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;

class RasterDataEndpointUnitTest {

    @Test
    public void testThatDataIsWrittenIfNotExists(@TempDir Path path) throws IOException {
        String originalFile = Files.createFile(path.resolve("original.tif")).toString();
        String markedFile = path.resolve("markedData.tif").toString();
        MockRasterDataEndpoint.write(new short[]{1, 2, 3, 4}, originalFile, 2, 2);
        new MockRasterDataEndpoint(originalFile, markedFile, 2, 2);
        short[][] result = MockRasterDataEndpoint.load(markedFile, 0, 0, 2, 2, 1);
        assertArrayEquals(new short[][]{{1, 2}, {3, 4}}, result);

        MockRasterDataEndpoint.write(new short[]{4, 3, 2, 1}, originalFile, 2, 2);
        new MockRasterDataEndpoint(originalFile, markedFile, 2, 2);
        assertArrayEquals(new short[][]{{1, 2}, {3, 4}}, result);
    }

    @Test
    public void testThatParametersAreCorrect(@TempDir Path path) throws IOException {
        String originalFile = Files.createFile(path.resolve("original.tif")).toString();
        MockRasterDataEndpoint.write(new short[]{1, 2, 3, 4, 5, 6}, originalFile, 2, 3);
        short[][] result1 = MockRasterDataEndpoint.load(originalFile, 0, 0, 2, 2, 1);
        assertArrayEquals(new short[][]{{1, 2}, {3, 4}}, result1);
        short[][] result2 = MockRasterDataEndpoint.load(originalFile, 0, 0, 2, 3, 2);
        assertArrayEquals(new short[][]{{1}, {5}}, result2);
        short[][] result3 = MockRasterDataEndpoint.load(originalFile, 1, 1, 1, 2, 1);
        assertArrayEquals(new short[][]{{4}, {6}}, result3);
    }

    private static final class MockRasterDataEndpoint extends RasterDataEndpoint {

        private MockRasterDataEndpoint(String originalDataPath, String markedDataPath, int width, int height) throws IOException {
            super(originalDataPath, markedDataPath, width, height);
        }
    }
}