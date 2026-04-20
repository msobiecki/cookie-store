import { createCookieStore } from "@msobiecki/cookie-store";

const getCookieStore = createCookieStore({ adapter: "browser" });

export async function setupThemeChange(element: HTMLButtonElement) {
  const cookieStore = await getCookieStore();
  let theme = await cookieStore.get("theme");

  const updateUI = (value?: string) => {
    theme = value;
    element.innerHTML = `Theme is ${theme || "not set"}`;
  };

  const setTheme = (newTheme: string) => {
    updateUI(newTheme);
    cookieStore.set("theme", newTheme, {
       maxAge: 1000 * 60 * 60 * 24, // 1 day
    });
  };

  element.addEventListener("click", () =>
    setTheme(theme === "light" ? "dark" : "light"),
  );

  cookieStore.subscribeChange?.((event) => {
    const changed = event.changed.find((c) => c.name === "theme");
    if (changed) {
      updateUI(changed.value);
      return;
    }

    const deleted = event.deleted.find((c) => c.name === "theme");
    if (deleted) {
      updateUI(undefined);
    }
  });

  updateUI(theme);
}

export async function setupThemeClear(element: HTMLButtonElement) {
  const cookieStore = await getCookieStore();

  const clearTheme = async () => {
    await cookieStore.delete("theme");
  }
  
  element.innerHTML = "Remove theme";
  element.addEventListener('click', () => clearTheme());
}
