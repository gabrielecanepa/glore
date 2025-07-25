'use client'

import emojiMartData, { type EmojiMartData } from '@emoji-mart/data'
import { EmojiInputPlugin, EmojiPlugin } from '@platejs/emoji/react'

import { EmojiInputElement } from '#rte/blocks/emoji-node'

export const EmojiKit = [
  EmojiPlugin.configure({
    options: { data: emojiMartData as EmojiMartData },
  }),
  EmojiInputPlugin.withComponent(EmojiInputElement),
]
