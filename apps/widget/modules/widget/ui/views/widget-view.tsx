"use client";

import { WidgetAuthScreen } from "../screens/widget-auth-screen";
import { useAtomValue } from "jotai";
import { screenAtom } from "../../atoms/widget_atoms";
import { WidgetErrorScreen } from "../screens/widget-error-screen";
import { WidgetLoadingScreen } from "../screens/widget-loading-screen";
import { WidgetSelectionScreen } from "../screens/widget-selection-screen";
import { WidgetChatScreen } from "../screens/widget-chat-screen";
import { WidgetInboxScreen } from "../screens/widget-inbox-screen";
import { WidgetVoiceScreen } from "../screens/widget-voice-screen";
import { WidgetContactScreen } from "../screens/widget-contact-screen";
import { motion, useReducedMotion } from "motion/react";
import { useEffect } from "react";

interface Props {
  organizationId: string | null;
}

export const WidgetView = ({ organizationId }: Props) => {
  const screen = useAtomValue(screenAtom);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const closeFromKeyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape" && window.parent !== window) {
        window.parent.postMessage({ type: "helora:close" }, "*");
      }
    };

    document.addEventListener("keydown", closeFromKeyboard);
    return () => document.removeEventListener("keydown", closeFromKeyboard);
  }, []);

  const screenComponents = {
    error: <WidgetErrorScreen />,
    loading: <WidgetLoadingScreen organizationId={organizationId} />,
    auth: <WidgetAuthScreen />,
    voice: <WidgetVoiceScreen />,
    inbox: <WidgetInboxScreen />,
    selection: <WidgetSelectionScreen />,
    chat: <WidgetChatScreen />,
    contact: <WidgetContactScreen />,
  };
  return (
    <main className="widget-aurora h-dvh-safe w-screen flex flex-col overflow-hidden rounded-xl border bg-muted">
      {/* Keyed by screen so Motion replays a short enter-only transition on
          every screen change. No AnimatePresence/exit animation: content is
          always present immediately, avoiding any blank-frame gap, and
          input focus / component height are unaffected. */}
      <motion.div
        key={screen}
        initial={reduceMotion ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-1 flex-col overflow-hidden"
      >
        {screenComponents[screen]}
      </motion.div>
    </main>
  );
};
