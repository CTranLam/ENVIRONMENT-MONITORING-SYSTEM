package com.iot.ptit.custom.dto.actionhistory;

import java.util.List;

/**
 * Paginated envelope for the device control history table. Field names match the web
 * client contract ({@code items}, {@code total}, {@code page}, {@code pageSize},
 * {@code totalPages}).
 */
public record PaginatedActionHistoryResponse(
        List<ActionHistoryRecordResponse> items,
        long total,
        int page,
        int pageSize,
        int totalPages
) {
    public static PaginatedActionHistoryResponse of(
            List<ActionHistoryRecordResponse> items,
            long total,
            int page,
            int pageSize
    ) {
        int totalPages = pageSize <= 0 ? 1 : (int) Math.max(1, (total + pageSize - 1) / pageSize);
        return new PaginatedActionHistoryResponse(items, total, page, pageSize, totalPages);
    }
}
