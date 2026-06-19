/** 画面切り替え管理 */

const SCREENS = ["screen-home", "screen-game", "screen-result", "screen-book"];

export function showScreen(screenId) {
  for (const id of SCREENS) {
    const el = document.getElementById(id);
    if (!el) continue;
    if (id === screenId) {
      el.style.display = "flex";
      el.classList.add("active");
    } else {
      el.style.display = "none";
      el.classList.remove("active");
    }
  }
}

export function hideAll() {
  for (const id of SCREENS) {
    const el = document.getElementById(id);
    if (el) {
      el.style.display = "none";
      el.classList.remove("active");
    }
  }
}
