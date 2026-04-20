import './style.css'
import typescriptLogo from './assets/typescript.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import { setupThemeChange, setupThemeClear } from './theme.ts'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
<section id="center">
  <div class="hero">
    <img src="${heroImg}" class="base" width="170" height="179">
    <img src="${typescriptLogo}" class="framework" alt="TypeScript logo"/>
    <img src="${viteLogo}" class="vite" alt="Vite logo" />
  </div>
  <div>
    <h1>Get started</h1>
    <p>Edit <code>src/main.ts</code> and save to test <code>HMR</code></p>
  </div>
  <button id="theme-change" type="button" class="highlight"></button>

  <button id="theme-clear" type="button" class="highlight"></button>
</section>

<div class="ticks"></div>
<section id="spacer"></section>
`

setupThemeChange(document.querySelector<HTMLButtonElement>('#theme-change')!)

setupThemeClear(document.querySelector<HTMLButtonElement>('#theme-clear')!)
