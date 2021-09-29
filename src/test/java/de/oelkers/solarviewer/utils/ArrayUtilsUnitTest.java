package de.oelkers.solarviewer.utils;

import org.junit.jupiter.api.Test;

import static de.oelkers.solarviewer.utils.ArrayUtils.*;
import static org.junit.jupiter.api.Assertions.assertArrayEquals;

class ArrayUtilsUnitTest {

    @Test
    public void testExpand() {
        short[][] expected = {{ 1, 2,}, {3, 4}};
        short[][] result = expand(new short[] { 1, 2, 3, 4}, 2, 2);
        assertArrayEquals(expected, result);
    }

    @Test
    public void testFlatten() {
        short[] expected = {1, 2, 3, 4};
        short[] result = flatten(new short[][] {{ 1, 2,}, {3, 4}});
        assertArrayEquals(expected, result);
    }

    @Test
    public void testAddColumn() {
        short[][] expected = {{ 1, 2, 5}, {3, 4, 6}};
        short[][] result = addColumn(new short[][] {{ 1, 2,}, {3, 4}}, new short[] {5, 6});
        assertArrayEquals(expected, result);
    }

    @Test
    public void testAddRow() {
        short[][] expected = {{ 1, 2,}, {3, 4}, {5, 6}};
        short[][] result = addRow(new short[][] {{ 1, 2,}, {3, 4}}, new short[] {5, 6});
        assertArrayEquals(expected, result);
    }
}