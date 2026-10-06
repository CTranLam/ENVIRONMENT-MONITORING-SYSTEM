package com.iot.ptit.base.entity;

import java.security.SecureRandom;
import java.util.UUID;

/** Generates RFC 9562 UUID version 7 values in the application layer. */
public final class UuidV7Generator {
    private static final SecureRandom RANDOM = new SecureRandom();

    private UuidV7Generator() {
    }

    public static UUID next() {
        long timestamp = System.currentTimeMillis() & 0xFFFF_FFFF_FFFFL;
        long mostSignificantBits = (timestamp << 16) | 0x7000L | RANDOM.nextInt(0x1000);
        long leastSignificantBits = (RANDOM.nextLong() & 0x3FFF_FFFF_FFFF_FFFFL)
                | 0x8000_0000_0000_0000L;
        return new UUID(mostSignificantBits, leastSignificantBits);
    }
}
