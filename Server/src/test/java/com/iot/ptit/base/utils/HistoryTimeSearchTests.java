package com.iot.ptit.base.utils;

import org.junit.jupiter.api.Test;
import java.time.Instant;
import static org.junit.jupiter.api.Assertions.*;

class HistoryTimeSearchTests {
    @Test
    void expandsEachPrecisionInBrowserTimezone() {
        String[] searches = {"2026", "2026-10", "2026-10-21", "2026-10-21 13", "2026-10-21 13:40", "2026-10-21 13:40:32"};
        String[] starts = {"2025-12-31T17:00:00Z", "2026-09-30T17:00:00Z", "2026-10-20T17:00:00Z", "2026-10-21T06:00:00Z", "2026-10-21T06:40:00Z", "2026-10-21T06:40:32Z"};
        String[] ends = {"2026-12-31T17:00:00Z", "2026-10-31T17:00:00Z", "2026-10-21T17:00:00Z", "2026-10-21T07:00:00Z", "2026-10-21T06:41:00Z", "2026-10-21T06:40:33Z"};
        for (int i = 0; i < searches.length; i++) {
            var range = HistoryTimeSearch.parse(searches[i], "Asia/Ho_Chi_Minh");
            assertNotNull(range, searches[i]);
            assertEquals(Instant.parse(starts[i]), range.start(), searches[i]);
            assertEquals(Instant.parse(ends[i]), range.endExclusive(), searches[i]);
        }
    }

    @Test
    void rejectsInvalidDatesAndHandlesLeapYearsAndDst() {
        assertNull(HistoryTimeSearch.parse("2026-02-30 13:40:32", "UTC"));
        assertNull(HistoryTimeSearch.parse("2026-10-21 25", "UTC"));
        assertNull(HistoryTimeSearch.parse("invalid", "UTC"));
        var leap = HistoryTimeSearch.parse("2024-02", "UTC");
        assertEquals(Instant.parse("2024-03-01T00:00:00Z"), leap.endExclusive());
        var dst = HistoryTimeSearch.parse("2026-03-08", "America/New_York");
        assertEquals(23 * 3600, dst.endExclusive().getEpochSecond() - dst.start().getEpochSecond());
        var iso = HistoryTimeSearch.parse("2026-10-21T06:40:32Z", "UTC");
        assertEquals(Instant.parse("2026-10-21T06:40:33Z"), iso.endExclusive());
    }
}
