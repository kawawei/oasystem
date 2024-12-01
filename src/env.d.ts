/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'vue-echarts' {
  import type { ComponentOptions } from 'vue'
  const component: ComponentOptions
  export default component
}

declare module 'echarts/core'
declare module 'echarts/renderers'
declare module 'echarts/charts'
declare module 'echarts/components' 