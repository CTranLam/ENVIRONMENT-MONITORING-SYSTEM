package com.iot.ptit.base.utils;

import java.time.DateTimeException;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Year;
import java.time.YearMonth;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.ResolverStyle;

/** Converts a local timestamp prefix into a whole calendar unit in the browser timezone. */
public final class HistoryTimeSearch {
    private HistoryTimeSearch() { }

    public static TimeRange parse(String search, String timeZone) {
        if (search == null || search.isBlank()) {
            return null;
        }
        ZoneId zone;
        try {
            zone = timeZone == null || timeZone.isBlank() ? ZoneId.of("UTC") : ZoneId.of(timeZone);
        } catch (DateTimeException exception) {
            zone = ZoneId.of("UTC");
        }
        String value = search.trim().replace('T', ' ');
        try {
            LocalDateTime start;
            LocalDateTime end;
            switch (value.length()) {
                case 4 -> {
                    start = Year.parse(value).atDay(1).atStartOfDay();
                    end = start.plusYears(1);
                }
                case 7 -> {
                    start = YearMonth.parse(value).atDay(1).atStartOfDay();
                    end = start.plusMonths(1);
                }
                case 10 -> {
                    start = LocalDate.parse(value).atStartOfDay();
                    end = start.plusDays(1);
                }
                case 13, 16, 19 -> {
                    String pattern = switch (value.length()) {
                        case 13 -> "uuuu-MM-dd HH";
                        case 16 -> "uuuu-MM-dd HH:mm";
                        default -> "uuuu-MM-dd HH:mm:ss";
                    };
                    start = LocalDateTime.parse(value, DateTimeFormatter.ofPattern(pattern)
                            .withResolverStyle(ResolverStyle.STRICT));
                    end = switch (value.length()) {
                        case 13 -> start.plusHours(1);
                        case 16 -> start.plusMinutes(1);
                        default -> start.plusSeconds(1);
                    };
                }
                default -> {
                    // Preserve support for absolute ISO timestamps supplied by API clients.
                    Instant instant = Instant.parse(search.trim());
                    return new TimeRange(instant, instant.plusSeconds(1));
                }
            }
            return new TimeRange(start.atZone(zone).toInstant(), end.atZone(zone).toInstant());
        } catch (DateTimeException exception) {
            return null;
        }
    }

    /** Half-open bounds include fractional seconds without including the next unit. */
    public record TimeRange(Instant start, Instant endExclusive) { }
}
