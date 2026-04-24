package com.business.util;

import java.util.Locale;

public final class MemoryTypeUtils {

    private MemoryTypeUtils() {
    }

    public static String normalize(String memoryType) {
        if (memoryType == null || memoryType.trim().isEmpty()) {
            return "DEFAULT";
        }

        return memoryType.trim().replaceAll("\\s+", "").toUpperCase(Locale.ROOT);
    }

    public static boolean matches(String left, String right) {
        return normalize(left).equals(normalize(right));
    }
}
