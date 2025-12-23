import { defineConfig, presetUno, presetIcons } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetIcons({
      scale: 1.2,
    }),
  ],
  theme: {
    colors: {
      primary: {
        DEFAULT: '#c83737', // 中国红
        light: '#e85252',
        dark: '#a82727',
      },
      gold: {
        DEFAULT: '#d4a543', // 金色
        light: '#f0c060',
        dark: '#b88a2d',
      },
      ink: {
        DEFAULT: '#2c2c2c', // 墨色
        light: '#4a4a4a',
        dark: '#1a1a1a',
      },
    },
  },
  shortcuts: {
    'flex-center': 'flex items-center justify-center',
    'flex-between': 'flex items-center justify-between',
    'text-gradient': 'bg-gradient-to-r from-primary to-gold bg-clip-text text-transparent',
  },
})
