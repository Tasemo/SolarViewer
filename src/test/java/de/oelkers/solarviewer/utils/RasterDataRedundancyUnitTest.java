package de.oelkers.solarviewer.utils;

import org.junit.jupiter.api.Test;

import static de.oelkers.solarviewer.utils.RasterDataRedundancy.findRedundancies;
import static org.junit.jupiter.api.Assertions.assertArrayEquals;

class RasterDataRedundancyUnitTest {

    @Test
    public void testFindRedundanciesFlatGrid() {
        short[][] data = {{1, 1, 1}, {1, 1, 1}, {1, 1, 1}};
        short[][] expected = {{1, 1, 1}, {1, Short.MIN_VALUE, 1}, {1, 1, 1}};
        findRedundancies(data, Short.MIN_VALUE);
        assertArrayEquals(expected, data);
    }

    @Test
    public void testFindRedundanciesTiltedGrid() {
        short[][] data = {{1, 2, 3}, {2, 3, 4}, {3, 4, 5}};
        short[][] expected = {{1, 2, 3}, {2, Short.MIN_VALUE, 4}, {3, 4, 5}};
        findRedundancies(data, Short.MIN_VALUE);
        assertArrayEquals(expected, data);
    }

    @Test
    public void testFindRedundanciesBiggerGrid() {
        short[][] data = {{1, 2, 3, 4}, {1, 2, 3, 4}, {1, 2, 3, 4}};
        short[][] expected = {{1, 2, 3, 4}, {1, Short.MIN_VALUE, Short.MIN_VALUE, 4}, {1, 2, 3, 4}};
        findRedundancies(data, Short.MIN_VALUE);
        assertArrayEquals(expected, data);
    }

    @Test
    public void testFindRedundanciesNotAtEdge() {
        short[][] data = {{42, 42, 42, 42, 42}, {42, 1, 2, 3, 42}, {42, 1, 2, 3, 42}, {42, 1, 2, 3, 42}, {42, 42, 42, 42, 42}};
        short[][] expected = {
                {42, 42, 42, 42, 42},
                {42, 1, 2, 3, 42},
                {42, 1, Short.MIN_VALUE, 3, 42},
                {42, 1, 2, 3, 42},
                {42, 42, 42, 42, 42}
        };
        findRedundancies(data, Short.MIN_VALUE);
        assertArrayEquals(expected, data);
    }

    @Test
    public void testFindRedundanciesMultiple() {
        short[][] data = {{1, 2, 3, 1, 2, 3}, {1, 2, 3, 1, 2, 3}, {1, 2, 3, 1, 2, 3}};
        short[][] expected = {
                {1, 2, 3, 1, 2, 3},
                {1, Short.MIN_VALUE, 3, 1, Short.MIN_VALUE, 3},
                {1, 2, 3, 1, 2, 3}
        };
        findRedundancies(data, Short.MIN_VALUE);
        assertArrayEquals(expected, data);
    }

    @Test
    public void testFindRedundanciesMultiplePossibilities() {
        short[][] data = {{1, 1, 1, 1}, {1, 1, 1, 1}, {1, 1, 1, 1}, {1, 1, 1, 2}};
        short[][] expected = {
                {1, 1, 1, 1},
                {1, Short.MIN_VALUE, Short.MIN_VALUE, 1},
                {1, 1, 1, 1},
                {1, 1, 1, 2}
        };
        findRedundancies(data, Short.MIN_VALUE);
        assertArrayEquals(expected, data);
    }

    @Test
    public void testFindRedundanciesWithChunkSize() {
        short[][] data = {{1, 2, 3, 4}, {1, 2, 3, 4}, {1, 2, 3, 4}};
        short[][] expected = {{1, 2, 3, 4}, {1, Short.MIN_VALUE, 3, 4}, {1, 2, 3, 4}};
        findRedundancies(data, Short.MIN_VALUE, 3);
        assertArrayEquals(expected, data);
    }

    @Test
    public void testFindRedundanciesWithChunkSizeNotAtStartHorizontal() {
        short[][] data = {{42, 2, 3, 4}, {42, 2, 3, 4}, {42, 2, 3, 4}};
        short[][] expected = {{42, 2, 3, 4}, {42, 2, Short.MIN_VALUE, 4}, {42, 2, 3, 4}};
        findRedundancies(data, Short.MIN_VALUE, 4);
        assertArrayEquals(expected, data);
    }

    @Test
    public void testFindRedundanciesWithChunkSizeNotAtStartVertical() {
        short[][] data = {{42, 42, 42}, {1, 2, 3}, {1, 2, 3}, {1, 2, 3}};
        short[][] expected = {{42, 42, 42}, {1, 2, 3}, {1, Short.MIN_VALUE, 3}, {1, 2, 3}};
        findRedundancies(data, Short.MIN_VALUE, 4);
        assertArrayEquals(expected, data);
    }
}