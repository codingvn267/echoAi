"use client";

import { useEffect, useRef } from "react";

/**
 * Tracks which message ids have already been rendered so the caller can
 * animate only genuinely new messages appended to the tail (e.g. a reply
 * arriving in real time) — never the initial batch on mount, and never
 * older messages prepended by infinite-scroll pagination.
 *
 * Detection strategy: on every render we compare the previous first message
 * id to the current first message id. If the first id changed AND the old
 * first id is still present later in the list, that render was a pagination
 * prepend, so nothing is marked "new" for it. Otherwise, any id not already
 * in the "ever seen" set is a genuine tail append and is marked "new".
 */
export function useNewMessageIds(messageIds: string[]) {
  const everSeenIdsRef = useRef<Set<string>>(new Set());
  const prevFirstIdRef = useRef<string | null>(null);
  const hasMountedRef = useRef(false);

  const isPaginationPrepend =
    hasMountedRef.current &&
    prevFirstIdRef.current !== null &&
    messageIds.length > 0 &&
    messageIds[0] !== prevFirstIdRef.current &&
    messageIds.includes(prevFirstIdRef.current);

  const isNewMessage = (id: string) =>
    hasMountedRef.current && !isPaginationPrepend && !everSeenIdsRef.current.has(id);

  // Commit this render's ids for the *next* render only, after React has
  // actually committed this one — never mutate refs during render itself.
  useEffect(() => {
    messageIds.forEach((id) => everSeenIdsRef.current.add(id));
    prevFirstIdRef.current = messageIds[0] ?? prevFirstIdRef.current;
    hasMountedRef.current = true;
  });

  return isNewMessage;
}
