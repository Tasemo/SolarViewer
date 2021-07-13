package de.oelkers.solarviewer;

import java.util.ArrayList;
import java.util.List;

public final class MolaDataRedundancy {

    private static final short MIN_KERNEL_SIZE = 3;

    private MolaDataRedundancy() {}

    public static void findRedundancies(short[][] data, short replacement) {
        boolean[][] visited = new boolean[data.length][data[0].length];
        for (int z = 0; z <= data.length - MIN_KERNEL_SIZE; z++) {
            for (int x = 0; x <= data[0].length - MIN_KERNEL_SIZE; x++) {
                if (!visited[z][x]) {
                    markRedundancies(data, replacement, visited, x, z);
                }
            }
        }
    }

    private static void markRedundancies(short[][] data, short replacement, boolean[][] visited, int currentX, int currentZ) {
        List<Coordinates> rows = checkRows(data, currentX, currentZ);
        List<Coordinates> columns = checkColumns(data, currentX, currentZ);
        Coordinates maxArea = getRasterMaxArea(rows, columns);
        if (maxArea.x >= MIN_KERNEL_SIZE && maxArea.z >= MIN_KERNEL_SIZE) {
            for (int z = 0; z < maxArea.z; z++) {
                for (int x = 0; x < maxArea.x; x++) {
                    if ((x != 0 || z != 0) && (x != 0 || z != maxArea.z - 1) &&
                            (x != maxArea.x - 1 || z != 0) && (x != maxArea.x - 1 || z != maxArea.z - 1)) {
                        data[currentZ + z][currentX + x] = replacement;
                    }
                    visited[currentZ + z][currentX + x] = true;
                }
            }
        }
    }

    private static Coordinates getRasterMaxArea(Iterable<Coordinates> rows, Iterable<Coordinates> columns) {
        int maxX = 0, maxZ = 0;
        for (Coordinates row : rows) {
            for (Coordinates column : columns) {
                int xSize = Math.min(row.x, column.x);
                int zSize = Math.min(row.z, column.z);
                if (xSize * zSize > maxX * maxZ) {
                    maxX = xSize;
                    maxZ = zSize;
                }
            }
        }
        return new Coordinates(maxX, maxZ);
    }

    private static List<Coordinates> checkRows(short[][] data, int currentX, int currentZ) {
        List<Coordinates> result = new ArrayList<>();
        Coordinates widthAndHeight = new Coordinates();
        result.add(widthAndHeight);
        for (int z = currentZ; z < data.length; z++, widthAndHeight.z++) {
            int difference = data[currentZ][currentX] - data[currentZ][currentX + 1];
            int currentRowSize = 2;
            for (int x = currentX + 1; x < data[0].length - 1; x++) {
                if (data[z][x] - data[z][x + 1] == difference) {
                    if (widthAndHeight.x != 0 && widthAndHeight.x <= currentRowSize) {
                        break;
                    }
                    currentRowSize++;
                } else if (currentRowSize < MIN_KERNEL_SIZE) {
                    return result;
                } else if (currentRowSize < widthAndHeight.x) {
                    widthAndHeight = new Coordinates(widthAndHeight);
                    result.add(widthAndHeight);
                } else {
                    break;
                }
            }
            widthAndHeight.x = currentRowSize;
        }
        return result;
    }

    private static List<Coordinates> checkColumns(short[][] data, int currentX, int currentZ) {
        List<Coordinates> result = new ArrayList<>();
        Coordinates widthAndHeight = new Coordinates();
        result.add(widthAndHeight);
        for (int x = currentX; x < data[0].length; x++, widthAndHeight.x++) {
            int difference = data[currentZ][currentX] - data[currentZ + 1][currentX];
            int currentColumnSize = 2;
            for (int z = currentZ + 1; z < data.length - 1; z++) {
                if (data[z][x] - data[z + 1][x] == difference) {
                    if (widthAndHeight.z != 0 && widthAndHeight.z <= currentColumnSize) {
                        break;
                    }
                    currentColumnSize++;
                } else if (currentColumnSize < MIN_KERNEL_SIZE) {
                    return result;
                } else if (currentColumnSize < widthAndHeight.z) {
                    widthAndHeight = new Coordinates(widthAndHeight);
                    result.add(widthAndHeight);
                } else {
                    break;
                }
            }
            widthAndHeight.z = currentColumnSize;
        }
        return result;
    }

    private static final class Coordinates {

        private int x, z;

        private Coordinates() {}

        private Coordinates(int x, int z) {
            this.x = x;
            this.z = z;
        }

        private Coordinates(Coordinates src) {
            this(src.x, src.z);
        }
    }
}