import DefaultTheme from "vitepress/theme"
import Card from "./components/Card.vue"
import Figure from "./components/Figure.vue"
import Grid from "./components/Grid.vue"
import Ink from "./components/Ink.vue"
import Picture from "./components/Picture.vue"
import "./style.css"

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component("Card", Card)
    app.component("Figure", Figure)
    app.component("Grid", Grid)
    app.component("Ink", Ink)
    app.component("Picture", Picture)
  },
}
