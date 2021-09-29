package de.oelkers.solarviewer.utils;

import java.util.Arrays;

public final class ArrayUtils {

    private ArrayUtils() {}

    public static short[][] expand(short[] data, int width, int height) {
        short[][] result = new short[height][width];
        assert width * height == data.length;
        for (int i = 0; i < data.length; i++) {
            result[i / width][i % width] = data[i];
        }
        return result;
    }

    public static short[] flatten(short[][] data) {
        short[] result = new short[data.length * data[0].length];
        for (int i = 0; i < data.length; i++) {
            System.arraycopy(data[i], 0, result, i * data[0].length, data[i].length);
        }
        return result;
    }

    public static short[][] addColumn(short[][] data, short[] row) {
        for (int i = 0; i < data.length; i++) {
            short[] current = data[i];
            data[i] = Arrays.copyOf(current, current.length + 1);
            data[i][current.length] = row[i];
        }
        return data;
    }

    public static short[][] addRow(short[][] data, short[] column) {
        data = Arrays.copyOf(data, data.length + 1);
        data[data.length - 1] = column;
        return data;
    }
}
