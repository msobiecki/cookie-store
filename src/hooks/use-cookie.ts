import { useCallback } from "react";

import { useCookies } from "./use-cookies";

export function useCookie(name: string) {
  const { get, set, remove } = useCookies();

  const value = useCallback(() => get(name), [name, get]);

  const setValue = useCallback(
    (newValue: string) => {
      set(name, newValue);
    },
    [name, set],
  );

  const removeValue = useCallback(() => {
    remove(name);
  }, [name, remove]);

  return [value, setValue, removeValue] as const;
}
